//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import {IUniswapV2Router02} from "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

/// @title Farmer is an abstract contract representing a few possible actions one would carry
/// out while tending the crops.
/// @author 0xdavinchee
abstract contract Farmer is Ownable {
    using SafeMath for uint256;

    struct CreateLPData {
        uint256 pid;
        uint256 slippage;
        uint256 amountADesired;
        uint256 amountBDesired;
        address tokenA;
        address tokenB;
    }

    struct RewardsForLPData {
        uint256 pid;
        uint256 slippage;
        address rewardToken;
        address tokenA;
        address tokenB;
        address[] tokenAPath; // first addr: _rewardToken, last addr: _tokenA
        address[] tokenBPath; // first addr: _rewardToken, last addr: _tokenB
    }

    uint256 public constant ONE_HUNDRED_PERCENT = 1000;
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
        uint256 _slippage
    ) public virtual returns (address, uint256);

    /** @dev Allows this contract to interact with a pair contract
     * and add liquidity to a pair by converting the necessary
     * assets to get LP tokens in return, used if ETH is one of the
     * pair's tokens (or whatever the native token is for that chain).
     */
    function getLPTokensETH(
        address _token,
        uint256 _amountTokensDesired,
        uint256 _amountETHMin,
        uint256 _slippage
    ) public payable virtual returns (uint256);

    /** @dev Swaps LP tokens owned by this contract in exchange
     * for the underlying tokens.
     */
    function removeLP(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external virtual;

    /** @dev Swaps LP tokens owned by this contract in exchange
     * for the underlying tokens. Used if ETH is one of the pair's
     * tokens.
     */
    function removeLPETH(
        address _token,
        uint256 _liquidity,
        uint256 _amountTokenMin,
        uint256 _amountETHMin
    ) external virtual;

    /** @dev Deposits LP tokens into a farm for rewards, i.e. Onsen on
     * Sushi.
     */
    function depositLP(
        address _lpToken,
        uint256 _pid,
        uint256 _amount
    ) public virtual;

    /** @dev Withdraws LP tokens from a farm.
     */
    function withdrawLP(uint256 _pid, uint256 _amount) public virtual;

    /** @dev Allows this contract to claim any rewards granted from
     * providing liquidity.
     */
    function claimRewards(uint256 _amount) public virtual;

    /** @dev Gets the LP token balance of the pair you are providing
     *liquidity for.
     */
    function lpBalance(address _pair)
        external
        virtual
        returns (uint256 balance);

    /** @dev Swaps the claimed rewards for equal amounts of the LP assets
     * you need from an LP contract.
     */
    function swapRewardsForLPAssets(bytes calldata data)
        internal
        virtual
        returns (address pair, uint256 liquidity);

    /** @dev Takes in an array of asset addresses, an array of amounts of
     * these assets and an output asset address, allows the user to swap
     * multiple assets into one single asset.
     */
    function swapAssetsForAsset(
        address[] calldata _inputAssets,
        uint256[] calldata _amounts,
        address _outputAsset
    ) external virtual;

    /** @dev Allows the owner of the contract to withdraw ERC20s. */
    function withdrawFunds(address _asset, uint256 _amount) external virtual;

    /** @dev Allows the owner of the contract to withdraw ETH. */
    function withdrawETH() external payable virtual;

    /** @dev A Helper function for getting the minimum amount of tokens
     * to receive given a desired amount and slippage as expressed in
     * percentage.
     */
    function _getMinAmount(uint256 _amountDesired, uint256 _slippage)
        internal
        pure
        returns (uint256)
    {
        return _amountDesired.mul(_slippage).div(ONE_HUNDRED_PERCENT);
    }
}
