import {
  ChainId,
  computePairAddress,
  CurrencyAmount,
  FACTORY_ADDRESS,
  Pair,
  Token,
} from "@sushiswap/sdk";
import { BigNumber, ethers } from "ethers";
import { tokens } from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import { IExchangePair } from "./interfaces";

export const format = (x: BigNumber) => ethers.utils.formatUnits(x.toString());

export const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

export const maticTokens = tokens
  .filter((x) => x.chainId === ChainId.MATIC)
  .filter((x) =>
    ["DAI", "USDC", "USDT", "WETH", "SUSHI", "WMATIC"].includes(x.symbol)
  )
  .map((x) => new Token(x.chainId, x.address, x.decimals, x.symbol, x.name));

export const maticPairs = pairs(maticTokens);

export const pairAddresses = maticPairs.map(([tokenA, tokenB]) => {
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

export const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

export const tokenObject: { [key: string]: Token } = tokenToObject(maticTokens);

export const parseUnits = (symbol: string, reserves: number) =>
  ethers.utils
    .parseUnits(reserves.toString(), tokenObject[symbol].decimals)
    .toString();

export const createPairs = (pairs: IExchangePair[]) => {
  return pairs.map((x) => {
    return new Pair(
      CurrencyAmount.fromRawAmount(
        tokenObject[x.token0.symbol],
        parseUnits(x.token0.symbol, x.reserve0)
      ),
      CurrencyAmount.fromRawAmount(
        tokenObject[x.token1.symbol],
        parseUnits(x.token1.symbol, x.reserve1)
      )
    );
  });
};
