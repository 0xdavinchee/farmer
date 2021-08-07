pragma solidity 0.6.12;

interface IMiniChefV2 {
	/// @notice View function to see pending SUSHI on frontend.
	/// @param _pid The index of the pool. See `poolInfo`.
	/// @param _user Address of user.
	/// @return pending SUSHI reward for a given user.
	function pendingSushi(uint256 _pid, address _user)
		external
		view
		returns (uint256 pending);

	/// @notice Deposit LP tokens to MCV2 for SUSHI allocation.
	/// @param pid The index of the pool. See `poolInfo`.
	/// @param amount LP token amount to deposit.
	/// @param to The receiver of `amount` deposit benefit.
	function deposit(
		uint256 pid,
		uint256 amount,
		address to
	) external;

	/// @notice Withdraw LP tokens from MCV2.
	/// @param pid The index of the pool. See `poolInfo`.
	/// @param amount LP token amount to withdraw.
	/// @param to Receiver of the LP tokens.
	function withdraw(
		uint256 pid,
		uint256 amount,
		address to
	) external;

	/// @notice Harvest proceeds for transaction sender to `to`.
	/// @param pid The index of the pool. See `poolInfo`.
	/// @param to Receiver of SUSHI rewards.
	function harvest(uint256 pid, address to) external;

	/// @notice Withdraw LP tokens from MCV2 and harvest proceeds for transaction sender to `to`.
	/// @param pid The index of the pool. See `poolInfo`.
	/// @param amount LP token amount to withdraw.
	/// @param to Receiver of the LP tokens and SUSHI rewards.
	function withdrawAndHarvest(
		uint256 pid,
		uint256 amount,
		address to
	) external;

	/// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
	/// @param pid The index of the pool. See `poolInfo`.
	/// @param to Receiver of the LP tokens.
	function emergencyWithdraw(uint256 pid, address to) external;

	/// @notice Info of each user that stakes LP tokens.
	function userInfo(uint256 _pid, address _user)
		external
		view
		returns (uint256, int256);
}
