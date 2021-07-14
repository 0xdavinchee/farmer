import {
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair,
  IUniswapV2Router02,
  SushiFarmer,
} from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import ChefABI from "./abi/MiniChef.json";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import PairABI from "@sushiswap/core/build/abi/IUniswapV2Pair.json";
import ERC20ABI from "@sushiswap/core/build/abi/ERC20.json";
import { tokens } from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import {
  ChainId,
  FACTORY_ADDRESS,
  computePairAddress,
  Pair,
  Token,
} from "@sushiswap/sdk";
import { setupUser } from "./utils";
import { ADDRESS } from "./utils/constants";
import { IBaseTestObject, ISetupProps } from "./utils/interfaces";
import { BigNumber } from "ethers";
import { expect } from "chai";

const SUSHI = "SUSHI";
const MATIC = "WMATIC";

const format = (x: BigNumber) => ethers.utils.formatUnits(x.toString());

const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

const setup = async (data: ISetupProps) => {
  await deployments.fixture(["SushiFarmer"]);
  const { deployer, whale } = await getNamedAccounts();
  const { pair, independentToken, dependentToken } = data;

  // impersonate the whale
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [whale],
  });

  const contracts = {
    // these contracts will always have the same addresses
    MiniChef: (await ethers.getContractAt(
      ChefABI,
      ADDRESS.MINI_CHEF
    )) as IMiniChefV2,
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
    SushiRouter: (await ethers.getContractAt(
      RouterABI,
      ADDRESS.SUSHI_ROUTER
    )) as IUniswapV2Router02,

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

  // whale is owner of sushifarmer
  await setupObject.SushiFarmer.setOwner(whale);
  console.log("SushiFarmer Addr: ", contracts.SushiFarmer.address);

  return setupObject;
};

const addLiquidityAndDeposit = async (
  baseObject: IBaseTestObject,
  independentToken: IERC20,
  dependentToken: IERC20,
  v2Pair: IUniswapV2Pair
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
  console.log("priorStaked amount: ", format(priorStaked));
  console.log("priorTotalDebt: ", format(priorTotalDebt));

  // create a new LP via the sushi router then deposit the LP into
  // the mini chef farm for staking rewards
  await whale.SushiFarmer.createNewLPAndDeposit(
    {
      pid: 5,
      amountADesired: primaryTokenBalance,
      amountBDesired: dependentTokeRequired,
      pair,
      token0: independentToken.address,
      token1: dependentToken.address,
    },
    { gasLimit: 10000000 }
  );

  // get our staked amount from the mini chef
  const [staked, totalDebt] = await miniChef.userInfo(5, farmer.address);
  console.log("staked amount: ", format(staked));
  console.log("totalDebt: ", format(totalDebt));
};

const getRewardsBalance = async (whale: any) => {
  const wMaticBalance = await whale.WMATIC.balanceOf(ADDRESS.USER);
  const sushiBalance = await whale.Sushi.balanceOf(ADDRESS.USER);
  console.log("wMaticBalance", format(wMaticBalance));
  console.log("sushiBalance", format(sushiBalance));
};

describe("SushiFarmer Tests", function () {
  it.skip("Should allow me to get my balances", async () => {
    const { whale } = await setup({
      pair: ADDRESS.WETH_DAI_SLP,
      independentToken: ADDRESS.WETH,
      dependentToken: ADDRESS.DAI,
    });
    await getRewardsBalance(whale);
  });

  it.skip("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    const {
      MiniChef,
      SushiFarmer,
      SushiRouter,
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
    await addLiquidityAndDeposit(baseObject, WETH, DAI, WETH_DAI_SLP);
  });

  it("Should be able to claim rewards.", async function () {
    const {
      MiniChef,
      SushiFarmer,
      SushiRouter,
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
    await addLiquidityAndDeposit(baseObject, WETH, DAI, WETH_DAI_SLP);

    // get our pending sushi rewards
    const rewardsInitial = await MiniChef.pendingSushi(5, SushiFarmer.address);
    console.log("rewardsInitial: ", format(rewardsInitial));
    await hre.network.provider.send("evm_increaseTime", [86400 * 30]);
    await hre.network.provider.send("evm_mine");
    // get our sushi rewards after some time
    const rewardsFuture = await MiniChef.pendingSushi(5, SushiFarmer.address);
    console.log("rewardsFuture: ", format(rewardsFuture));

    // harvest rewards
    await whale.SushiFarmer.claimRewards(5, { gasLimit: 10000000 });

    const rewardsClaimed = await MiniChef.pendingSushi(5, SushiFarmer.address);
    console.log("rewardsClaimed: ", format(rewardsClaimed));
  });

  it("Should be able to remove LP position from contract and withdraw.", async function () {
    const {
      MiniChef,
      SushiFarmer,
      SushiRouter,
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
    await addLiquidityAndDeposit(baseObject, WETH, DAI, WETH_DAI_SLP);

    const lpBalanceInitial = await WETH_DAI_SLP.balanceOf(SushiRouter.address);
    // get prior data from the mini chef
    const [staked, totalDebt] = await MiniChef.userInfo(5, SushiFarmer.address);
    console.log("staked amount: ", format(staked));
    console.log("totalDebt: ", format(totalDebt));
    console.log("lpBalanceInitial: ", format(lpBalanceInitial));

    await expect(whale.SushiFarmer.withdrawLP(5, staked, { gasLimit: 1000000 }))
      .to.emit(MiniChef, "Withdraw")
      .withArgs(SushiFarmer.address, 5, staked, SushiFarmer.address);

    // this for whatever reason is still 0, but I expect it to be equal to `staked`
    const lpBalanceAfterWithdraw = await WETH_DAI_SLP.balanceOf(
      SushiRouter.address
    );
    console.log("lpBalanceAfterWithdraw: ", format(lpBalanceAfterWithdraw));

    // get final staked amount in the mini chef (should be 0)
    const [finalStaked, finalTotalDebt] = await MiniChef.userInfo(
      5,
      SushiFarmer.address
    );
    console.log("finalStaked amount: ", format(finalStaked));
    console.log("finalTotalDebt: ", format(finalTotalDebt));

    await expect(
      whale.SushiFarmer.withdrawFunds(WETH_DAI_SLP.address, lpBalanceInitial, {
        gasLimit: 1000000,
      })
    )
      .to.emit(WETH_DAI_SLP, "Transfer")
      .withArgs(SushiFarmer.address, whale.address, lpBalanceInitial);
  });

  it("Should be able to swap rewards for LP assets.", async function () {});

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
