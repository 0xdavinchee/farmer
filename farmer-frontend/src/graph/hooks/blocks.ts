import useSWR from "swr";
import { getAverageBlockTime } from "../fetchers/blocks";

export function useAverageBlockTime(swrConfig = undefined) {
  //   const { chainID } = useWeb3Context();
  const chainID = 100;

  const { data } = useSWR(
    chainID ? ["averageBlockTime,", chainID] : null,
    (_, chainId) => getAverageBlockTime(chainId),
    swrConfig
  );

  return data;
}
