import { BigNumberish, ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { SushiFarmer } from "../typechain";
import { ContractType, contractTypeToArtifactMap } from "./constants";

export const isGlobalEthereumObjectEmpty =
    typeof (window as any).ethereum == null;

export const requestAccount = async () => {
    const ethereum = (window as any).ethereum;
    if (isGlobalEthereumObjectEmpty) return;

    return await ethereum.request({ method: "eth_requestAccounts" });
};

export const initializeContract = async (
    contractAddress: string | undefined,
    contractType: ContractType
) => {
    const abi = contractTypeToArtifactMap.get(contractType);
    if (isGlobalEthereumObjectEmpty || !abi || !contractAddress) return;

    // if you want to impersonate an account for testing you have to use a local
    // JsonRpcProvider, you cannot use Metamask to do this
    let signer;
    if (process.env.NODE_ENV === "development") {
        const provider = new JsonRpcProvider("http://localhost:8545");
        const accountToImpersonate = process.env.REACT_APP_WHALE_TEST_ADDRESS;
        await provider.send("hardhat_impersonateAccount", [
            accountToImpersonate,
        ]);
        signer = provider.getSigner(accountToImpersonate);
    } else {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.providers.Web3Provider(ethereum);
        signer = provider.getSigner();
    }
    let contract;
    const balance = await signer.getBalance();
    console.log("balance", ethers.utils.formatUnits(balance));
    if (contractType === ContractType.SushiFarmer) {
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
