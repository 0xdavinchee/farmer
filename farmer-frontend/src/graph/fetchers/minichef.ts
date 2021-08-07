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

export interface IMiniChefFarmData {
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

interface IResponse<T> {
    readonly pools: T[];
}

export const miniChef = async (
    query: any,
    chainId = ChainId.MAINNET
): Promise<IResponse<IMiniChefFarmData>> =>
    request(
        `${GRAPH_HOST[chainId]}/subgraphs/name/${MINICHEF[chainId]}`,
        query
    );

export const getMiniChefFarms = async (chainId = ChainId.MAINNET) => {
    const { pools } = await miniChef(miniChefPoolsQuery, chainId);
    return pools || [];
};

export const getMiniChefPairAddresses = async (chainId = ChainId.MAINNET) => {
    const { pools } = await miniChef(miniChefPairAddressesQuery, chainId);
    return pools || [];
};
