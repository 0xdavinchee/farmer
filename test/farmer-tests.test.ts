import { expect } from "./chai-setup";
import { SushiFarmer } from "../typechain";
import { ethers, deployments } from "hardhat";
import { sushi } from "@lufycz/sushi-data";
import { ChainId, Token, WETH9, Trade, Percent } from "@sushiswap/sdk";
import tokenList from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json"
import { POOLS } from "./utils/constants";

const setup = async () => {
  await deployments.fixture(["SushiFarmer"]);
  const contracts = {
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
  };

  return { ...contracts };
};

const getTimeNow = () => Math.floor(new Date().getTime() / 1000) - 1;

describe("SushiFarmer Tests", function () {
  it("Should allow me to get my pools", async () => {
    // get all the minichef pool pairs available on matic atm
    const poolPairs = await sushi.exchange.pairs({
      chainId: 137,
      timestamp: getTimeNow(), // go back one second just to be safe
      addresses: POOLS.map((x) => x.pair), // hardcode the pool pair addresses for now
    });
    console.log("poolPairs: ", poolPairs);

    const userPairs = await sushi.masterchef.user({
      chainId: 137,
      timestamp: getTimeNow(),
      address: process.env.USER_ADDRESS,
    });

    console.log("userPairs: ", userPairs);
    const maticTokens = tokenList.tokens.filter(x => x.chainId === ChainId.MATIC);
    console.log("matic token list", maticTokens);
  });
  it("Should not allow non-owner to carry out any actions.", async function () {});

  it("Should get amount of LP tokens that is reasonable.", async function () {});

  it("Should be able to add LP position to contract.", async function () {});

  it("Should be able to remove LP position from contract.", async function () {});

  it("Should be able to claim rewards.", async function () {});

  it("Should be able to swap rewards for LP assets.", async function () {});

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
