import { Contract, ContractInterface } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { ChainId } from "@sushiswap/sdk";
import zip from 'lodash/zip';
import { useWeb3Context } from "../hooks/web3Context";
import MiniChefArtifact from "../artifacts/contracts/interfaces/IMiniChefV2.sol/IMiniChefV2.json";
import { Chef } from "../enum";

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch: number;
}

type AddressMap = { [chainId: number]: string };
export const MINICHEF_ADDRESS: AddressMap = {
  [ChainId.MATIC]: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
  [ChainId.XDAI]: "0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3",
  [ChainId.HARMONY]: "0x67dA5f2FfaDDfF067AB9d5F025F8810634d84287",
};

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Infinity,
};

// account is optional
export function getContract(address: string, ABI: ContractInterface): Contract {
  if (
    !ethers.utils.isAddress(address) ||
    address === ethers.constants.AddressZero
  ) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI);
}
// returns null on errors
export function useContract(
  address: string | undefined,
  ABI: ContractInterface,
  withSignerIfPossible = true
): Contract | null {
  // const { chainID } = useWeb3Context();
  const chainID = 100;
  return useMemo(() => {
    if (!address || !ABI) return null;
    try {
      return getContract(address, ABI);
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, withSignerIfPossible]);
}
