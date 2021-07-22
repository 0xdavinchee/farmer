//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import {UniswapV2Library} from "@sushiswap/core/contracts/uniswapv2/libraries/UniswapV2Library.sol";
import {IMiniChefV2} from "./interfaces/IMiniChefV2.sol";
import {Farmer} from "./Farmer.sol";

/// @title SushiFarmer is a contract which helps with managing a farming position on 
/// Sushiswap. Its main purpose is to automate compounding of your positions. That is,
/// taking the reward(s) earned through staking and swapping these for the underlying
/// assets of your LP position and swapping these for more LP tokens and compounding 
/// your position.
/// @author 0xdavinchee
contract SushiFarmer is
    Farmer(IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506))
{
    IMiniChefV2 public chef;
    IERC20 public rewardTokenA;
    IERC20 public rewardTokenB;

    constructor(IMiniChefV2 _chef, IERC20 _rewardTokenA, IERC20 _rewardTokenB) public {
        chef = _chef;
        rewardTokenA = _rewardTokenA;
        rewardTokenB = _rewardTokenB;
    }

    event LPDeposited(uint256 pid, address pair, uint256 amount);

    /** @dev This function allows the user to create a new LP position as
     * long as the contract holds enough tokens given the desired amounts
     * and slippage allowance.
     */
    function createNewLPAndDeposit(CreateLPData calldata _data)
        external
        onlyOwner
    {
        _createNewLPAndDeposit(_data);
    }

    /** @dev This function allows the user to compound an existing LP
     * position by harvesting any pending rewards with the MiniChef
     * contract, swapping the rewards for the underlying LP assets,
     * swapping these assets for the LP token and then depositing into
     * the LP.
     */
    function autoCompoundExistingLPPosition(
        uint256 _pid,
        address _pair,
        RewardsForTokensPaths[] calldata _data
    ) external onlyOwner {
        _claimRewards(_pid);

        // _data will always be length = 2.
        for (uint256 i = 0; i < _data.length; i++) {
            uint256[] memory amounts = _swapRewardsForLPAssets(_data[i]);
        }

        address tokenA = _data[0].tokenAPath[_data[0].tokenAPath.length - 1];
        address tokenB = _data[0].tokenBPath[_data[0].tokenBPath.length - 1];
        (address token0, address token1) = UniswapV2Library.sortTokens(tokenA, tokenB);
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(_pair).getReserves();

        uint256 amount0 = IERC20(token0).balanceOf(address(this));
        uint256 amount1 = router.quote(amount0, reserve0, reserve1);
        uint256 token1Balance = IERC20(token1).balanceOf(address(this));
        if (amount1 > token1Balance) {
            amount1 = token1Balance;
            amount0 = router.quote(amount1, reserve1, reserve0);
        }

        CreateLPData memory data;
        data.pid = _pid;
        data.pair = _pair;
        data.tokenA = token0;
        data.tokenB = token1;
        data.amountADesired = amount0;
        data.amountBDesired = amount1;
        _createNewLPAndDeposit(data);
    }

    function claimRewards(uint256 _pid) external override onlyOwner {
        _claimRewards(_pid);
    }

    function removeLP(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external override onlyOwner {
        address pair = UniswapV2Library.pairFor(
            router.factory(),
            _tokenA,
            _tokenB
        );
        IERC20(pair).approve(address(router), _liquidity);
        (uint256 amountA, uint256 amountB) = router.removeLiquidity(
            _tokenA,
            _tokenB,
            _liquidity,
            _amountAMin,
            _amountBMin,
            address(this),
            block.timestamp
        );
    }

    function removeLPETH(
        address _token,
        uint256 _liquidity,
        uint256 _amountTokensMin,
        uint256 _amountETHMin
    ) external override onlyOwner {
        address pair = UniswapV2Library.pairFor(
            router.factory(),
            _token,
            router.WETH()
        );
        IERC20(pair).approve(address(router), _liquidity);
        (uint256 amountToken, uint256 amountETH) = router.removeLiquidityETH(
            _token,
            _liquidity,
            _amountTokensMin,
            _amountETHMin,
            address(this),
            block.timestamp
        );
    }

    function lpBalance(address _pair)
        external
        override
        returns (uint256 _balance)
    {
        return IUniswapV2Pair(_pair).balanceOf(address(this));
    }

    function setOwner(address _newOwner) external override onlyOwner {
        transferOwnership(_newOwner);
    }

    function withdrawETH() external payable override onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "SushiFarmer: ETH Withdrawal failed.");
    }

    function withdrawFunds(address _asset, uint256 _amount)
        external
        override
        onlyOwner
    {
        bool success = IERC20(_asset).transfer(msg.sender, _amount);
        require(success, "SushiFarmer: Withdrawal failed.");
    }

    function withdrawLP(uint256 _pid, uint256 _amount)
        public
        override
        onlyOwner
    {
        chef.withdraw(_pid, _amount, address(this));
    }

    function getLPTokensETH(
        address _token,
        uint256 _amountTokensDesired,
        uint256 _amountETHMin,
        uint256 _slippage
    ) public onlyOwner payable override returns (uint256) {
        return _getLPTokensETH(_token, _amountTokensDesired, _amountETHMin, _slippage);
    }

    function _getLPTokensETH(
        address _token,
        uint256 _amountTokensDesired,
        uint256 _amountETHMin,
        uint256 _slippage
    ) internal returns (uint256) {
        IERC20(_token).approve(address(router), _amountTokensDesired);
        uint256 amountTokenMin = _getMinAmount(_amountTokensDesired, _slippage);
        (uint256 amountToken, uint256 amountWETH, uint256 liquidity) = router
        .addLiquidityETH(
            _token,
            _amountTokensDesired,
            amountTokenMin,
            _amountETHMin,
            address(this),
            block.timestamp
        );
        return liquidity;
    }

    /** @dev Really only to be used for testing. */
    function getLPTokens(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired
    ) external onlyOwner returns (uint256) {
        return _getLPTokens(_tokenA, _tokenB, _amountADesired, _amountBDesired);
    }

    function _getLPTokens(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired
    ) internal override returns (uint256) {
        IERC20(_tokenA).approve(address(router), _amountADesired);
        IERC20(_tokenB).approve(address(router), _amountBDesired);
        (uint256 amountA, uint256 amountB, uint256 liquidity) = router
        .addLiquidity(
            _tokenA,
            _tokenB,
            _amountADesired,
            _amountBDesired,
            _amountADesired,
            _amountBDesired,
            address(this),
            block.timestamp
        );
        return liquidity;
    }

    function _createNewLPAndDeposit(CreateLPData memory _data) internal {
        CreateLPData memory data = _data;
        uint256 liquidity = _getLPTokens(
            data.tokenA,
            data.tokenB,
            data.amountADesired,
            data.amountBDesired
        );
        _depositLP(data.pair, data.pid, liquidity);

        emit LPDeposited(data.pid, data.pair, liquidity);
    }

    function _depositLP(
        address _lpToken,
        uint256 _pid,
        uint256 _amount
    ) internal override {
        IERC20(_lpToken).approve(address(chef), _amount);
        chef.deposit(_pid, _amount, address(this));
    }

    function _claimRewards(uint256 _pid) internal {
        chef.harvest(_pid, address(this));
    }

    function _swapRewardsForLPAssets(RewardsForTokensPaths calldata _data)
        internal
        override
        returns (uint256[] memory)
    {
        RewardsForTokensPaths calldata data = _data;
        address rewardToken = data.tokenAPath[0];
        // approve reward token spend by the router for this txn
        IERC20(rewardToken).approve(
            address(router),
            IERC20(rewardToken).balanceOf(address(this))
        );

        uint256 splitRewardsBalance = IERC20(rewardToken)
        .balanceOf(address(this))
        .div(2);

        // swap reward tokens for token A
        // however, if for example, we receive Sushi as a reward and Sushi is 
        // also one of the underlying assets, there is no need to swap this reward
        if (data.tokenAPath[0] != data.tokenAPath[data.tokenAPath.length - 1]) {
            uint256[] memory amounts0 = _swapExactRewardsForTokens(
                splitRewardsBalance,
                data.tokenAPath
            );
        }

        // swap reward tokens for token B
        if (data.tokenBPath[0] != data.tokenBPath[data.tokenBPath.length - 1]) {
            uint256[] memory amounts1 = _swapExactRewardsForTokens(
                splitRewardsBalance,
                data.tokenBPath
            );
        }
    }
    receive() external payable {

    }

    function _swapExactRewardsForTokens(
        uint256 _splitRewardsBalance,
        address[] calldata _path
    ) internal returns (uint256[] memory) {
        uint256[] memory amountsOut = router.getAmountsOut(
            _splitRewardsBalance,
            _path
        );
        uint256[] memory amounts = router.swapExactTokensForTokens(
            _splitRewardsBalance,
            amountsOut[amountsOut.length - 1],
            _path,
            address(this),
            block.timestamp
        );

        return amounts;
    }
}
