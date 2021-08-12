import { ChainId } from "@sushiswap/sdk";
import useSWR, { SWRConfiguration } from "swr";
import { useWeb3Context } from "../../hooks/web3Context";
import {
    getMaticPrice,
    getOnePrice,
    getPairs,
    getStakePrice,
    getSushiPrice,
    IExchangePair,
} from "../fetchers/exchange";

export function useStakePrice(
    swrConfig: SWRConfiguration | undefined = undefined
) {
    const { chainID } = useWeb3Context();
    const shouldFetch = chainID && chainID === ChainId.XDAI;
    const { data } = useSWR(
        shouldFetch ? "stakePrice" : null,
        () => getStakePrice(),
        swrConfig
    );
    return data;
}

export function useOnePrice(
    swrConfig: SWRConfiguration | undefined = undefined
) {
    const { chainID } = useWeb3Context();
    const shouldFetch = chainID && chainID === ChainId.HARMONY;
    const { data } = useSWR(
        shouldFetch ? "onePrice" : null,
        () => getOnePrice(),
        swrConfig
    );
    return data;
}

export function useMaticPrice(
    swrConfig: SWRConfiguration | undefined = undefined
) {
    const { chainID } = useWeb3Context();
    const { data } = useSWR(
        chainID && chainID === ChainId.MATIC ? "maticPrice" : null,
        () => getMaticPrice(),
        swrConfig
    );
    return data;
}

export function useSushiPrice(
    swrConfig: SWRConfiguration | undefined = undefined
) {
    const { data } = useSWR("sushiPrice", () => getSushiPrice(), swrConfig);
    return data;
}

export function useSushiPairs(
    variables: any,
    query?: any,
    swrConfig?: SWRConfiguration | undefined
) {
    const { chainID } = useWeb3Context();
    const shouldFetch = chainID;
    const { data } = useSWR<IExchangePair[]>(
        shouldFetch ? ["sushiPairs", chainID, JSON.stringify(variables)] : null,
        (_, chainId) => getPairs(chainId, variables, query),
        swrConfig
    );
    return data || [];
}
