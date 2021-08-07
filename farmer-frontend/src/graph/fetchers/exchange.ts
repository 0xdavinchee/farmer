import { ChainId } from "@sushiswap/sdk";
import { GRAPH_HOST } from "../constants";
import { request } from "graphql-request";
import {
    ethPriceQuery,
    pairsQuery,
    tokenPriceQuery,
} from "../queries/exchange";
import { toNum } from "../../utils/helpers";

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

export interface ITokenPrice {
    readonly id: string;
    readonly derivedETH: string;
}

export interface IBundle {
    readonly id: string;
    readonly ethPrice: string;
}

export const exchange = async <T>(
    chainId = ChainId.MAINNET,
    query: any,
    variables: any
): Promise<T> =>
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
    const { pairs } = await exchange<{ pairs: IExchangePair[] }>(
        chainId,
        query,
        variables
    );
    return pairs || [];
};

export const getTokenPrice = async (
    chainId = ChainId.MAINNET,
    query: any,
    variables: any
) => {
    const ethPrice = await getEthPrice(chainId);

    const { token } = await exchange<{ token: ITokenPrice }>(
        chainId,
        query,
        variables
    );
    return toNum(token.derivedETH) * toNum(ethPrice);
};

export const getEthPrice = async (
    chainId = ChainId.MAINNET,
    variables = undefined
) => {
    const data = await getBundle(chainId, undefined, variables);
    return data.bundles[0].ethPrice;
};

export const getMaticPrice = async () => {
    return getTokenPrice(ChainId.MATIC, tokenPriceQuery, {
        id: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    });
};

export const getSushiPrice = async () => {
    return getTokenPrice(ChainId.MAINNET, tokenPriceQuery, {
        id: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    });
};

export const getStakePrice = async () => {
    return getTokenPrice(ChainId.XDAI, tokenPriceQuery, {
        id: "0xb7d311e2eb55f2f68a9440da38e7989210b9a05e",
    });
};

export const getOnePrice = async () => {
    return getTokenPrice(ChainId.HARMONY, tokenPriceQuery, {
        id: "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
    });
};
export const getBundle = async (
    chainId = ChainId.MAINNET,
    query = ethPriceQuery,
    variables = {
        id: 1,
    }
) => {
    return exchange<{ bundles: IBundle[] }>(chainId, query, variables);
};
