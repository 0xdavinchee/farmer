import useSWR, { SWRConfiguration } from "swr";
import { getPairs } from "../fetchers/exchange";

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
  return data;
}
