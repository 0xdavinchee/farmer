import {
    Container,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@material-ui/core";
import { ChainId } from "@sushiswap/sdk";
import { useState } from "react";
import { DataContainer, IData } from "../components/DataContainer";
import { Chef, PairType } from "../enum";
import { IMiniChefFarmData } from "../graph/fetchers/minichef";
import { useMiniChefFarms, useMiniChefPairAddresses } from "../graph/hooks";
import { useAverageBlockTime } from "../graph/hooks/blocks";
import {
    useMaticPrice,
    useOnePrice,
    useStakePrice,
    useSushiPairs,
    useSushiPrice,
} from "../graph/hooks/exchange";
import { useWeb3Context } from "../hooks/web3Context";
import { toNum } from "../utils/helpers";

export const Farms = () => {
    const [myPools, setMyPools] = useState(true);
    const { chainID } = useWeb3Context();

    const pairAddresses = useMiniChefPairAddresses();
    const farms = useMiniChefFarms();

    const swapPairs = useSushiPairs({
        where: {
            id_in: pairAddresses,
        },
    });

    const averageBlockTime = useAverageBlockTime();
    const [sushiPrice, maticPrice, stakePrice, onePrice] = [
        useSushiPrice(),
        useMaticPrice(),
        useStakePrice(),
        useOnePrice(),
    ];

    const blocksPerDay = 86400 / Number(averageBlockTime);

    const map = (pool: IMiniChefFarmData) => {
        const swapPair = swapPairs.find((pair) => pair.id === pool.pair);

        const type = PairType.SWAP;

        const pair = swapPair;

        const blocksPerHour = 3600 / averageBlockTime;

        function getRewards() {
            const mcSushiPerSecond = toNum(pool.miniChef.sushiPerSecond);
            const allocPoint = toNum(pool.allocPoint);
            const totalAllocPoint = toNum(pool.miniChef.totalAllocPoint);
            const sushiPerBlock = (mcSushiPerSecond / 1e18) * averageBlockTime;

            const rewardPerBlock =
                (allocPoint / totalAllocPoint) * sushiPerBlock;

            const defaultReward = {
                token: "SUSHI",
                icon: "https://raw.githubusercontent.com/sushiswap/icons/master/token/sushi.jpg",
                rewardPerBlock,
                rewardPerDay: rewardPerBlock * blocksPerDay,
                rewardPrice: sushiPrice,
            };

            const defaultRewards = [defaultReward];

            if (pool.chef === Chef.MINICHEF) {
                const sushiPerSecond =
                    ((allocPoint / totalAllocPoint) * mcSushiPerSecond) / 1e18;
                const sushiPerBlock = sushiPerSecond * averageBlockTime;
                const sushiPerDay = sushiPerBlock * blocksPerDay;
                const rewardPerSecond =
                    ((allocPoint / totalAllocPoint) *
                        toNum(pool.rewarder.rewardPerSecond)) /
                    1e18;
                const rewardPerBlock = rewardPerSecond * averageBlockTime;
                const rewardPerDay = rewardPerBlock * blocksPerDay;

                const reward: {
                    [key: number]: {
                        token: string;
                        icon: string;
                        rewardPrice: string;
                    };
                } = {
                    [ChainId.MATIC]: {
                        token: "MATIC",
                        icon: "https://raw.githubusercontent.com/sushiswap/icons/master/token/polygon.jpg",
                        rewardPrice: maticPrice,
                    },
                    [ChainId.XDAI]: {
                        token: "STAKE",
                        icon: "https://raw.githubusercontent.com/sushiswap/icons/master/token/stake.jpg",
                        rewardPrice: stakePrice,
                    },
                    [ChainId.HARMONY]: {
                        token: "ONE",
                        icon: "https://raw.githubusercontent.com/sushiswap/icons/master/token/one.jpg",
                        rewardPrice: onePrice,
                    },
                };

                return [
                    {
                        ...defaultReward,
                        rewardPerBlock: sushiPerBlock,
                        rewardPerDay: sushiPerDay,
                    },
                    {
                        ...reward[chainID],
                        rewardPerBlock: rewardPerBlock,
                        rewardPerDay: rewardPerDay,
                    },
                ];
            }
            return defaultRewards;
        }

        const rewards = getRewards();

        const balance = toNum(toNum(pool.slpBalance) / 1e18);

        const tvl = swapPair
            ? (balance / Number(swapPair.totalSupply)) *
              Number(swapPair.reserveUSD)
            : 0;

        const roiPerBlock =
            rewards.reduce((previousValue, currentValue) => {
                return (
                    previousValue +
                    currentValue.rewardPerBlock * currentValue.rewardPrice
                );
            }, 0) / tvl;

        const roiPerHour = roiPerBlock * blocksPerHour;

        const roiPerDay = roiPerHour * 24;

        const roiPerMonth = roiPerDay * 30;

        const roiPerYear = roiPerMonth * 12;

        return {
            ...pool,
            pair: {
                ...pair,
                decimals: 18,
                type,
            },
            balance,
            roiPerBlock,
            roiPerHour,
            roiPerDay,
            roiPerMonth,
            roiPerYear,
            rewards,
            tvl,
        } as IData;
    };

    const data = farms
        .filter((farm) => {
            return swapPairs.find((pair) => pair.id === farm.pair);
        })
        .map(map);
    console.log("data", data);
    return (
        <Container maxWidth="md" className="farms-container">
            <div className="toggle-pools">
                <ToggleButtonGroup
                    color="primary"
                    value={myPools}
                    exclusive
                    onChange={(_e, val) => {
                        val != null && setMyPools(val);
                    }}
                >
                    <ToggleButton value={true}>My Pools</ToggleButton>
                    <ToggleButton value={false}>All Pools</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Typography variant="h4">Sushiswap</Typography>
			<div className="data-container">
				{data.map(x => <DataContainer data={x} />)}
			</div>
        </Container>
    );
};
