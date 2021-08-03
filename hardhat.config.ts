import { HardhatUserConfig } from "hardhat/config";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-prettier";
import "@typechain/hardhat";
import "solidity-coverage";
import { NetworkUserConfig } from "hardhat/types";

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 1337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  polygon: 137,
  harmony: 1666600000,
};

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const TEST_ACCOUNT = process.env.TEST_ACCOUNT || "";
const WHALE_TEST_ADDRESS = process.env.WHALE_TEST_ADDRESS || "";

const createUrl = (network: string) =>
  "https://" + network + ".infura.io/v3/" + INFURA_API_KEY;

const layerTwoUrlMap = new Map([
  ["harmony", "https://api.s0.t.hmny.io"],
  ["polygon", createUrl("polygon-mainnet")],
]);

const createTestnetConfig = (
  network: keyof typeof chainIds,
  isLayerTwo?: boolean
): NetworkUserConfig => {
  const url = isLayerTwo ? layerTwoUrlMap.get(network) : createUrl(network);
  return {
    accounts: [TEST_ACCOUNT],
    chainId: chainIds[network],
    url,
  };
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: createUrl("polygon-mainnet"),
      },
    },
    goerli: createTestnetConfig("goerli"),
    kovan: createTestnetConfig("kovan"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
    matic: createTestnetConfig("polygon"),
    harmony: createTestnetConfig("harmony"),
  },
  namedAccounts: {
    deployer: 0,
    whale: WHALE_TEST_ADDRESS,
  },
  mocha: {
    timeout: 250000,
  },
};

export default config;
