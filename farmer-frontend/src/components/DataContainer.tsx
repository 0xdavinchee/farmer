import { Card, CardContent, Container, Typography } from "@material-ui/core";
import { PairType } from "../enum";
import { IExchangePair } from "../graph/fetchers/exchange";
import { IMiniChefFarmDataLight } from "../graph/fetchers/minichef";

interface IRewardsData {
    readonly token: string;
    readonly icon: string;
    readonly rewardPerBlock: number;
    readonly rewardPerDay: number;
    readonly rewardPrice: any;
}
export interface IData extends IMiniChefFarmDataLight {
    readonly accSushiPerShare: string;
    readonly allocPoint: string;
    readonly balance: number;
    readonly chef?: number | undefined;
    readonly id: string;
    readonly lastRewardTime: string;
    readonly miniChef: {
        readonly id: string;
        readonly sushiPerSecond: string;
        readonly totalAllocPoint: string;
    };
    readonly pair: IExchangePair & {
        decimals: number;
        type: PairType;
    };
    readonly rewarder: {
        readonly id: string;
        readonly rewardPerSecond: string;
        readonly rewardToken: string;
    };
    readonly rewards: IRewardsData[];
    readonly roiPerBlock: number;
    readonly roiPerDay: number;
    readonly roiPerHour: number;
    readonly roiPerMonth: number;
    readonly roiPerYear: number;
    readonly slpBalance: string;
    readonly tvl: number;
    readonly userCount: string;
}

export const DataContainer = ({ data }: { data: IData[] }) => {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",

        // These options are needed to round to whole numbers if that's what you want.
        // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    return (
        <div className="data-container">
            {data.map((x) => (
                <Card key={x.id} className="swap-pair">
                    <CardContent className="swap-pair-content">
                        <Container>
                            <Typography variant="body1">Pool</Typography>
                            <Typography variant="body1">
                                {
                                    (x.pair as unknown as IExchangePair).token0
                                        ?.symbol
                                }
                                /
                                {
                                    (x.pair as unknown as IExchangePair).token1
                                        ?.symbol
                                }
                            </Typography>
                            <Typography variant="body1">
                                TVL: {formatter.format(x.tvl)}
                            </Typography>
                        </Container>
                        <Container>
                            <Typography variant="body1">Rewards</Typography>
                            <div>
                                {x.rewards.map((x) => (
                                    <div className="reward-container">
                                        <img
                                            className="reward-icon"
                                            src={x.icon}
                                        />
                                        <Typography
                                            key={x.token}
                                            variant="body1"
                                        >
                                            {x.rewardPerDay.toFixed(2)}{" "}
                                            {x.token}/day (
                                            {formatter.format(x.rewardPrice)})
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </Container>
                        <Container>
                            <Typography variant="body1">APR</Typography>
                            <Typography variant="body1">
                                {(x.roiPerMonth * 100).toFixed(2)}% monthly
                            </Typography>
                            <Typography variant="body1">
                                {(x.roiPerYear * 100).toFixed(2)}% annualized
                            </Typography>
                        </Container>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
