import { ChainId } from "@sushiswap/sdk";
import { GRAPH_HOST } from "../constants";
import { request } from "graphql-request";
import {
  miniChefPairAddressesQuery,
  miniChefPoolsQuery,
} from "../queries/minichef";

export const MINICHEF: { [key: number]: string } = {
  [ChainId.MATIC]: "sushiswap/matic-minichef",
  [ChainId.XDAI]: "matthewlilley/xdai-minichef",
  [ChainId.HARMONY]: "sushiswap/harmony-minichef",
};

export const miniChef = async (query: any, chainId = ChainId.MAINNET) =>
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MINICHEF[chainId]}`, query);

export const getMiniChefFarms = async (chainId = ChainId.MAINNET) => {
  const { pools } = await miniChef(miniChefPoolsQuery, chainId);
  return pools;
};

export const getMiniChefPairAddresses = async (chainId = ChainId.MAINNET) => {
  const { pools } = await miniChef(miniChefPairAddressesQuery, chainId);
  return pools;
};
