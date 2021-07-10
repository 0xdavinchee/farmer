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

    /** @dev This function allows the user to create a new LP position as
     * long as the contract holds enough tokens given the desired amounts
     * and slippage allowance.
     */
    function createNewLPAndDeposit(bytes calldata _data) external onlyOwner {
        CreateLPData memory data = abi.decode(_data, (CreateLPData));
        (address pair, uint256 liquidity) = getLPTokens(
            data.tokenA,
            data.tokenB,
            data.amountADesired,
            data.amountBDesired,
            data.slippage
        );
        depositLP(pair, data.pid, liquidity);
    }

    /** @dev This function allows the user to compound an existing LP
     * position by harvesting any pending rewards with the MiniChef
     * contract, swapping the rewards for the underlying LP assets,
     * swapping these assets for the LP token and then depositing into
     * the LP.
     */
    function autoCompoundExistingLPPosition(bytes calldata _data)
        external
        onlyOwner
    {
        RewardsForLPData memory data = abi.decode(_data, (RewardsForLPData));
        claimRewards(data.pid);
        (address pair, uint256 liquidity) = swapRewardsForLPAssets(_data);
        depositLP(pair, data.pid, liquidity);
    }

    function getLPTokens(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        uint256 _slippage
    ) public override onlyOwner returns (address, uint256) {
        address pair = UniswapV2Library.pairFor(
            router.factory(),
            _tokenA,
            _tokenB
        );
        uint256 amountAMin = _getMinAmount(_amountADesired, _slippage);
        uint256 amountBMin = _getMinAmount(_amountBDesired, _slippage);

        IERC20(_tokenA).approve(pair, amountAMin);
        IERC20(_tokenB).approve(pair, amountBMin);

        (uint256 amountA, uint256 amountB, uint256 liquidity) = router
        .addLiquidity(
            _tokenA,
            _tokenB,
            _amountADesired,
            _amountBDesired,
            amountAMin,
            amountBMin,
            address(this),
            block.timestamp
        );
        return (pair, liquidity);
    }

    function getLPTokensETH(
        address _token,
        uint256 _amountTokensDesired,
        uint256 _amountETHMin,
        uint256 _slippage
    ) public payable override onlyOwner returns (uint256) {
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
        IERC20(pair).approve(pair, _liquidity);
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
        (uint256 amountToken, uint256 amountETH) = router.removeLiquidityETH(
            _token,
            _liquidity,
            _amountTokensMin,
            _amountETHMin,
            address(this),
            block.timestamp
        );
    }

    function depositLP(
        address _lpToken,
        uint256 _pid,
        uint256 _amount
    ) public override onlyOwner {
        IERC20(_lpToken).approve(address(chef), _amount);
        chef.deposit(_pid, _amount, address(this));
    }

    function withdrawLP(uint256 _pid, uint256 _amount)
        public
        override
        onlyOwner
    {
        chef.withdraw(_pid, _amount, address(this));
    }

    function claimRewards(uint256 _pid) public override onlyOwner {
        chef.harvest(_pid, address(this));
    }

    function lpBalance(address _pair)
        external
        override
        returns (uint256 _balance)
    {
        return IUniswapV2Pair(_pair).balanceOf(address(this));
    }

    function swapRewardsForLPAssets(bytes calldata _data)
        internal
        override
        onlyOwner
        returns (address, uint256)
    {
        RewardsForLPData memory data = abi.decode(_data, (RewardsForLPData));
        // approve reward token spend by the router for this txn
        IERC20(data.rewardToken).approve(
            address(router),
            IERC20(data.rewardToken).balanceOf(address(this))
        );

        uint256 splitRewardsBalance = IERC20(data.rewardToken)
        .balanceOf(address(this))
        .div(2);
        (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(
            router.factory(),
            data.tokenA,
            data.tokenB
        );
        {
            // we maybe should calculate this outside
            uint256[] memory amountsOutA = router.getAmountsOut(
                splitRewardsBalance,
                data.tokenAPath
            );

            // swap reward tokens for token A
            uint256[] memory amountsA = router.swapExactTokensForTokens(
                splitRewardsBalance,
                amountsOutA[amountsOutA.length - 1],
                data.tokenAPath,
                address(this),
                block.timestamp
            );

            // Method A: based on the amount of token A we were able to get from 50% of rewards
            // we find out the optimal amount of B to retrieve, then we check if our split rewards
            // is greater than amountB, if it is, we swap the tokens accordingly.
            // if we are unable to we revert the whole txn

            // this is the optimal amount of tokenB in exchange for LP tokens.
            uint256 amountBOptimal = router.quote(
                amountsA[amountsA.length - 1],
                reserveA,
                reserveB
            );

            // we maybe should calculate this outside
            uint256[] memory amountsInB = router.getAmountsIn(
                amountBOptimal,
                data.tokenBPath
            );

            require(
                splitRewardsBalance >= amountsInB[0],
                "SushiFarmer: You don't have enough rewards for the reserves."
            );

            // swap reward tokens for token B to get optimal amount
            router.swapTokensForExactTokens(
                amountBOptimal,
                splitRewardsBalance,
                data.tokenBPath,
                address(this),
                block.timestamp
            );

            // get lp tokens based on swap executed and optimal b amount
            (address pairA, uint256 liquidityA) = getLPTokens(
                data.tokenA,
                data.tokenB,
                amountsA[amountsA.length - 1],
                amountBOptimal,
                data.slippage
            );
            return (pairA, liquidityA);
        }
        {
            // Method B: instead of using amountBOptimal, we simply just trade all
            // 50% of the rewards for token B first, then do a quote on both sides
            // to see which is more likely.
            uint256[] memory amountsOutB = router.getAmountsOut(
                splitRewardsBalance,
                data.tokenBPath
            );

            // swap reward tokens for token B
            uint256[] memory amountsB = router.swapExactTokensForTokens(
                splitRewardsBalance,
                amountsOutB[amountsOutB.length - 1],
                data.tokenBPath,
                address(this),
                block.timestamp
            );

            // this is the optimal amount of tokenA in exchange for LP tokens.
            uint256 amountAOptimal = router.quote(
                amountsB[amountsB.length - 1],
                reserveB,
                reserveA
            );

            (address pairB, uint256 liquidityB) = getLPTokens(
                data.tokenA,
                data.tokenB,
                amountAOptimal,
                amountsB[amountsB.length - 1],
                data.slippage
            );
            return (pairB, liquidityB);
        }
    }

    function swapAssetsForAsset(
        address[] calldata _inputAssets,
        uint256[] calldata _amounts,
        address _outputAsset
    ) external override {}

    function withdrawFunds(address _asset, uint256 _amount)
        external
        override
        onlyOwner
    {
        bool success = IERC20(_asset).transfer(msg.sender, _amount);
        require(success, "SushiFarmer: Withdrawal failed.");
    }

    function withdrawETH() external payable override onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "SushiFarmer: ETH Withdrawal failed.");
    }
}
