import { expect } from "./chai-setup";
import { SushiFarmer } from "../typechain";
import { ethers, deployments } from "hardhat";
import { sushi } from "@lufycz/sushi-data";
import {
  ChainId,
  Token,
  WETH9,
  Trade,
  Percent,
  Pair,
  CurrencyAmount,
} from "@sushiswap/sdk";
import tokenList from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import { POOLS } from "./utils/constants";

const SUSHI = "SUSHI";
const MATIC = "WMATIC";

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
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
  };

  return { ...contracts };
};

describe("SushiFarmer Tests", function () {
  it("Should allow me to get my pools", async () => {
    // const pools = await sushi.masterchef.pools({timestamp: getTimeNow() });
    // console.log("pools: ", pools);
    const latestBlock = await sushi.blocks.latestBlock({ chainId: 137 });
    const block = latestBlock - 2;
    // get all the minichef pool pairs available on matic atm
    const poolPairs = await sushi.exchange.pairs({
      chainId: 137,
      block, // go back one second just to be safe
      addresses: POOLS.map((x) => x.pair), // hardcode the pool pair addresses for now
    });
    console.log("poolPairs: ", poolPairs);

    // this doesn't work as it is looking in the masterchef contract
    // not the minichef. we will need to use https://api.thegraph.com/subgraphs/name/sushiswap/matic-minichef
    // to build our own queries with the entities here https://thegraph.com/legacy-explorer/subgraph/sushiswap/matic-minichef?query=Example%20query
    // const userPairs = await sushi.masterchef.user({
    //   chainId: 137,
    //   block,
    //   address: process.env.USER_ADDRESS,
    // });

    // console.log("userPairs: ", userPairs);
    const maticTokens = tokenList.tokens
      .filter((x) => x.chainId === ChainId.MATIC)
      .filter((x) =>
        ["DAI", "USDC", "USDT", "WETH", SUSHI, MATIC].includes(x.symbol)
      )
      .map(
        (x) => new Token(x.chainId, x.address, x.decimals, x.symbol, x.name)
      );
    const maticPairs = pairs(maticTokens);
    const tokens = tokenToObject(maticTokens);
    const listOfPairs = maticPairs.map(
      (x) => new Pair(x[0] as any, x[1] as any)
    );
    // const bestTradesIn = Trade.bestTradeExactIn(listOfPairs, tokens[MATIC] as any, tokens["DAI"]);
    // console.log("bestTradesIn", bestTradesIn);
    // console.log("pairs", listOfPairs);
    // console.log("matic token list", maticTokens);
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
