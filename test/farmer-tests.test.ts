import { expect } from "./chai-setup";
import { IERC20, SushiFarmer } from "../typechain";
import { ethers, deployments } from "hardhat";
import { sushi } from "@lufycz/sushi-data";
import { abi } from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import IERC20ABI from "@sushiswap/core/build/abi/IERC20.json";
import {
  ChainId,
  FACTORY_ADDRESS,
  computePairAddress,
  Token,
  WETH9,
  Trade,
  Percent,
  Pair,
  JSBI,
  CurrencyAmount,
} from "@sushiswap/sdk";
import tokenList from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import { POOLS } from "./utils/constants";
import { IExchangePair, IExchangeToken } from "./utils/interfaces";

const SUSHI = "SUSHI";
const MATIC = "WMATIC";
const SUSHI_ADDRESS = "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a";
const WMATIC_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const USER_ADDRESS = process.env.USER_ADDRESS || "";

const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

const setup = async () => {
  await deployments.fixture(["SushiFarmer"]);
  const contracts = {
    Sushi: (await ethers.getContractAt(IERC20ABI, SUSHI_ADDRESS)) as IERC20,
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
    WMATIC: (await ethers.getContractAt(IERC20ABI, WMATIC_ADDRESS)) as IERC20,
  };

  return { ...contracts };
};

describe("SushiFarmer Tests", function () {
  it("Should allow me to get my balances", async () => {
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

  it("Should allow me to add liquidity and deposit.", async function () {});

  it("Should not allow non-owner to carry out any actions.", async function () {});

  it("Should get amount of LP tokens that is reasonable.", async function () {});

  it("Should be able to add LP position to contract.", async function () {});

  it("Should be able to remove LP position from contract.", async function () {});

  it("Should be able to claim rewards.", async function () {});

  it("Should be able to swap rewards for LP assets.", async function () {});

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
