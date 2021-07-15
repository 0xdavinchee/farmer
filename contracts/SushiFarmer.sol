//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import {UniswapV2Library} from "@sushiswap/core/contracts/uniswapv2/libraries/UniswapV2Library.sol";
import {IMiniChefV2} from "./interfaces/IMiniChefV2.sol";
import {Farmer} from "./Farmer.sol";

contract SushiFarmer is
    Farmer(IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506))
{
    IMiniChefV2 public chef;

    constructor(IMiniChefV2 _chef) public {
        chef = _chef;
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
        RewardsForTokensPaths[] calldata _data
    ) external onlyOwner {
        _claimRewards(_pid);

        // _data will always be length = 2.
        for (uint256 i = 0; i < _data.length; i++) {
            uint256[] memory amounts = _swapRewardsForLPAssets(_data[i]);
        }

        address token0 = _data[0].token0Path[_data[0].token0Path.length - 1];
        address token1 = _data[0].token1Path[_data[0].token1Path.length - 1];

        CreateLPData memory data;
        data.pid = _pid;
        data.token0 = token0;
        data.token1 = token1;
        data.amountADesired = IERC20(token0).balanceOf(address(this));
        data.amountBDesired = IERC20(token1).balanceOf(address(this));
        _createNewLPAndDeposit(data);
    }

    function claimRewards(uint256 _pid) external override onlyOwner {
        _claimRewards(_pid);
    }

    function removeLP(
        address _token0,
        address _token1,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external override onlyOwner {
        address pair = UniswapV2Library.pairFor(
            router.factory(),
            _token0,
            _token1
        );
        IERC20(pair).approve(pair, _liquidity);
        (uint256 amountA, uint256 amountB) = router.removeLiquidity(
            _token0,
            _token1,
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
    ) public payable override returns (uint256) {
        require(
            msg.sender == address(this) || msg.sender == owner(),
            "SushiFarmer: You dont have permission to call this function."
        );
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
        address _token0,
        address _token1,
        uint256 _amountADesired,
        uint256 _amountBDesired
    ) external onlyOwner returns (uint256) {
        return _getLPTokens(_token0, _token1, _amountADesired, _amountBDesired);
    }

    function _getLPTokens(
        address _token0,
        address _token1,
        uint256 _amountADesired,
        uint256 _amountBDesired
    ) internal override returns (uint256) {
        IERC20(_token0).approve(address(router), _amountADesired);
        IERC20(_token1).approve(address(router), _amountBDesired);
        (uint256 amountA, uint256 amountB, uint256 liquidity) = router
        .addLiquidity(
            _token0,
            _token1,
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
            data.token0,
            data.token1,
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
        address rewardToken = data.token0Path[0];
        // approve reward token spend by the router for this txn
        IERC20(rewardToken).approve(
            address(router),
            IERC20(rewardToken).balanceOf(address(this))
        );

        uint256 splitRewardsBalance = IERC20(rewardToken)
        .balanceOf(address(this))
        .div(2);

        // swap reward tokens for token A
        uint256[] memory amounts0 = _swapExactRewardsForTokens(
            splitRewardsBalance,
            data.token0Path
        );

        // swap reward tokens for token B
        uint256[] memory amounts1 = _swapExactRewardsForTokens(
            splitRewardsBalance,
            data.token1Path
        );
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
