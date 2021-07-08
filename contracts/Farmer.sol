//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

/// @title Farmer is an abstract contract representing a few possible actions one would carry
/// out while tending the crops.
/// @author 0xdavinchee
abstract contract Farmer is Ownable {
    /** @dev Allows this contract to interact with an LP contract and convert
     * the necessary assets to get LP tokens in return.
     */
    function getLPTokens(address _lpContract) virtual external;

    /** @dev Allows this contract to interact with an LP contract and stake their
     * LP tokens as dictated by the _lpContract.
     */
    function addLiquidityPosition(address _lpContract) virtual external;

    /** @dev Allows this contract to interact with an LP contract and remove a
     * liquidity position as dictated by the _lpContract.
     */
    function removeLiquidityPosition(address _lpContract, uint256 _amount) virtual external;

    /** @dev Allows this contract to claim any rewards granted from providing liquidity.
     */
    function claimRewards(address _lpContract, uint256 _amount) virtual external;

    /** @dev Gets the LPBalance of this contract.
     */
    function lpBalance(address _lpContract) virtual external returns(uint256 _balance);

    /** @dev Swaps the claimed rewards for equal amounts of the LP assets you need from an LP contract.
     */
    function swapRewardsForLPAssets(address _lpContract, uint256 _amount) virtual external;
}
