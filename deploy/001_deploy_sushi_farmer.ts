import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS } from "../test/utils/constants";
import { ChainId } from "@sushiswap/sdk";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("SushiFarmer", {
    from: deployer,
    args: [
      process.env.MINI_CHEF_V2_ADDRESS,
      ADDRESS[ChainId.MATIC].SUSHI,
      ADDRESS[ChainId.MATIC].WMATIC,
    ],
    log: true,
  });
};

export default func;
func.tags = ["SushiFarmer"];
