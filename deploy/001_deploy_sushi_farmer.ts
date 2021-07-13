import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("SushiFarmer", {
    from: deployer,
    args: [process.env.MINI_CHEF_V2_ADDRESS],
    log: true,
  });
};

export default func;
func.tags = ["SushiFarmer"];
