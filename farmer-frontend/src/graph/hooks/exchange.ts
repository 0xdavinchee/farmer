import useSWR, { SWRConfiguration } from "swr";
import { getPairs } from "../fetchers/exchange";

export interface IExchangePair {
  id: string;
  token0: IExchangeToken;
  token1: IExchangeToken;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  reserveETH: string;
  reserveUSD: string;
  trackedReserveETH: string;
  token0Price: string;
  token1Price: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  untrackedVolumeUSD: string;
  txCount: string;
}

export interface IExchangeToken {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  derivedETH: string;
}

export function useSushiPairs(
  variables: any,
  query?: any,
  swrConfig?: SWRConfiguration | undefined
) {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;
  const shouldFetch = chainID;
  const { data } = useSWR(
    shouldFetch ? ["sushiPairs", chainID, JSON.stringify(variables)] : null,
    (_, chainId) => getPairs(chainId, variables, query),
    swrConfig
  );
  return data as IExchangePair[];
}
