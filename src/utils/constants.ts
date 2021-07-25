import SushiFarmerArtifact from "../artifacts/contracts/SushiFarmer.sol/SushiFarmer.json";
import UniswapRouterArtifact from "../artifacts/@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import UniswapV2PairArtifact from "../artifacts/@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json";

export enum ContractType {
  SushiFarmer = "SUSHI_FARMER",
  UniswapV2Pair = "UNISWAP_V2_PAIR",
  UniswapRouter = "UNISWAP_ROUTER",
}

export enum Storage {
  ContractAddresses = "CONTRACT_ADDRESSES",
}

export const contractTypeToArtifactMap = new Map([
  [ContractType.SushiFarmer, SushiFarmerArtifact.abi],
  [ContractType.UniswapRouter, UniswapRouterArtifact.abi],
  [ContractType.UniswapV2Pair, UniswapV2PairArtifact.abi],
]);
