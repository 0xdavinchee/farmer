//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

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
        address _to,
        uint256 _deadline
    ) public override {}

    function getLPTokensWETH(
        address _token,
        uint256 _amountTokenDesired,
        uint256 _amountETHMin,
        address _to,
        uint256 _deadline
    ) public override {}

    function removeLP(
        address _tokenA,
        address _tokenB,
        uint256 _amountAMin,
        uint256 _amountBMin,
        address _to,
        uint256 _deadline
    ) external override {}

    function removeLPWETH(
        address _token,
        uint256 _amountTokenMin,
        uint256 _amountWETHMin,
        address _to,
        uint256 _deadline
    ) external override {}

    function claimRewards(uint256 _amount) external override {}

    function lpBalance(address _pair)
        external
        override
        returns (uint256 _balance)
    {
        return IUniswapV2Pair(_pair).balanceOf(address(this));
    }

    function swapRewardsForLPAssets(uint256 _amount) external override {}

    function swapLPTokensForAssets(uint256 _amount) external override {}

    function swapAssetsForAsset(
        address[] calldata _inputAssets,
        uint256[] calldata _amounts,
        address _outputAsset
    ) external override {}

    function withdrawFunds(address _asset, uint256 _amount) external override {}
}
