import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
} from "@material-ui/core";
import { useState } from "react";
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

export const DataContainer = ({ data }: { data: IData }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tokenAAmount, setTokenAAmount] = useState("");
    const [tokenBAmount, setTokenBAmount] = useState("");
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",

        // These options are needed to round to whole numbers if that's what you want.
        // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    const rewardA = data.rewards[0].token;
    const rewardB = data.rewards[1].token;

    const createNewLPAndDeposit = async () => {};

    return (
        <Card key={data.id} className="swap-pair">
            <CardContent
                className="swap-pair-content"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Container>
                    <Typography variant="body1">Pool</Typography>
                    <Typography variant="body1">
                        {(data.pair as unknown as IExchangePair).token0?.symbol}
                        /
                        {(data.pair as unknown as IExchangePair).token1?.symbol}
                    </Typography>
                    <Typography variant="body1">
                        TVL: {formatter.format(data.tvl)}
                    </Typography>
                </Container>
                <Container>
                    <Typography variant="body1">Rewards</Typography>
                    <div>
                        {data.rewards.map((x) => (
                            <div className="reward-container" key={x.token}>
                                <img className="reward-icon" src={x.icon} />
                                <Typography key={x.token} variant="body1">
                                    {x.rewardPerDay.toFixed(2)} {x.token}
                                    /day ({formatter.format(x.rewardPrice)})
                                </Typography>
                            </div>
                        ))}
                    </div>
                </Container>
                <Container>
                    <Typography variant="body1">APR</Typography>
                    <Typography variant="body1">
                        {(data.roiPerMonth * 100).toFixed(2)}% monthly
                    </Typography>
                    <Typography variant="body1">
                        {(data.roiPerYear * 100).toFixed(2)}% annualized
                    </Typography>
                </Container>
            </CardContent>

            {isExpanded && (
                <>
                    <Container>
                        <hr className="farmer-hr" />
                    </Container>
                    <Container>
                        <CardContent>
                            <div className="farmer-pair-details">
                                <div>
                                    <Typography variant="body1">
                                        LP Balance: {0}
                                    </Typography>
                                    <Typography variant="body1">
                                        Staked Balance: {0}
                                    </Typography>
                                </div>
                                <div className="farmer-pair-rewards">
                                    <Typography variant="body1">
                                        Pending {rewardA}: {21}
                                    </Typography>
                                    <Typography variant="body1">
                                        Pending {rewardB}: {21}
                                    </Typography>
                                </div>

								<Button variant="outlined">Claim Rewards</Button>
                            </div>
                            <div className="farmer-add-lp-deposit">
                                <TextField
                                    label={data.pair.token0.symbol + " amount"}
                                    value={tokenAAmount}
                                    onChange={(e) =>
                                        setTokenAAmount(e.target.value)
                                    }
                                />
                                <TextField
                                    label={data.pair.token1.symbol + " amount"}
                                    value={tokenBAmount}
                                    onChange={(e) =>
                                        setTokenBAmount(e.target.value)
                                    }
                                />
                                <Button variant="outlined">
                                    Add LP and Deposit
                                </Button>
                            </div>
							<Button variant="outlined">Withdraw LP</Button>
							<Button variant="outlined">Unstake LP</Button>
							<Button variant="outlined">Autocompound Position</Button>
							<Button></Button>
                        </CardContent>
                    </Container>
                </>
            )}
        </Card>
    );
};
