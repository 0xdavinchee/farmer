import { getUnixTime, startOfHour, subHours } from "date-fns";
import { ChainId } from "@sushiswap/sdk";
import { GRAPH_HOST } from "../constants";
import { request } from "graphql-request";
import { blocksQuery } from "../queries/blocks";

export const BLOCKS: { [key: number]: string } = {
  [ChainId.MAINNET]: "blocklytics/ethereum-blocks",
  [ChainId.XDAI]: "matthewlilley/xdai-blocks",
  [ChainId.MATIC]: "matthewlilley/polygon-blocks",
  [ChainId.FANTOM]: "matthewlilley/fantom-blocks",
  [ChainId.BSC]: "matthewlilley/bsc-blocks",
  [ChainId.HARMONY]: "sushiswap/harmony-blocks",
  [ChainId.AVALANCHE]: "sushiswap/avalanche-blocks",
  [ChainId.CELO]: "sushiswap/celo-blocks",
};

interface IBlock {
  readonly id: string;
  readonly averageBlockTime?: number;
  readonly number: string;
  readonly timestamp: string;
}

interface IResponse<T> {
  readonly blocks: T[];
}

export const fetcher = async (
  chainId = ChainId.MAINNET,
  query: any,
  variables: any
): Promise<IResponse<IBlock>> =>
  request(
    `${GRAPH_HOST[chainId]}/subgraphs/name/${BLOCKS[chainId]}`,
    query,
    variables
  );

export const getBlocks = async (
  chainId = ChainId.MAINNET,
  start: number,
  end: number
) => {
  const { blocks } = await fetcher(chainId, blocksQuery, {
    start,
    end,
  });
  return blocks;
};

// Grabs the last 1000 (a sample statistical) blocks and averages
// the time difference between them
export const getAverageBlockTime = async (chainId = ChainId.MAINNET) => {
  const now = startOfHour(Date.now());
  const start = getUnixTime(subHours(now, 6));
  const end = getUnixTime(now);
  const blocks = await getBlocks(chainId, start, end);
  const averageBlockTime = blocks?.reduce(
    (previousValue: any, currentValue: any, currentIndex: number) => {
      if (previousValue.timestamp) {
        const difference = previousValue.timestamp - currentValue.timestamp;

        previousValue.averageBlockTime =
          previousValue.averageBlockTime + difference;
      }

      previousValue.timestamp = currentValue.timestamp;

      if (currentIndex === blocks.length - 1) {
        return previousValue.averageBlockTime / blocks.length;
      }

      return previousValue;
    },
    { timestamp: null, averageBlockTime: 0 }
  );

  return averageBlockTime;
};
