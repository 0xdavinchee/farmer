import useSWR from "swr";
import { useWeb3Context } from "../../hooks/web3Context";
import { getAverageBlockTime } from "../fetchers/blocks";

export function useAverageBlockTime(swrConfig = undefined) {
    const { chainID } = useWeb3Context();

    const { data } = useSWR<number>(
        chainID ? ["averageBlockTime,", chainID] : null,
        (_, chainId) => getAverageBlockTime(chainId),
        swrConfig
    );

    return data || 0;
}
