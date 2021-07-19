import { IUniswapV2Router02, SushiFarmer } from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import { ADDRESS } from "./utils/constants";
import { sushi } from "@lufycz/sushi-data";
import { IExchangePair, ISetupProps, IUser } from "./utils/interfaces";
import { expect } from "chai";
import {
  createPairs,
  format,
  getAutoCompoundData,
  printRewardTokensBalance,
  pairAddresses,
  setup,
  transferTokensToFarmer,
  getLPTokenAmounts,
  getPairAddress,
  getAndPrintPendingRewardBalance,
  maticTokenObject,
} from "./utils/helper";
import { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";

describe("Polygon SushiFarmer Tests", function () {
  let SushiRouter: IUniswapV2Router02;
  let SushiFarmer: SushiFarmer;
  let whaleSigner: SignerWithAddress;

  const addLiquidityAndDeposit = async (whale: IUser) => {
    const { MiniChef, IndependentToken, DependentToken, V2Pair } = whale;
    // get prior data from the mini chef
    const [priorStaked, priorTotalDebt] = await MiniChef.userInfo(
      5,
      SushiFarmer.address
    );

    await transferTokensToFarmer(whale, SushiFarmer.address, "1", "2000");

    const [independentTokenAmount, dependentTokenRequired] =
      await getLPTokenAmounts(
        IndependentToken,
        DependentToken,
        SushiFarmer.address,
        V2Pair,
        SushiRouter
      );

    const pair = getPairAddress(IndependentToken.address, DependentToken.address);

    // create a new LP via the sushi router then deposit the LP into
    // the mini chef farm for staking rewards
    await SushiFarmer.connect(whaleSigner).createNewLPAndDeposit(
      {
        pid: 5,
        amountADesired: independentTokenAmount,
        amountBDesired: dependentTokenRequired,
        pair,
        tokenA: IndependentToken.address,
        tokenB: DependentToken.address,
      },
      { gasLimit: 10000000 }
    );

    // get our staked amount from the mini chef
    const [staked, totalDebt] = await MiniChef.userInfo(5, SushiFarmer.address);

    // print outs
    console.log(
      "********** Added Liquidity and Deposited Into MiniChef **********"
    );
    console.log("priorStaked amount: ", format(priorStaked));
    console.log("priorTotalDebt: ", format(priorTotalDebt));
    console.log("staked amount: ", format(staked));
    console.log("totalDebt: ", format(totalDebt));
    return { staked, totalDebt };
  };

  before(async () => {
    await deployments.fixture(["SushiFarmer"]);
    const { whale } = await getNamedAccounts();

    // impersonate the whale
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whale],
    });

    (SushiFarmer = (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer),
      (SushiRouter = (await ethers.getContractAt(
        RouterABI,
        ADDRESS.SUSHI_ROUTER
      )) as IUniswapV2Router02),
      // whale is owner of sushifarmer
      await SushiFarmer.setOwner(whale);
    whaleSigner = await ethers.getSigner(whale);
    console.log("SushiFarmer Addr: ", SushiFarmer.address);
  });

  it("Should allow me to get my balances", async () => {
    const { whale } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
      rewardTokenA: ADDRESS.SUSHI,
      rewardTokenB: ADDRESS.WMATIC,
    });
    await printRewardTokensBalance(whale, whale.address);
  });

  it("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    const { whale } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
      rewardTokenA: ADDRESS.SUSHI,
      rewardTokenB: ADDRESS.WMATIC,
    });
    await addLiquidityAndDeposit(whale);
  });

  it("Should be able to claim rewards.", async function () {
    const { MiniChef, whale } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
      rewardTokenA: ADDRESS.SUSHI,
      rewardTokenB: ADDRESS.WMATIC,
    });

    // add LP position and deposit into minichef
    await addLiquidityAndDeposit(whale);

    // get our pending sushi rewards
    const rewardsInitial = await MiniChef.pendingSushi(5, SushiFarmer.address);

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");
    // get our sushi rewards after some time
    const rewardsFuture = await MiniChef.pendingSushi(5, SushiFarmer.address);

    // harvest rewards
    await SushiFarmer.connect(whaleSigner).claimRewards(5, {
      gasLimit: 10000000,
    });

    const pendingRewardsAfterClaim = await MiniChef.pendingSushi(
      5,
      SushiFarmer.address
    );

    console.log("\n********** Claimed Rewards From MiniChef **********");
    console.log("rewardsInitial: ", format(rewardsInitial));
    console.log("rewardsFuture: ", format(rewardsFuture));
    console.log("pendingRewardsAfterClaim: ", format(pendingRewardsAfterClaim));
  });

  it("Should be able to remove LP position from contract and withdraw.", async function () {
    const {
      MiniChef,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
      rewardTokenA: ADDRESS.SUSHI,
      rewardTokenB: ADDRESS.WMATIC,
    });
    // add LP position and deposit into minichef
    const { staked } = await addLiquidityAndDeposit(whale);

    const lpBalanceInitial = await WETH_DAI_SLP.balanceOf(SushiRouter.address);

    // should be able to withdraw staked LP
    await expect(
      SushiFarmer.connect(whaleSigner).withdrawLP(5, staked, {
        gasLimit: 1000000,
      })
    )
      .to.emit(MiniChef, "Withdraw")
      .withArgs(SushiFarmer.address, 5, staked, SushiFarmer.address);

    // this for whatever reason is still 0, but I expect it to be equal to `staked`
    const lpBalanceAfterWithdraw = await WETH_DAI_SLP.balanceOf(
      SushiRouter.address
    );

    // get final staked amount in the mini chef (should be 0)
    const [finalStaked, finalTotalDebt] = await MiniChef.userInfo(
      5,
      SushiFarmer.address
    );

    // regardless of the console's this should be able to withdraw staked amount of LP
    await expect(
      SushiFarmer.connect(whaleSigner).withdrawFunds(
        WETH_DAI_SLP.address,
        staked,
        {
          gasLimit: 1000000,
        }
      )
    )
      .to.emit(WETH_DAI_SLP, "Transfer")
      .withArgs(SushiFarmer.address, whale.address, staked);
    console.log("\n********** Withdraw LP From MiniChef **********");
    console.log("lpBalanceInitial: ", format(lpBalanceInitial));
    console.log("lpBalanceAfterWithdraw: ", format(lpBalanceAfterWithdraw));
    console.log("finalStaked amount: ", format(finalStaked));
    console.log("finalTotalDebt: ", format(finalTotalDebt));
  });

  it("Should be able to swap rewards for LP assets.", async function () {
    const {
      ComplexRewardTimer,
      MiniChef,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
      rewardTokenA: ADDRESS.SUSHI,
      rewardTokenB: ADDRESS.WMATIC,
    });
    console.log("\n********** Pre Deposit Rewards **********");
    // should console 0
    await getAndPrintPendingRewardBalance(
      MiniChef,
      ComplexRewardTimer,
      5,
      SushiFarmer.address
    );

    // add LP position and deposit into minichef
    const { staked: priorStaked } = await addLiquidityAndDeposit(whale);

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    console.log("\n********** Post Deposit + Time Passed Rewards **********");

    // should console more than 0
    const { sushiRewards, wMaticRewards } =
      await getAndPrintPendingRewardBalance(
        MiniChef,
        ComplexRewardTimer,
        5,
        SushiFarmer.address
      );
    const splitSushiRewards = sushiRewards.div(2);
    const splitWMaticRewards = wMaticRewards.div(2);

    // go back a little to make up for the graph indexing lag
    const latestBlock = (await sushi.blocks.latestBlock({ chainId: 137 })) - 2;
    const basePairs: IExchangePair[] = await sushi.exchange.pairs({
      chainId: 137,
      latestBlock, // go back one second just to be safe
      addresses: pairAddresses, // pair addresses (base tokens)
    });

    const pairs = createPairs(basePairs, maticTokenObject);

    const data = getAutoCompoundData(
      pairs,
      splitSushiRewards,
      splitWMaticRewards,
      ["WETH", "DAI"]
    );

    await SushiFarmer.connect(whaleSigner).autoCompoundExistingLPPosition(
      5,
      WETH_DAI_SLP.address,
      data,
      { gasLimit: 1000000 }
    );

    // get our staked amount from the mini chef
    const [staked] = await MiniChef.userInfo(5, SushiFarmer.address);
    console.log("********** Autocompounded LP Position in MiniChef **********");
    console.log("priorStaked amount: ", format(priorStaked));
    console.log("compounded staked amount: ", format(staked)); // this should be greater than priorStaked amount
  });

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
