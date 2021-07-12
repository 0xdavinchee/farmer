import { expect } from "./chai-setup";
import { SushiFarmer } from "../typechain";
import { ethers, deployments } from "hardhat";
import { sushi } from "@lufycz/sushi-data";
import { abi } from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
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
    // const poolPairs = await sushi.exchange.pairs({
    //   chainId: 137,
    //   block, // go back one second just to be safe
    //   addresses: POOLS.map((x) => x.pair), // hardcode the pool pair addresses for now
    // });
    // console.log("poolPairs: ", poolPairs);

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
    const pairAddresses = maticPairs.map(([tokenA, tokenB]) => {
      return tokenA &&
        tokenB &&
        tokenA.chainId === tokenB.chainId &&
        !tokenA.equals(tokenB) &&
        FACTORY_ADDRESS[tokenA.chainId]
        ? computePairAddress({
            factoryAddress: FACTORY_ADDRESS[tokenA.chainId],
            tokenA,
            tokenB,
          })
        : undefined;
    });
    const basePairs: IExchangePair[] = await sushi.exchange.pairs({
      chainId: 137,
      block, // go back one second just to be safe
      addresses: pairAddresses, // pair addresses (base tokens)
    });

    const tokens = tokenToObject(maticTokens);
    const createToken = (x: IExchangeToken) =>
      new Token(
        ChainId.MATIC,
        x.id,
        tokens[x.symbol].decimals,
        x.symbol,
        x.name
      );
    const parseReserveUnits = (x: IExchangeToken, y: number) =>
      ethers.utils
        .parseUnits(y.toString(), tokens[x.symbol].decimals)
        .toString();
    // build pairs using basePairs
    const properPairs = basePairs.map((x) => {
      const token0 = createToken(x.token0);
      const token1 = createToken(x.token1);
      return new Pair(
        CurrencyAmount.fromRawAmount(
          token0.wrapped,
          parseReserveUnits(x.token0, x.reserve0)
        ),
        CurrencyAmount.fromRawAmount(
          token1.wrapped,
          parseReserveUnits(x.token1, x.reserve1)
        )
      );
    });
    console.log("properPairs[0]", properPairs[0]);
    const test = properPairs[0]
      .priceOf(properPairs[0].token0.wrapped)
      .quote(
        CurrencyAmount.fromRawAmount(
          properPairs[0].token1.wrapped,
          JSBI.BigInt(ethers.utils.parseUnits("100"))
        )
      );
    console.log("test: ", test);
    // console.log(properPairs);

    // const listOfPairs = maticPairs.map(
    //   (x) => new Pair(CurrencyAmount.fromRawAmount(x[0], ), CurrencyAmount.fromRawAmount(x[1], ))
    // );
    // console.log(listOfPairs[0].priceOf(listOfPairs[0].token0))
    // const bestTradesIn = Trade.bestTradeExactIn(listOfPairs, tokens[MATIC] as any, tokens["DAI"]);
    // console.log("bestTradesIn", bestTradesIn);
    // console.log("pairs", listOfPairs);
    // console.log("matic token list", maticTokens);
  });

  it("Should allow me to add liquidity and deposit.", async function () {
    // const { SushiFarmer } = await setup();
    // await SushiFarmer.createNewLPAndDeposit({
    //   pid: 0,
    //   slippage: 5,
    //   amountADesired: 20,
    //   amountBDesired: 20,
    //   tokenA: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
    //   tokenB: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" // DAI
    // });
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
