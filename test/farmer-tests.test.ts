import {
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair,
  IUniswapV2Router02,
  SushiFarmer,
} from "../typechain";
import hre, { ethers, deployments, getNamedAccounts } from "hardhat";
import ChefABI from "@sushiswap/core/build/abi/MasterChef.json";
import RouterABI from "@sushiswap/core/build/abi/IUniswapV2Router02.json";
import PairABI from "@sushiswap/core/build/abi/IUniswapV2Pair.json";
import ERC20ABI from "@sushiswap/core/build/abi/ERC20.json";
import {
  ChainId,
  FACTORY_ADDRESS,
  computePairAddress,
  Token,
} from "@sushiswap/sdk";
import { setupUser } from "./utils";

const SUSHI = "SUSHI";
const MATIC = "WMATIC";
const SUSHI_ADDRESS = "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a";
const WMATIC_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const DAI_ADDRESS = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063";
const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const WETH_DAI_SLP_ADDRESS = "0x6ff62bfb8c12109e8000935a6de54dad83a4f39f";
const SUSHI_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const MINI_CHEF_ADDRESS = process.env.MINI_CHEF_V2_ADDRESS || "";
const USER_ADDRESS = process.env.USER_ADDRESS || "";
const WHALE_TEST_ADDRESS = process.env.WHALE_TEST_ADDRESS || "";

const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

const setup = async () => {
  await deployments.fixture(["SushiFarmer"]);
  const { deployer, whale } = await getNamedAccounts();

  const contracts = {
    Dai: (await ethers.getContractAt(ERC20ABI, DAI_ADDRESS)) as IERC20,
    MiniChef: (await ethers.getContractAt(
      ChefABI,
      MINI_CHEF_ADDRESS
    )) as IMiniChefV2,
    Sushi: (await ethers.getContractAt(ERC20ABI, SUSHI_ADDRESS)) as IERC20,
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
    SushiRouter: (await ethers.getContractAt(
      RouterABI,
      SUSHI_ROUTER
    )) as IUniswapV2Router02,
    WETH: (await ethers.getContractAt(ERC20ABI, WETH_ADDRESS)) as IERC20,
    WETH_DAI_SLP: (await ethers.getContractAt(
      PairABI,
      WETH_DAI_SLP_ADDRESS
    )) as IUniswapV2Pair,
    WMATIC: (await ethers.getContractAt(ERC20ABI, WMATIC_ADDRESS)) as IERC20,
  };

  return {
    ...contracts,
    deployer: await setupUser(deployer, contracts),
    // whale: await setupUser(deployer, contracts),
  };
};

describe("SushiFarmer Tests", function () {
  it.skip("Should allow me to get my balances", async () => {
    const { Sushi, WMATIC } = await setup();
    const wMaticBalance = await WMATIC.balanceOf(USER_ADDRESS);
    const sushiBalance = await Sushi.balanceOf(USER_ADDRESS);
    console.log(
      "wMaticBalance",
      ethers.utils.formatUnits(wMaticBalance.toString())
    );
    console.log(
      "sushiBalance",
      ethers.utils.formatUnits(sushiBalance.toString())
    );
  });

  it("Should allow me to impersonate account and add liquidity and deposit.", async function () {
    const { Dai, MiniChef, SushiFarmer, SushiRouter, WETH, WETH_DAI_SLP } =
      await setup();

    // whale is owner of sushifarmer
    await SushiFarmer.setOwner(WHALE_TEST_ADDRESS);

    // impersonate the whale
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WHALE_TEST_ADDRESS],
    });

    const whaleSigner = await ethers.getSigner(WHALE_TEST_ADDRESS);

    await WETH.connect(whaleSigner).transfer(
      SushiFarmer.address,
      ethers.utils.parseUnits("10")
    );
    await Dai.connect(whaleSigner).transfer(
      SushiFarmer.address,
      ethers.utils.parseUnits("20000")
    );
    const wethBalance = await WETH.balanceOf(SushiFarmer.address);
    const [reservesA, reservesB] = await WETH_DAI_SLP.getReserves(); // WETH | DAI
    const daiBalance = await SushiRouter.quote(
      wethBalance,
      reservesA,
      reservesB
    );
    await SushiFarmer.connect(whaleSigner).createNewLPAndDeposit(
      {
        pid: 5,
        amountADesired: wethBalance,
        amountBDesired: daiBalance,
        token0: WETH_ADDRESS,
        token1: DAI_ADDRESS,
      },
      { gasLimit: 10000000 }
    );
    const [staked, totalDebt] = await MiniChef.userInfo(5, SushiFarmer.address);
    console.log("staked amount: ", ethers.utils.formatUnits(staked.toString()));
  });

  it("Should not allow non-owner to carry out any actions.", async function () {});

  it("Should get amount of LP tokens that is reasonable.", async function () {});

  it("Should be able to add LP position to contract.", async function () {});

  it("Should be able to remove LP position from contract.", async function () {});

  it("Should be able to claim rewards.", async function () {});

  it("Should be able to swap rewards for LP assets.", async function () {});

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
