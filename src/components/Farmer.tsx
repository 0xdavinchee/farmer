import { Button, Container, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { SushiFarmer } from "../typechain";
import { ContractType, PATH, Storage } from "../utils/constants";
import {
  initializeContract,
  isGlobalEthereumObjectEmpty,
} from "../utils/helpers";
import { IExistingContracts } from "../utils/interface";
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import Nav from "./Nav";
import { ILandingProps, Landing } from "./Landing";

const checkHasVisited = () => {
  try {
    return localStorage.getItem(Storage.HasVisited) === "true";
  } catch {
    return false;
  }
};
interface IRouterProps extends ILandingProps {}

const Router = ({
  farmerAddress,
  createFarmer,
  setFarmerAddress,
}: IRouterProps) => {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== PATH.Landing) return;
    const hasEntered = checkHasVisited();

    if (hasEntered) {
      history.push(PATH.Home);
    } else {
      history.push(PATH.Landing);
    }
  }, [history, location.pathname]);

  return (
    <Switch>
      <Route path={PATH.Landing}>
        <Landing
          farmerAddress={farmerAddress}
          createFarmer={createFarmer}
          setFarmerAddress={(x) => setFarmerAddress(x)}
        />
      </Route>
    </Switch>
  );
};

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
  const [farmerAddress, setFarmerAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [user, setUser] = useState("");
  const [existingLpPositions, setExistingLpPositions] = useState<
    IExistingLPPosition[]
  >([]);

  const isUserOwnerOfContract = owner === user && user !== "";

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

  /** Add existing farmer address if there is one saved in localStorage. */
  useEffect(() => {
    if (chainID == null || existingContracts == null) return;
    setFarmerAddress(existingContracts[chainID]);
    addExistingFarmer(existingContracts[chainID]);
  }, [chainID, existingContracts]);

  /** Get existing LP positions on the current chain. */
  useEffect(() => {
    if (!chainID) return;
    (async () => {
      // const existingLPPositions = await getExistingLPPositions();
      // setExistingLpPositions(existingLPPositions)
    })();
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

  const addExistingFarmer = async (farmerAddress: string) => {
    if (!farmerAddress.trim()) return;
    const isAddress = ethers.utils.isAddress(farmerAddress);
    if (!isAddress) {
      return;
    }
    try {
      const farmerContract = initializeContract(
        farmerAddress,
        ContractType.SushiFarmer
      );
      if (farmerContract) {
        const owner = await farmerContract.owner();
        setOwner(owner);
      }
      setFarmer(farmerContract);
      localStorage.setItem(Storage.HasVisited, "true");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <BrowserRouter>
        <Nav userAddress={user} setUserAddress={(x) => setUser(x)} />
        <Container>
          <Router
            farmerAddress={farmerAddress}
            createFarmer={() => addExistingFarmer(farmerAddress)}
            setFarmerAddress={(x) => setFarmerAddress(x)}
          />
        </Container>
      </BrowserRouter>
    </div>
  );
};
