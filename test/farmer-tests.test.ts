import { IUniswapV2Router02, SushiFarmer } from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import FarmerABI from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import { sushi } from "@lufycz/sushi-data";
import { expect } from "chai";
import { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { ADDRESS } from "./utils/constants";
import { IExchangePair, ITestTokenInfo, IUser } from "./utils/interfaces";
import {
  createPairs,
  format,
  getRewardToTokenPaths,
  printRewardTokensBalance,
  maticPairAddresses,
  setup,
  transferTokensToFarmer,
  getLPTokenAmounts,
  getPairAddress,
  getAndPrintPendingRewardBalance,
  maticTokenObject,
  getAndPrintLPBurnMinAmounts,
  printTokensBalance,
  getUnderlyingTokenNames,
} from "./utils/helper";
import { BigNumberish } from "ethers";

describe("Polygon SushiFarmer Tests", function () {
  let SushiRouter: IUniswapV2Router02;
  let SushiFarmer: SushiFarmer;
  let Whale: IUser;
  let WhaleSigner: SignerWithAddress;
  let ChainId: number;
  let pid: number;
  let independentTokenInfo: ITestTokenInfo;
  let dependentTokenInfo: ITestTokenInfo;

  const addLiquidityAndDeposit = async (
    whale: IUser,
    pid: number,
    desiredTokenAAmount: BigNumberish,
    tokenBAmount: BigNumberish
  ) => {
    const { MiniChef, IndependentToken, DependentToken } = whale;
    // get prior data from the mini chef
    const [initialStaked] = await MiniChef.userInfo(pid, SushiFarmer.address);

    await transferTokensToFarmer(
      whale,
      SushiFarmer.address,
      desiredTokenAAmount,
      tokenBAmount
    );

    const [independentTokenAmount, dependentTokenRequired] =
      await getLPTokenAmounts(
        whale,
        SushiFarmer.address,
        SushiRouter,
        desiredTokenAAmount
      );

    const pair = getPairAddress(
      IndependentToken.address,
      DependentToken.address
    );

    const [independentTokenName, dependentTokenName] = getUnderlyingTokenNames(
      whale.IndependentToken,
      whale.DependentToken
    );

    // create a new LP via the sushi router then deposit the LP into
    // the mini chef farm for staking rewards
    const txn = await SushiFarmer.connect(WhaleSigner).createNewLPAndDeposit(
      {
        pid: pid,
        amountADesired: independentTokenAmount,
        amountBDesired: dependentTokenRequired,
        pair,
        tokenA: IndependentToken.address,
        tokenB: DependentToken.address,
      },
      { gasLimit: 10000000 }
    );

    console.log(
      independentTokenName + " Exchanged: ",
      format(independentTokenAmount, independentTokenInfo.decimals)
    );
    console.log(
      dependentTokenName + " Exchanged: ",
      format(dependentTokenRequired, dependentTokenInfo.decimals)
    );

    const receipt = await txn.wait();
    const lPDepositedSignature = ethers.utils.solidityKeccak256(
      ["string"],
      ["LPDeposited(uint256,address,uint256)"]
    );
    const logs = receipt.logs.filter((x) =>
      x.topics.includes(lPDepositedSignature)
    );
    const lPDepositedData = logs[0].data;
    const iface = new ethers.utils.Interface(FarmerABI.abi);
    const decodedLogData = iface.decodeEventLog("LPDeposited", lPDepositedData);
    console.log("Liquidity Received: ", format(decodedLogData["amount"]));

    // get our staked LP amount from the mini chef
    const [staked] = await MiniChef.userInfo(pid, SushiFarmer.address);

    const formatInitialStaked = format(initialStaked);
    const formatStaked = format(staked);

    expect(formatStaked).to.be.greaterThan(formatInitialStaked);

    console.log(
      "\n********** Adding Liquidity and Depositing LP Tokens Into MiniChef **********"
    );
    console.log("Pre-Deposit Staked Amount: ", formatInitialStaked);
    console.log("Post-Deposit Staked Amount: ", formatStaked);
    console.log("\n");

    return staked;
  };

  before(async () => {
    await deployments.fixture(["SushiFarmer"]);
    const { chainId } = await ethers.provider.getNetwork();
    ChainId = 137; // chainId;
    pid = 5;
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
        ADDRESS[ChainId].SUSHI_ROUTER
      )) as IUniswapV2Router02),
      // whale is owner of sushifarmer
      await SushiFarmer.setOwner(whale);
    WhaleSigner = await ethers.getSigner(whale);
    const independentAddress = ADDRESS[ChainId].WETH;
    const dependentAddress = ADDRESS[ChainId].DAI;
    const independentDecimals =
      maticTokenObject[independentAddress.toUpperCase()].decimals;
    const dependentDecimals =
      maticTokenObject[dependentAddress.toUpperCase()].decimals;
    independentTokenInfo = {
      address: independentAddress,
      amount: ethers.utils.parseUnits("1", independentDecimals).toString(),
      decimals: independentDecimals,
    };
    dependentTokenInfo = {
      address: dependentAddress,
      amount: ethers.utils.parseUnits("2500", dependentDecimals).toString(),
      decimals: dependentDecimals,
    };
    console.log("SushiFarmer Addr: ", SushiFarmer.address);
  });

  beforeEach(async () => {
    const { whale } = await setup({
      pair: ADDRESS[ChainId].WETH_DAI_SLP,
      independentToken: independentTokenInfo.address,
      dependentToken: dependentTokenInfo.address,
      rewardTokenA: ADDRESS[ChainId].SUSHI,
      rewardTokenB: ADDRESS[ChainId].WMATIC,
      chainId: ChainId,
    });
    Whale = whale;
  });

  it("Should allow me to get my balances", async () => {
    await printRewardTokensBalance(Whale, Whale.address);
    await printTokensBalance(Whale, Whale.address);
  });

  it("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    await addLiquidityAndDeposit(
      Whale,
      pid,
      independentTokenInfo.amount,
      dependentTokenInfo.amount
    );
  });

  it("Should be able to claim rewards.", async function () {
    console.log("\n********** Claiming Rewards From MiniChef **********");

    await getAndPrintPendingRewardBalance(
      Whale,
      pid,
      SushiFarmer.address,
      "Pre-Deposit and Stake"
    );

    // add LP position and deposit into minichef
    await addLiquidityAndDeposit(
      Whale,
      pid,
      independentTokenInfo.amount,
      dependentTokenInfo.amount
    );

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    // get our sushi rewards after some time
    await getAndPrintPendingRewardBalance(
      Whale,
      pid,
      SushiFarmer.address,
      "30 Days Post-Deposit and Stake"
    );

    // harvest rewards
    await SushiFarmer.connect(WhaleSigner).claimRewards(pid, {
      gasLimit: 10000000,
    });

    await getAndPrintPendingRewardBalance(
      Whale,
      pid,
      SushiFarmer.address,
      "Post Claimed Rewards"
    );
  });

  it("Should be able to remove LP position from contract and withdraw.", async function () {
    const lpBalanceInitial = await Whale.V2Pair.balanceOf(Whale.address);

    // add LP position and deposit into minichef
    const staked = await addLiquidityAndDeposit(
      Whale,
      pid,
      independentTokenInfo.amount,
      dependentTokenInfo.amount
    );

    // should be able to withdraw staked LP
    await expect(
      SushiFarmer.connect(WhaleSigner).withdrawLP(pid, staked, {
        gasLimit: 1000000,
      })
    )
      .to.emit(Whale.MiniChef, "Withdraw")
      .withArgs(SushiFarmer.address, pid, staked, SushiFarmer.address);

    const lpBalanceAfterWithdraw = await Whale.V2Pair.balanceOf(Whale.address);

    // get final staked amount in the mini chef (should be 0)
    const [finalStaked, finalTotalDebt] = await Whale.MiniChef.userInfo(
      pid,
      SushiFarmer.address
    );

    // regardless of the console's this should be able to withdraw staked amount of LP
    await expect(
      SushiFarmer.connect(WhaleSigner).withdrawFunds(
        Whale.V2Pair.address,
        staked,
        {
          gasLimit: 1000000,
        }
      )
    )
      .to.emit(Whale.V2Pair, "Transfer")
      .withArgs(SushiFarmer.address, Whale.address, staked);
    console.log("\n********** Withdraw LP From MiniChef **********");
    console.log("Initial LP Balance: ", format(lpBalanceInitial));
    console.log(
      "LP Balance After Withdrawal: ",
      format(lpBalanceAfterWithdraw)
    );
    console.log("Final Staked Amount: ", format(finalStaked));
    console.log("Final Total Debt Amount: ", format(finalTotalDebt));
  });

  it.only("Should be able to autocompound LP position.", async function () {
    await printRewardTokensBalance(Whale, SushiFarmer.address);
    // should console 0
    await getAndPrintPendingRewardBalance(
      Whale,
      pid,
      SushiFarmer.address,
      "Pre-Deposit and Stake"
    );

    // add LP position and deposit into minichef
    const initialStaked = await addLiquidityAndDeposit(
      Whale,
      pid,
      independentTokenInfo.amount,
      dependentTokenInfo.amount
    );

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    // should console more than 0
    const [rewardAAmount, rewardBAmount] =
      await getAndPrintPendingRewardBalance(
        Whale,
        pid,
        SushiFarmer.address,
        "30 Days Post-Deposit and Stake"
      );
    const splitRewardAAmount = rewardAAmount.div(2);
    const splitRewardBAmount = rewardBAmount.div(2);

    // go back a little to make up for the graph indexing lag
    const latestBlock = (await sushi.blocks.latestBlock({ chainId: 137 })) - 2;
    const basePairs: IExchangePair[] = await sushi.exchange.pairs({
      chainId: 137,
      latestBlock, // go back one second just to be safe
      addresses: maticPairAddresses, // pair addresses (base tokens)
    });

    const pairs = createPairs(basePairs, maticTokenObject);

    await SushiFarmer.connect(WhaleSigner).setRewardSavings(500, 500);

    // TODO: rewardAmount is currently quite arbitrary as we only obtain
    // the path that we are executing the trade on. Can consider incorporating
    // this information and abstracting this complexity to the client to enable
    // gas savings although there may be a discrepancy between calculation on
    // client and execution vs. doing it on chain.
    const data = getRewardToTokenPaths(
      pairs,
      [independentTokenInfo.address, dependentTokenInfo.address],
      [
        {
          address: Whale.RewardTokenA.address,
          rewardAmount: splitRewardAAmount,
        },
        {
          address: Whale.RewardTokenB.address,
          rewardAmount: splitRewardBAmount,
        },
      ]
    );

    await SushiFarmer.connect(WhaleSigner).autoCompoundExistingLPPosition(
      pid,
      Whale.V2Pair.address,
      data,
      { gasLimit: 1000000 }
    );

    await printRewardTokensBalance(Whale, SushiFarmer.address);

    // get our staked amount from the mini chef
    const [staked] = await Whale.MiniChef.userInfo(pid, SushiFarmer.address);

    const formatInitialStaked = format(initialStaked);
    const formatStaked = format(staked);

    console.log("********** Autocompounded LP Position in MiniChef **********");
    console.log("Prior Staked Amount: ", formatInitialStaked);
    console.log("Autocompounded Staked Amount: ", formatStaked);

    expect(formatStaked).to.be.greaterThan(formatInitialStaked);
  });

  it("Should be able to swap LP tokens for underlying assets.", async function () {
    // create LP and deposit, withdraw LP from mini chef to whale address
    // check if the token value amounts match u
    const staked = await addLiquidityAndDeposit(
      Whale,
      pid,
      independentTokenInfo.amount,
      dependentTokenInfo.amount
    );

    // should be able to withdraw staked LP
    await expect(
      SushiFarmer.connect(WhaleSigner).withdrawLP(pid, staked, {
        gasLimit: 1000000,
      })
    )
      .to.emit(Whale.MiniChef, "Withdraw")
      .withArgs(SushiFarmer.address, pid, staked, SushiFarmer.address);

    const [farmerLPBalance, amount0, amount1] =
      await getAndPrintLPBurnMinAmounts(Whale, SushiFarmer.address);

    await SushiFarmer.connect(WhaleSigner).removeLP(
      Whale.IndependentToken.address,
      Whale.DependentToken.address,
      farmerLPBalance,
      amount0,
      amount1,
      { gasLimit: 1000000 }
    );
  });
});
