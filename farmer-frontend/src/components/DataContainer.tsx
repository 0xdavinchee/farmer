import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { PairType } from "../enum";
import { IExchangePair } from "../graph/fetchers/exchange";
import { IMiniChefFarmDataLight } from "../graph/fetchers/minichef";
import { useWeb3Context } from "../hooks/web3Context";
import { ContractType } from "../utils/constants";
import { getContract } from "../utils/helpers";

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
    const [moreOptions, setMoreOptions] = useState(false);
    const [tokenAAmount, setTokenAAmount] = useState("");
    const [tokenBAmount, setTokenBAmount] = useState("");
    const [lpAmount, setLpAmount] = useState("");
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",

        // These options are needed to round to whole numbers if that's what you want.
        // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    const { chainID } = useWeb3Context();
    const sushiFarmer = getContract(chainID, ContractType.SushiFarmer);

    const rewardA = data.rewards[0].token;
    const rewardB = data.rewards[1].token;

    const autocompoundPosition = async () => {
        if (!sushiFarmer) return;

        try {
            await sushiFarmer.autoCompoundExistingLPPosition(
                data.miniChef.id,
                data.pair.id,
                []
            );
        } catch (err) {
            console.error(err);
        }
    };

    const createNewLPAndDeposit = async () => {
        if (!sushiFarmer) return;

        try {
            await sushiFarmer.createNewLPAndDeposit({
                pid: data.miniChef.id,
                amountADesired: tokenAAmount,
                amountBDesired: tokenBAmount,
                pair: data.pair.id,
                tokenA: data.pair.token0.id,
                tokenB: data.pair.token1.id,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const claimRewards = async () => {
        if (!sushiFarmer) return;
        try {
            await sushiFarmer.claimRewards(data.miniChef.id);
        } catch (err) {
            console.error(err);
        }
    };

    const unstakeLP = async () => {
        if (!sushiFarmer) return;
        try {
            await sushiFarmer.withdrawLP(data.miniChef.id, lpAmount);
        } catch (err) {
            console.error(err);
        }
    };

    const withdrawLP = async () => {
        if (!sushiFarmer) return;
        try {
            await sushiFarmer.withdrawFunds(data.pair.id, lpAmount);
        } catch (err) {
            console.error(err);
        }
    };

    // load LP balance
    // load staked balance
    // load pending rewards
    useEffect(() => {
        if (!isExpanded) return;
    }, [isExpanded]);

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

                                <Button
                                    variant="outlined"
                                    onClick={claimRewards}
                                >
                                    Claim Rewards
                                </Button>
                            </div>
                            <div className="farmer-add-lp-deposit">
                                <TextField
                                    label={data.pair.token0.symbol + " amount"}
                                    className="add-lp-amount-input"
                                    value={tokenAAmount}
                                    onChange={(e) =>
                                        setTokenAAmount(e.target.value)
                                    }
                                />
                                <TextField
                                    label={data.pair.token1.symbol + " amount"}
                                    className="add-lp-amount-input"
                                    value={tokenBAmount}
                                    onChange={(e) =>
                                        setTokenBAmount(e.target.value)
                                    }
                                />
                                <Button
                                    variant="outlined"
                                    onClick={createNewLPAndDeposit}
                                >
                                    Add LP and Deposit
                                </Button>
                            </div>
                            <Typography
                                className="more-options"
                                variant="body1"
                                color="primary"
                                onClick={() => setMoreOptions(!moreOptions)}
                            >
                                {(moreOptions ? "Less" : "More") + " Options"}
                            </Typography>
                            {moreOptions && (
                                <div className="more-options-buttons">
                                    <TextField
                                        label={"LP amount"}
                                        value={lpAmount}
                                        onChange={(e) =>
                                            setLpAmount(e.target.value)
                                        }
                                    />
                                    <Button
                                        className="more-option-button"
                                        variant="outlined"
                                        onClick={withdrawLP}
                                    >
                                        Withdraw LP
                                    </Button>
                                    <Button
                                        className="more-option-button"
                                        variant="outlined"
                                        onClick={unstakeLP}
                                    >
                                        Unstake LP
                                    </Button>
                                    <Button
                                        className="more-option-button"
                                        variant="outlined"
                                        onClick={autocompoundPosition}
                                    >
                                        Autocompound Position
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Container>
                </>
            )}
        </Card>
    );
};
