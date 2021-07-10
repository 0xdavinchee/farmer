import { expect } from "./chai-setup";
import { SushiFarmer } from "../typechain";
import { ethers, deployments } from "hardhat";

const setup = async () => {
  await deployments.fixture(["SushiFarmer"]);
  const contracts = {
    SushiFarmer: (await ethers.getContract(
      "SushiFarmer"
    )) as unknown as SushiFarmer,
  };

  return { ...contracts };
};

describe("SushiFarmer Tests", function () {
  it("Should not allow non-owner to carry out any actions.", async function () {});

  it("Should get amount of LP tokens that is reasonable.", async function () {});

  it("Should be able to add LP position to contract.", async function () {});

  it("Should be able to remove LP position from contract.", async function () {});

  it("Should be able to claim rewards.", async function () {});

  it("Should be able to swap rewards for LP assets.", async function () {});

  it("Should be able to swap LP tokens for underlying assets.", async function () {});

  it("Should be able to swap specified amount of assets for one specified output asset.", async function () {});
});
