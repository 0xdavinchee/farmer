import http from "http";
import express from "express";
import { ethers } from "hardhat";
import SushiFarmerArtifact from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import { SushiFarmer } from "../typechain";

interface IRewardsForTokenPaths {
  readonly tokenAPath: string[];
  readonly tokenBPath: string[];
}

interface IExistingLPPosition {
  readonly pid: number;
  readonly pair: string;
  readonly data: IRewardsForTokenPaths[];
}

const HOUR = 60 * 60;
const INTERVAL = 8 * HOUR;

const PORT = 3000;
const app = express();
http
  .createServer(app)
  .listen(PORT, () => console.log("Running on port ", PORT));

const autoCompoundLPPositions = async () => {
  const sushiFarmer = await ethers.getContractAt(SushiFarmerArtifact.abi, process.env.SUSHI_FARMER || "") as SushiFarmer;
  let data: IExistingLPPosition[] = [];
  const promises = data.map(x => sushiFarmer.autoCompoundExistingLPPosition(x.pid, x.pair, x.data));
  await Promise.all(promises);
  // can have one script handle all networks and all farms
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
    await autoCompoundLPPositions();
  } catch (error) {
    console.error(error);
    // send an email to my email address: process.env.EMAIL_ADDRESS
  }
}, INTERVAL);
