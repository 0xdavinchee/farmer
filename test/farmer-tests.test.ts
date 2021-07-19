import { IUniswapV2Router02, SushiFarmer } from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import FarmerABI from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import { ADDRESS } from "./utils/constants";
import { sushi } from "@lufycz/sushi-data";
import { IExchangePair, IUser } from "./utils/interfaces";
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
  let Whale: IUser;
  let WhaleSigner: SignerWithAddress;
  let ChainId: number;

  const addLiquidityAndDeposit = async (whale: IUser, tokenAAmount: string, tokenBAmount: string) => {
    const { MiniChef, IndependentToken, DependentToken, V2Pair } = whale;
    // get prior data from the mini chef
    const [initialStaked] = await MiniChef.userInfo(5, SushiFarmer.address);

    await transferTokensToFarmer(whale, SushiFarmer.address, tokenAAmount, tokenBAmount);

    const [independentTokenAmount, dependentTokenRequired] =
      await getLPTokenAmounts(
        IndependentToken,
        DependentToken,
        SushiFarmer.address,
        V2Pair,
        SushiRouter
      );

    const pair = getPairAddress(
      IndependentToken.address,
      DependentToken.address
    );

    // create a new LP via the sushi router then deposit the LP into
    // the mini chef farm for staking rewards
    const txn = await SushiFarmer.connect(WhaleSigner).createNewLPAndDeposit(
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
    
    console.log("Independent Token Exchanged: ", format(independentTokenAmount));
    console.log("Dependent Token Exchanged: ", format(dependentTokenRequired));
    
    const receipt = await txn.wait();
    const lPDepositedSignature = ethers.utils.solidityKeccak256(["string"], ["LPDeposited(uint256,address,uint256)"]);
    const logs = receipt.logs.filter(x => x.topics.includes(lPDepositedSignature));
    const lPDepositedData = logs[0].data;
    const iface = new ethers.utils.Interface(FarmerABI.abi);
    const decodedLogData = iface.decodeEventLog("LPDeposited", lPDepositedData);
    console.log("Liquidity Received: ", format(decodedLogData["amount"]));

    // get our staked amount from the mini chef
    const [staked] = await MiniChef.userInfo(5, SushiFarmer.address);

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
    console.log("SushiFarmer Addr: ", SushiFarmer.address);
  });

  beforeEach(async () => {
    const { whale } = await setup({
      pair: ADDRESS[ChainId].WETH_DAI_SLP,
      independentToken: ADDRESS[ChainId].WETH,
      dependentToken: ADDRESS[ChainId].DAI,
      rewardTokenA: ADDRESS[ChainId].SUSHI,
      rewardTokenB: ADDRESS[ChainId].WMATIC,
      chainId: ChainId
    });
    Whale = whale;
  });

  it("Should allow me to get my balances", async () => {
    await printRewardTokensBalance(Whale, Whale.address);
  });

  it("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    await addLiquidityAndDeposit(Whale, "1", "2000");
  });

  it("Should be able to claim rewards.", async function () {
    console.log("\n********** Claiming Rewards From MiniChef **********");

    await getAndPrintPendingRewardBalance(
      Whale.MiniChef,
      Whale.ComplexRewardTimer,
      5,
      SushiFarmer.address,
      "Pre-Deposit and Stake"
    );

    // add LP position and deposit into minichef
    await addLiquidityAndDeposit(Whale, "1", "2000");

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    // get our sushi rewards after some time
    await getAndPrintPendingRewardBalance(
      Whale.MiniChef,
      Whale.ComplexRewardTimer,
      5,
      SushiFarmer.address,
      "30 Days Post-Deposit and Stake"
    );

    // harvest rewards
    await SushiFarmer.connect(WhaleSigner).claimRewards(5, {
      gasLimit: 10000000,
    });

    await getAndPrintPendingRewardBalance(
      Whale.MiniChef,
      Whale.ComplexRewardTimer,
      5,
      SushiFarmer.address,
      "Post Claimed Rewarrds"
    );
  });

  it("Should be able to remove LP position from contract and withdraw.", async function () {
    const lpBalanceInitial = await Whale.V2Pair.balanceOf(Whale.address);

    // add LP position and deposit into minichef
    const staked = await addLiquidityAndDeposit(Whale, "1", "2000");

    // should be able to withdraw staked LP
    await expect(
      SushiFarmer.connect(WhaleSigner).withdrawLP(5, staked, {
        gasLimit: 1000000,
      })
    )
      .to.emit(Whale.MiniChef, "Withdraw")
      .withArgs(SushiFarmer.address, 5, staked, SushiFarmer.address);

    // this for whatever reason is still 0, but I expect it to be equal to `staked`
    const lpBalanceAfterWithdraw = await Whale.V2Pair.balanceOf(Whale.address);

    // get final staked amount in the mini chef (should be 0)
    const [finalStaked, finalTotalDebt] = await Whale.MiniChef.userInfo(
      5,
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

  it("Should be able to swap rewards for LP assets.", async function () {
    // should console 0
    await getAndPrintPendingRewardBalance(
      Whale.MiniChef,
      Whale.ComplexRewardTimer,
      5,
      SushiFarmer.address,
      "Pre-Deposit and Stake"
    );

    // add LP position and deposit into minichef
    const initialStaked = await addLiquidityAndDeposit(Whale, "1", "2000");

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    // should console more than 0
    const [sushiRewards, wMaticRewards] = await getAndPrintPendingRewardBalance(
      Whale.MiniChef,
      Whale.ComplexRewardTimer,
      5,
      SushiFarmer.address,
      "30 Days Post-Deposit and Stake"
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

    await SushiFarmer.connect(WhaleSigner).autoCompoundExistingLPPosition(
      5,
      Whale.V2Pair.address,
      data,
      { gasLimit: 1000000 }
    );

    // get our staked amount from the mini chef
    const [staked] = await Whale.MiniChef.userInfo(5, SushiFarmer.address);

    const formatInitialStaked = format(initialStaked);
    const formatStaked = format(staked);

    console.log("********** Autocompounded LP Position in MiniChef **********");
    console.log("Prior Staked Amount: ", formatInitialStaked);
    console.log("Autocompounded Staked Amount: ", formatStaked);

    expect(formatStaked).to.be.greaterThan(formatInitialStaked);
  });

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
