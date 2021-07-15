import {
  IComplexRewardTimer,
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair,
  IUniswapV2Router02,
  SushiFarmer,
} from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import ChefABI from "./abi/MiniChef.json";
import ComplexRewardTimerABI from "./abi/ComplexRewardTimer.json";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import PairABI from "@sushiswap/core/build/abi/IUniswapV2Pair.json";
import ERC20ABI from "@sushiswap/core/build/abi/ERC20.json";
import { tokens } from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import {
  ChainId,
  computePairAddress,
  FACTORY_ADDRESS,
  Token,
} from "@sushiswap/sdk";
import { setupUser } from "./utils";
import { ADDRESS } from "./utils/constants";
import { sushi } from "@lufycz/sushi-data";
import {
  IBaseTestObject,
  IExchangePair,
  ISetupProps,
} from "./utils/interfaces";
import { expect } from "chai";
import {
  createPairs,
  format,
  getAutoCompoundData,
  pairAddresses,
} from "./utils/helper";
import { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";

// TODO: Move helper functions to helper file
// TODO: Ensure that tokens are sorted in correct order before passing to contracts

const setup = async (data: ISetupProps) => {
  const { deployer, whale } = await getNamedAccounts();
  const { pair, independentToken, dependentToken } = data;

  const contracts = {
    // these contracts will always have the same addresses
    ComplexRewardTimer: (await ethers.getContractAt(
      ComplexRewardTimerABI,
      ADDRESS.COMPLEX_REWARD_TIMER
    )) as IComplexRewardTimer,
    MiniChef: (await ethers.getContractAt(
      ChefABI,
      ADDRESS.MINI_CHEF
    )) as IMiniChefV2,

    // reward tokens
    Sushi: (await ethers.getContractAt(ERC20ABI, ADDRESS.SUSHI)) as IERC20,
    WMATIC: (await ethers.getContractAt(ERC20ABI, ADDRESS.WMATIC)) as IERC20,

    // these contract addresses will vary
    V2Pair: (await ethers.getContractAt(PairABI, pair)) as IUniswapV2Pair,
    IndependentToken: (await ethers.getContractAt(
      ERC20ABI,
      independentToken
    )) as IERC20,
    DependentToken: (await ethers.getContractAt(
      ERC20ABI,
      dependentToken
    )) as IERC20,
  };

  const setupObject = {
    ...contracts,
    deployer: await setupUser(deployer, contracts),
    whale: await setupUser(whale, contracts),
  };

  return setupObject;
};

const addLiquidityAndDeposit = async (
  baseObject: IBaseTestObject,
  independentToken: IERC20,
  dependentToken: IERC20,
  v2Pair: IUniswapV2Pair,
  SushiFarmer: SushiFarmer,
  whaleSigner: SignerWithAddress
) => {
  const { farmer, whale, router, miniChef } = baseObject;

  // transfer funds to the sushi farmer contract
  await whale.IndependentToken.transfer(
    farmer.address,
    ethers.utils.parseUnits("1")
  );
  await whale.DependentToken.transfer(
    farmer.address,
    ethers.utils.parseUnits("2000")
  );

  // get our weth balance
  const primaryTokenBalance = await independentToken.balanceOf(farmer.address);

  // given our weth balance, how much dai do we need to LP?
  const [reservesA, reservesB] = await v2Pair.getReserves(); // WETH | DAI
  const dependentTokeRequired = await router.quote(
    primaryTokenBalance,
    reservesA,
    reservesB
  );

  const tokenListA = tokens.find(
    (x) => x.address.toUpperCase() === independentToken.address.toUpperCase()
  )!;
  const tokenListB = tokens.find(
    (x) => x.address.toUpperCase() === dependentToken.address.toUpperCase()
  )!;

  const tokenA = new Token(
    ChainId.MATIC,
    independentToken.address,
    tokenListA.decimals,
    tokenListA.symbol,
    tokenListA.name
  );
  const tokenB = new Token(
    ChainId.MATIC,
    dependentToken.address,
    tokenListB.decimals,
    tokenListB.symbol,
    tokenListB.name
  );

  const pair = computePairAddress({
    factoryAddress: FACTORY_ADDRESS[ChainId.MATIC],
    tokenA,
    tokenB,
  });

  // get prior data from the mini chef
  const [priorStaked, priorTotalDebt] = await miniChef.userInfo(
    5,
    farmer.address
  );

  // create a new LP via the sushi router then deposit the LP into
  // the mini chef farm for staking rewards
  await SushiFarmer.connect(whaleSigner).createNewLPAndDeposit(
    {
      pid: 5,
      amountADesired: primaryTokenBalance,
      amountBDesired: dependentTokeRequired,
      pair,
      tokenA: independentToken.address,
      tokenB: dependentToken.address,
    },
    { gasLimit: 10000000 }
  );

  // get our staked amount from the mini chef
  const [staked, totalDebt] = await miniChef.userInfo(5, farmer.address);

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

const getContractRewardTokensBalance = async (whale: any) => {
  const wMaticBalance = await whale.WMATIC.balanceOf(ADDRESS.USER);
  const sushiBalance = await whale.Sushi.balanceOf(ADDRESS.USER);
  console.log("wMaticBalance", format(wMaticBalance));
  console.log("sushiBalance", format(sushiBalance));
};

const getPendingRewardBalance = async (
  miniChef: IMiniChefV2,
  complexRewardTimer: IComplexRewardTimer,
  pid: number,
  user: string
) => {
  const [wMaticRewardsAddresses, wMaticRewards] =
    await complexRewardTimer.pendingTokens(pid, user, 0);
  const sushiRewards = await miniChef.pendingSushi(pid, user);
  console.log("wMaticRewardsAddresses", wMaticRewardsAddresses);
  console.log("wMaticRewards", format(wMaticRewards[0]));
  console.log("sushiRewards", format(sushiRewards));

  return { wMaticRewards: wMaticRewards[0], sushiRewards };
};

describe("SushiFarmer Tests", function () {
  let SushiRouter: IUniswapV2Router02;
  let SushiFarmer: SushiFarmer;
  let whaleSigner: SignerWithAddress;

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

  it.skip("Should allow me to get my balances", async () => {
    const { whale } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });
    await getContractRewardTokensBalance(whale);
  });

  it.skip("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    const {
      MiniChef,
      IndependentToken: WETH,
      DependentToken: DAI,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });
    const baseObject: IBaseTestObject = {
      farmer: SushiFarmer,
      miniChef: MiniChef,
      router: SushiRouter,
      whale,
    };
    await addLiquidityAndDeposit(
      baseObject,
      WETH,
      DAI,
      WETH_DAI_SLP,
      SushiFarmer,
      whaleSigner
    );
  });

  it.skip("Should be able to claim rewards.", async function () {
    const {
      MiniChef,
      IndependentToken: WETH,
      DependentToken: DAI,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });

    const baseObject: IBaseTestObject = {
      farmer: SushiFarmer,
      miniChef: MiniChef,
      router: SushiRouter,
      whale,
    };
    // add LP position and deposit into minichef
    await addLiquidityAndDeposit(
      baseObject,
      WETH,
      DAI,
      WETH_DAI_SLP,
      SushiFarmer,
      whaleSigner
    );

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

  it.skip("Should be able to remove LP position from contract and withdraw.", async function () {
    const {
      MiniChef,
      IndependentToken: WETH,
      DependentToken: DAI,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });

    const baseObject: IBaseTestObject = {
      farmer: SushiFarmer,
      miniChef: MiniChef,
      router: SushiRouter,
      whale,
    };
    // add LP position and deposit into minichef
    const { staked } = await addLiquidityAndDeposit(
      baseObject,
      WETH,
      DAI,
      WETH_DAI_SLP,
      SushiFarmer,
      whaleSigner
    );

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
      IndependentToken: WETH,
      DependentToken: DAI,
      V2Pair: WETH_DAI_SLP,
      whale,
    } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });

    const baseObject: IBaseTestObject = {
      farmer: SushiFarmer,
      miniChef: MiniChef,
      router: SushiRouter,
      whale,
    };

    console.log("\n********** Pre Deposit Rewards **********");
    // should console 0
    await getPendingRewardBalance(
      MiniChef,
      ComplexRewardTimer,
      5,
      SushiFarmer.address
    );

    // add LP position and deposit into minichef
    const { staked: priorStaked } = await addLiquidityAndDeposit(
      baseObject,
      WETH,
      DAI,
      WETH_DAI_SLP,
      SushiFarmer,
      whaleSigner
    );

    // increase time and mine a new block
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");

    console.log("\n********** Post Deposit + Time Passed Rewards **********");

    // should console more than 0
    const { sushiRewards, wMaticRewards } = await getPendingRewardBalance(
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

    const pairs = createPairs(basePairs);

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
