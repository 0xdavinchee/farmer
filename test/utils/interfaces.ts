import { Token } from "@sushiswap/sdk";
import { BigNumber, BigNumberish } from "ethers";
import {
  IComplexRewardTimer,
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair
} from "../../typechain";

export interface IExchangePair {
  id: string;
  token0: IExchangeToken;
  token1: IExchangeToken;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  reserveETH: number;
  reserveUSD: number;
  trackedReserveETH: number;
  token0Price: number;
  token1Price: number;
  volumeToken0: number;
  volumeToken1: number;
  volumeUSD: number;
  untrackedVolumeUSD: number;
  txCount: number;
}

export interface IExchangeToken {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  derivedETH: number;
}

export interface IUser {
  address: string;
  ComplexRewardTimer: IComplexRewardTimer;
  MiniChef: IMiniChefV2;
  RewardTokenA: IERC20;
  RewardTokenB: IERC20;
  V2Pair: IUniswapV2Pair;
  IndependentToken: IERC20;
  DependentToken: IERC20;
}

export interface ISetupProps {
  pair: string;
  independentToken: string;
  dependentToken: string;
  rewardTokenA: string;
  rewardTokenB: string;
  chainId: number;
}

export interface ITokenObject {
  [symbol: string]: Token;
}

export interface IRewardTokenData {
  address: string;
  rewardAmount: BigNumber;
}

export interface ITestTokenInfo {
  address: string;
  amount: BigNumberish;
  decimals: number;
}