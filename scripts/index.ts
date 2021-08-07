import http from "http";
import express from "express";
import { sushi } from "@lufycz/sushi-data";
import { ethers } from "hardhat";
import SushiFarmerArtifact from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import { SushiFarmer } from "../typechain";
import { ChainId } from "@sushiswap/sdk";
import { IExchangePair } from "../test/utils/interfaces";
import {
    createPairs,
    getRewardToTokenPaths,
    maticPairAddresses,
    maticTokenObject,
} from "../test/utils/helper";
import { ADDRESS } from "../test/utils/constants";

interface IExistingLPPosition {
    readonly dependentTokenAddress: string;
    readonly independentTokenAddress: string;
    readonly pair: string;
    readonly pid: number;
}

interface IRewardsForTokenPaths {
    readonly tokenAPath: string[];
    readonly tokenBPath: string[];
}

interface ICompoundLPPosition {
    readonly pid: number;
    readonly pair: string;
    readonly data: IRewardsForTokenPaths[];
}

const HOUR = 60 * 60;
const INTERVAL = 8 * HOUR;

const PORT = 3000;
const app = express();
http.createServer(app).listen(PORT, () =>
    console.log("Running on port ", PORT)
);

const networkToFarmerAddressMap = new Map([
    [ChainId.MATIC, process.env.MATIC_SUSHI_FARMER],
]);

const networkToRewardAddressMap = new Map([
    [
        ChainId.MATIC,
        {
            rewardA: ADDRESS[ChainId.MATIC].SUSHI,
            rewardB: ADDRESS[ChainId.MATIC].WMATIC,
        },
    ],
]);

const autoCompoundSushiFarmerLPPositions = async () => {
    const networks = [ChainId.MATIC]; // array of numbers
    let data: ICompoundLPPosition[] = [];

    for (let i = 0; i < networks.length; i++) {
        const chainId = networks[i];
        const rewards = networkToRewardAddressMap.get(chainId);

        // get pair/contract information which we will be utilizing for this
        // network
        const latestBlock = (await sushi.blocks.latestBlock({ chainId })) - 2;
        const basePairs: IExchangePair[] = await sushi.exchange.pairs({
            chainId,
            latestBlock, // go back one second just to be safe
            addresses: maticPairAddresses, // pair addresses (base tokens)
        });
        const pairs = createPairs(basePairs, maticTokenObject);
        const farmerAddress = networkToFarmerAddressMap.get(networks[i]);
        const sushiFarmer = (await ethers.getContractAt(
            SushiFarmerArtifact.abi,
            farmerAddress || ""
        )) as SushiFarmer;

        // TODO: get existing LP position data from sushi and wherever else is needed and
        // convert it to type IExistingLPPosition
        let existingPositions: IExistingLPPosition[] = [];

        for (let j = 0; j < existingPositions.length; j++) {
            if (!rewards) {
                continue;
            }
            const existingPosition = existingPositions[j];
            // get the rewardPathsData from our existing LP position data
            const rewardToTokenPathsData = getRewardToTokenPaths(
                pairs,
                [
                    existingPosition.independentTokenAddress,
                    existingPosition.dependentTokenAddress,
                ],
                [
                    {
                        address: rewards.rewardA,
                        rewardAmount: ethers.BigNumber.from(0),
                    },
                    {
                        address: rewards.rewardB,
                        rewardAmount: ethers.BigNumber.from(0),
                    },
                ]
            );

            // push this new data to be processed
            data.push({
                data: rewardToTokenPathsData,
                pair: existingPosition.pair,
                pid: existingPosition.pid,
            });
        }

        // TODO: ensure that you specify the caller of the contract
        // we will probably use different addresses depending on the network
        // for mitigating risk
        const promises = data.map((x) =>
            sushiFarmer.autoCompoundExistingLPPosition(x.pid, x.pair, x.data)
        );
        await Promise.all(promises); // can have one script handle all networks and all farms
    }

    // can split it by network
    // can split it by farms
    // can split it by network + farm (each script is for one farm on one network)
    // regardless of the above, we want this function to:

    // get a list of your farmed LP positions,
    // you will get the pid, pair of the farm your LP tokens are staked
    // you will know what the underlying tokens are
    // and thus you can use this to determine the token paths for each
    // using the sushiswap sdk (rewardA/B => tokenA/B)
    // if the reward and the token are the same, don't use the SDK, just
    // set the array where it's just two elements same address
    // is it better to loop through and do multiple txns
    // or is it better to just do one txn and loop through in solidity
    // concerned that if there are too many farm positions that it will
    // error out because of single txn gas limit
};

setInterval(async () => {
    try {
        await autoCompoundSushiFarmerLPPositions();
    } catch (error) {
        console.error(error);
        // send an email to my email address: process.env.EMAIL_ADDRESS
    }
}, INTERVAL);
