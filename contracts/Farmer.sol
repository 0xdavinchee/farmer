//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import {IUniswapV2Router02} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Farmer is an abstract contract representing a few possible actions one would carry
/// out while tending the crops.
/// @author 0xdavinchee
abstract contract Farmer is Ownable {
    IUniswapV2Router02 public router;

    constructor(IUniswapV2Router02 _router) public {
        router = _router;
    }

    /** @dev Allows this contract to interact with a pair contract
     * and add liquidity to a pair by converting the necessary
     * assets to get LP tokens in return.
     */
    function getLPTokens(
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        address _to,
        uint256 _deadline
    ) public virtual;

    /** @dev Allows this contract to interact with a pair contract
     * and add liquidity to a pair by converting the necessary
     * assets to get LP tokens in return, used if WETH is one of the
     * pair's tokens.
     */
    function getLPTokensWETH(
        address _token,
        uint256 _amountTokenDesired,
        uint256 _amountWETHMin,
        address _to,
        uint256 _deadline
    ) public virtual;

    /** @dev Removes an LP position which this contract in exchange
     * for the underlying tokens.
     */
    function removeLP(
        address _tokenA,
        address _tokenB,
        uint256 _amountAMin,
        uint256 _amountBMin,
        address _to,
        uint256 _deadline
    ) external virtual;

    /** @dev Removes an LP position which this contract in exchange
     * for the underlying tokens. Used if WETH is one of the pair's
     * tokens.
     */
    function removeLPWETH(
        address _token,
        uint256 _amountTokenMin,
        uint256 _amountWETHMin,
        address _to,
        uint256 _deadline
    ) external virtual;

    /** @dev Allows this contract to claim any rewards granted from
     * providing liquidity.
     */
    function claimRewards(uint256 _amount) external virtual;

    /** @dev Gets the LP token balance of the pair you are providing
     *liquidity for.
     */
    function lpBalance(address _pair)
        external
        virtual
        returns (uint256 _balance);

    /** @dev Swaps the claimed rewards for equal amounts of the LP assets
     * you need from an LP contract.
     */
    function swapRewardsForLPAssets(uint256 _amount) external virtual;

    /** @dev Swaps _amount of LP Tokens for the underlying assets. */
    function swapLPTokensForAssets(uint256 _amount) external virtual;

    /** @dev Takes in an array of asset addresses, an array of amounts of
     * these assets and an output asset address, allows the user to swap
     * multiple assets into one single asset.
     */
    function swapAssetsForAsset(
        address[] calldata _inputAssets,
        uint256[] calldata _amounts,
        address _outputAsset
    ) external virtual;

    /** @dev Allows the owner of the contract to withdraw funds. */
    function withdrawFunds(address _asset, uint256 _amount) external virtual;
}
