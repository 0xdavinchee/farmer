//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router02} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import {UniswapV2Library} from "@sushiswap/core/contracts/uniswapv2/libraries/UniswapV2Library.sol";
import {Farmer} from "./Farmer.sol";

contract SushiFarmer is
    Farmer(IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506))
{
    function getLPTokens(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        uint256 _slippage
    ) public override onlyOwner {
        uint256 amountAMin = _getMinAmount(_amountADesired, _slippage);
        uint256 amountBMin = _getMinAmount(_amountBDesired, _slippage);
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
    }

    function getLPTokensETH(
        address _token,
        uint256 _amountTokensDesired,
        uint256 _amountETHMin,
        uint256 _slippage
    ) public payable override onlyOwner {
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
    }

    function removeLP(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external override onlyOwner {
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

    function claimRewards(uint256 _amount) external override onlyOwner {}

    function lpBalance(address _pair)
        external
        override
        returns (uint256 _balance)
    {
        return IUniswapV2Pair(_pair).balanceOf(address(this));
    }

    function swapRewardsForLPAssets(
        address _rewardToken,
        address _tokenA,
        address _tokenB,
        address[] calldata _tokenAPath,
        address[] calldata _tokenBPath
    ) external override onlyOwner {
    }

    function swapLPTokensForAssets(uint256 _amount)
        external
        override
        onlyOwner
    {}

    function swapAssetsForAsset(
        address[] calldata _inputAssets,
        uint256[] calldata _amounts,
        address _outputAsset
    ) external override {}

    function withdrawFunds(address _asset, uint256 _amount)
        external
        override
        onlyOwner
    {}
}
