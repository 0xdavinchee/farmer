import { ethers } from "ethers";
import { SushiFarmer } from "../typechain";
import { ContractType, contractTypeToArtifactMap } from "./constants";

export const isGlobalEthereumObjectEmpty =
  typeof (window as any).ethereum == null;

export async function requestAccount() {
  const ethereum = (window as any).ethereum;
  if (isGlobalEthereumObjectEmpty) return;

  return await ethereum.request({ method: "eth_requestAccounts" });
}

export function initializeContract(
  contractAddress: string | undefined,
  contractType: ContractType
) {
  let contract;
  const ethereum = (window as any).ethereum;
  const abi = contractTypeToArtifactMap.get(contractType);
  if (isGlobalEthereumObjectEmpty || !abi || !contractAddress) return;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  if (contractType === ContractType.SushiFarmer) {
    contract = new ethers.Contract(contractAddress, abi, signer) as SushiFarmer;
  }

  return contract;
}
