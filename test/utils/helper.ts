import {
  ChainId,
  computePairAddress,
  CurrencyAmount,
  FACTORY_ADDRESS,
  Pair,
  Token,
  Trade,
} from "@sushiswap/sdk";
import { BigNumber, ethers } from "ethers";
import { tokens } from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import { IExchangePair } from "./interfaces";

export const format = (x: BigNumber) => ethers.utils.formatUnits(x.toString());

/** Given an array of tokens, creates pairs of all of them. */
export const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

/** Creates a list of Token objects (matic tokens) using the token list.. */
export const maticTokens = tokens
  .filter((x) => x.chainId === ChainId.MATIC)
  .filter((x) =>
    ["DAI", "USDC", "USDT", "WETH", "SUSHI", "WMATIC"].includes(x.symbol)
  )
  .map((x) => new Token(x.chainId, x.address, x.decimals, x.symbol, x.name));

export const maticPairs = pairs(maticTokens);

/** Returns a list pair addresses given a list of pairs. */
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

/** Returns a key-value object of all tokens, where key is the
 * symbol and pair is the Token object.
 */
export const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

export const tokenObject: { [key: string]: Token } = tokenToObject(maticTokens);

/** Parse the units given the decimals.*/
export const parseUnits = (symbol: string, value: number) =>
  ethers.utils
    .parseUnits(value.toString(), tokenObject[symbol].decimals)
    .toString();

/** Given a list of exchange pairs from the sushi-data endpoint,
 * returns a list of pair objects.
 */
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

/** Gets the data needed for auto compounding a position.
 * Given that the two rewards are sushi/wmatic and a list
 * of the token symbols of the underlying LP position we
 * are compounding, this returns an array of tokenPaths 
 * from reward to tokenA/B.
 */
export const getAutoCompoundData = (
  pairs: Pair[],
  splitSushiRewards: BigNumber,
  splitWMaticRewards: BigNumber,
  tokenSymbols: string[]
) => {
  const rewardTokenData = [
    { symbol: "SUSHI", rewards: splitSushiRewards },
    { symbol: "WMATIC", rewards: splitWMaticRewards },
  ];
  let data = [];
  for (let i = 0; i < rewardTokenData.length; i++) {
    let object: {
      tokenAPath: string[];
      tokenBPath: string[];
    } = { tokenAPath: [], tokenBPath: [] };
    for (let j = 0; j < tokenSymbols.length; j++) {
      const rewardTokenToTokenTrade = Trade.bestTradeExactIn(
        pairs,
        CurrencyAmount.fromRawAmount(
          tokenObject[rewardTokenData[i].symbol],
          splitSushiRewards.toString()
        ),
        tokenObject[tokenSymbols[j]]
      );
      const path = rewardTokenToTokenTrade[0].route.path.map((x) => x.address);
      object.tokenAPath.length === 0
        ? (object.tokenAPath = path)
        : (object.tokenBPath = path);
    }
    data.push(object);
  }
  return data;
};
