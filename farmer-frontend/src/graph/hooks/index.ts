import { ChainId } from "@sushiswap/sdk";
import { useMemo } from "react";
import { useWeb3Context } from "../../hooks/web3Context";
import {
  getMiniChefFarms,
  getMiniChefPairAddresses,
} from "../fetchers/minichef";
import useSWR from "swr";

interface IMiniChefFarmData {
  readonly accSushiPerShare: string;
  readonly allocPoint: string;
  readonly chef?: number;
  readonly id: string;
  readonly lastRewardTime: string;
  readonly miniChef: {
    readonly id: string;
    readonly sushiPerSecond: string;
    readonly totalAllocPoint: string;
  };
  readonly pair: string;
  readonly rewarder: {
    readonly id: string;
    readonly rewardPerSecond: string;
    readonly rewardToken: string;
  };
  readonly slpBalance: string;
  readonly userCount: string;
}

export function useMiniChefFarms() {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;
  const shouldFetch =
    chainID && [ChainId.MATIC, ChainId.XDAI, ChainId.HARMONY].includes(chainID);

  const { data } = useSWR(shouldFetch ? [chainID] : null, (chainID) =>
    getMiniChefFarms(chainID)
  );
  console.log(data);
  return useMemo(() => {
    if (!data) return [];
    return data.map((data: IMiniChefFarmData) => ({ ...data, chef: 2 }));
  }, [data]);
}

export function useMiniChefPairAddresses() {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;
  const shouldFetch =
    chainID && [ChainId.MATIC, ChainId.XDAI, ChainId.HARMONY].includes(chainID);
  const { data } = useSWR(shouldFetch ? [chainID] : null, (chainId) =>
    getMiniChefPairAddresses(chainId)
  );

  console.log(data);

  return useMemo(() => {
    if (!data) return [];
    return data.map((data: IMiniChefFarmData) => data.pair);
  }, [data]);
}
