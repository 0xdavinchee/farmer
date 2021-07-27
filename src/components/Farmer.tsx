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

interface IExistingLPPosition {
  readonly independentToken: string;
  readonly dependentToken: string;
  readonly pair: string;
  readonly pid: string;
}

export const Farmer = () => {
  const [chainID, setChainID] = useState<number | null>(null);
  const [existingContracts, setExistingContracts] =
    useState<IExistingContracts | null>(null);
  const [farmer, setFarmer] = useState<SushiFarmer | undefined>();
  const [farmerAddress, setFarmerAddress] = useState<string | null>();
  const [owner, setOwner] = useState<string | null>();
  const [user, setUser] = useState<string | null>();
  const [existingLpPositions, setExistingLpPositions] = useState<IExistingLPPosition[]>([]);

  const isUserOwnerOfContract = owner === user;

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
    if (chainID == null || existingContracts == null) return;
    setFarmerAddress(existingContracts[chainID]);
  }, [chainID, existingContracts]);

  /** Get existing LP positions on the current chain. */
  useEffect(() => { 
    if (!chainID) return;
    (async () => {
      // const existingLPPositions = await getExistingLPPositions();
      // setExistingLpPositions(existingLPPositions)
    })()
  }, [chainID]);

  useEffect(() => {
    if (isGlobalEthereumObjectEmpty) return;
    (window as any).ethereum.on("chainChanged", (chainId: number) => {
      setChainID(chainId);
    });

    return () => {
      (window as any).ethereum.removeListener("chainChanged", () => {});
    };
  }, []);

  useEffect(() => {
    if (isGlobalEthereumObjectEmpty) return;
    (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
      setUser(accounts[0]);
    });

    return () => {
      (window as any).ethereum.removeListener("accountsChanged", () => {});
    };
  }, []);

  const createFarmer = () => {
    // TODO: create a new farmer contract where the user is the creator of the contract.
  };

  const addExistingFarmer = async () => {
    if (!farmerAddress) return;
    const isAddress = ethers.utils.isAddress(farmerAddress);
    if (!isAddress) {
      // alert user that address is not valid.
      return;
    }
    const farmerContract = initializeContract(
      farmerAddress,
      ContractType.SushiFarmer
    );
    if (farmerContract) {
      const owner = await farmerContract.owner();
      setOwner(owner);
    }
    setFarmer(farmerContract);
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
