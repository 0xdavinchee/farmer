//SPDX-License-Identifier: MIT

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

/// @title Farmer is an abstract contract representing a few possible actions one would carry
/// out while tending the crops.
/// @author 0xdavinchee
abstract contract Farmer is Ownable {
    /** @dev Allows this contract to interact with an LP contract
     * and convert the necessary assets to get LP tokens in return.
     */
    function getLPTokens(address _lpContract, uint256 _maxAmount)
        external
        virtual;

    /** @dev Allows this contract to interact with an LP contract and
     * stake their LP tokens as dictated by the _lpContract.
     */
    function addLiquidityPosition(address _lpContract) external virtual;

    /** @dev Allows this contract to interact with an LP contract and
     * unstake a liquidity position as dictated by the _lpContract.
     */
    function removeLiquidityPosition(address _lpContract, uint256 _amount)
        external
        virtual;

    /** @dev Allows this contract to claim any rewards granted from
     * providing liquidity.
     */
    function claimRewards(address _lpContract, uint256 _amount)
        external
        virtual;

    /** @dev Gets the LPBalance of this contract.
     */
    function lpBalance(address _lpContract)
        external
        virtual
        returns (uint256 _balance);

    /** @dev Swaps the claimed rewards for equal amounts of the LP assets
     * you need from an LP contract.
     */
    function swapRewardsForLPAssets(address _lpContract, uint256 _amount)
        external
        virtual;

    /** @dev Swaps _amount of LP Tokens for the underlying assets. */
    function swapLPTokensForAssets(address _lpContract, uint256 _amount)
        external
        virtual;

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
