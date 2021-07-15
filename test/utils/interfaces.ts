import {
  IComplexRewardTimer,
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair,
  IUniswapV2Router02,
  SushiFarmer,
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

export interface IBaseTestObject {
  farmer: SushiFarmer;
  miniChef: IMiniChefV2;
  router: IUniswapV2Router02;
  whale: {
    address: string;
  } & {
    ComplexRewardTimer: IComplexRewardTimer;
    MiniChef: IMiniChefV2;
    SushiFarmer: SushiFarmer;
    SushiRouter: IUniswapV2Router02;
    Sushi: IERC20;
    WMATIC: IERC20;
    V2Pair: IUniswapV2Pair;
    IndependentToken: IERC20;
    DependentToken: IERC20;
  };
}

export interface ISetupProps {
  pair: string;
  independentToken: string;
  dependentToken: string;
}