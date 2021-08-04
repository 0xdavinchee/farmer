import { ChainId } from "@sushiswap/sdk";
import { useMemo } from "react";
import { useWeb3Context } from "../../hooks/web3Context";
import {
  getMiniChefFarms,
  getMiniChefPairAddresses,
  IMiniChefFarmData,
} from "../fetchers/minichef";
import useSWR from "swr";

export function useMiniChefFarms() {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;
  const shouldFetch =
    chainID && [ChainId.MATIC, ChainId.XDAI, ChainId.HARMONY].includes(chainID);

  const { data } = useSWR<IMiniChefFarmData[]>(
    shouldFetch ? ["miniChefFarms", chainID] : null,
    (_, chainID) => getMiniChefFarms(chainID)
  );
  return useMemo(() => {
    if (!data) return [];
    return data.map((data) => ({ ...data, chef: 2 }));
  }, [data]);
}

export function useMiniChefPairAddresses() {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;
  const shouldFetch =
    chainID && [ChainId.MATIC, ChainId.XDAI, ChainId.HARMONY].includes(chainID);
  const { data } = useSWR<IMiniChefFarmData[]>(
    shouldFetch ? ["miniChefPairAddresses", chainID] : null,
    (_, chainId) => getMiniChefPairAddresses(chainId)
  );

  return useMemo(() => {
    if (!data) return [];
    return data.map((data) => data.pair);
  }, [data]);
}
