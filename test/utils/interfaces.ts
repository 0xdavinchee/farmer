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