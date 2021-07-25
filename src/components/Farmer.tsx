import { Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { SushiFarmer } from "../typechain";
import { ContractType, Storage } from "../utils/constants";
import {
  initializeContract,
  isGlobalEthereumObjectEmpty,
} from "../utils/helpers";
import { IExistingContracts } from "../utils/interface";

export const Farmer = () => {
  const [existingContracts, setExistingContracts] =
    useState<IExistingContracts | null>(null);
  const [farmer, setFarmer] = useState<SushiFarmer | undefined>();
  const [farmerAddress, setFarmerAddress] = useState("");
  const [chainID, setChainID] = useState<number | null>(null);

  // we can store the contract addresses in localStorage, but we can also query events
  // and get all contracts created by the user (v2)
  useEffect(() => {
    try {
      const stringExistingContracts = localStorage.getItem(
        Storage.ContractAddresses
      );
      if (stringExistingContracts) {
        const parsedContracts: IExistingContracts = JSON.parse(
          stringExistingContracts
        );
        setExistingContracts(parsedContracts);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isGlobalEthereumObjectEmpty) return;
    (window as any).ethereum.on("chainChanged", (chainId: number) => {
      setChainID(chainId);
    });

    return () => {
      (window as any).ethereum.removeListener("chainChanged", () => {});
    };
  }, []);

  const createFarmer = () => {
      // TODO: create a new farmer contract where the user is the creator of the contract.
  }

  const addExistingFarmer = () => {
    const isAddress = ethers.utils.isAddress(farmerAddress);
    if (!isAddress) {
      // alert user that address is not valid.
      return;
    }
    const contract = initializeContract(
      farmerAddress,
      ContractType.SushiFarmer
    );
    setFarmer(contract);
  };

  return (
    <div>
      <Typography>Farmer</Typography>
      <TextField
        value={farmerAddress}
        onChange={(e) => setFarmerAddress(e.target.value)}
      />
      <Button onClick={addExistingFarmer}>Add Existing</Button>
      or
      <Button onClick={createFarmer}>Create</Button>
    </div>
  );
};
