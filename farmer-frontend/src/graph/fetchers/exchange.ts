import { ChainId } from "@sushiswap/sdk";
import { GRAPH_HOST } from "../constants";
import { request } from "graphql-request";
import { pairsQuery } from "../queries/exchange";

export const EXCHANGE: { [key: number]: string } = {
  [ChainId.MAINNET]: "sushiswap/exchange",
  [ChainId.XDAI]: "sushiswap/xdai-exchange",
  [ChainId.MATIC]: "sushiswap/matic-exchange",
  [ChainId.FANTOM]: "sushiswap/fantom-exchange",
  [ChainId.BSC]: "sushiswap/bsc-exchange",
  [ChainId.HARMONY]: "sushiswap/harmony-exchange",
  [ChainId.OKEX]: "sushiswap/okex-exchange",
  [ChainId.AVALANCHE]: "sushiswap/avalanche-exchange",
  [ChainId.CELO]: "sushiswap/celo-exchange",
};

export const exchange = async (
  chainId = ChainId.MAINNET,
  query: any,
  variables: any
) =>
  request(
    `${GRAPH_HOST[chainId]}/subgraphs/name/${EXCHANGE[chainId]}`,
    query,
    variables
  );

export const getPairs = async (
  chainId = ChainId.MAINNET,
  variables = undefined,
  query = pairsQuery
) => {
  const { pairs } = await exchange(chainId, query, variables);
  return pairs;
};