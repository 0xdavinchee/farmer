import { BigNumberish, ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { SushiFarmer } from "../typechain";
import { ContractType, contractTypeToArtifactMap, Storage } from "./constants";
import { IExistingContracts } from "./interface";

export const isGlobalEthereumObjectEmpty =
    typeof (window as any).ethereum == null;

export const requestAccount = async () => {
    const ethereum = (window as any).ethereum;
    if (isGlobalEthereumObjectEmpty) return;

    return await ethereum.request({ method: "eth_requestAccounts" });
};

export const getContractAddress = (chainId: number) => {
    const stringExistingContracts = localStorage.getItem(
        Storage.ContractAddresses
    );
    if (stringExistingContracts) {
        const parsedContracts: IExistingContracts = JSON.parse(
            stringExistingContracts
        );
        return parsedContracts[chainId];
    }
};

export const getContract = (
    chainId: number,
    contractType: ContractType
) => {
    const abi = contractTypeToArtifactMap.get(contractType);
    if (isGlobalEthereumObjectEmpty || !abi) return;

    // if you want to impersonate an account for testing you have to use a local
    // JsonRpcProvider, you cannot use Metamask to do this
    let signer;
    if (process.env.NODE_ENV === "development") {
        const provider = new JsonRpcProvider("http://localhost:8545");
        const accountToImpersonate = process.env.REACT_APP_WHALE_TEST_ADDRESS;
        signer = provider.getSigner(accountToImpersonate);
    } else {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.providers.Web3Provider(ethereum);
        signer = provider.getSigner();
    }
    let contract;
    const contractAddress = getContractAddress(chainId);
    if (contractType === ContractType.SushiFarmer && contractAddress) {
        contract = new ethers.Contract(
            contractAddress,
            abi,
            signer
        ) as SushiFarmer;
    }

    return contract;
};

export const toNum = (x: BigNumberish) => {
    return Number(x);
};
