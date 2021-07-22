import http from "http";
import express from "express";

const HOUR = 60 * 60;
const INTERVAL = 8 * HOUR;

const PORT = 3000;
const app = express();
http
  .createServer(app)
  .listen(PORT, () => console.log("Running on port ", PORT));

const autoCompoundLPPositions = async () => {
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
