import { Container } from "@material-ui/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { SushiFarmer } from "../typechain";
import { ContractType, PATH, Storage } from "../utils/constants";
import { getContract } from "../utils/helpers";
import { IExistingContracts } from "../utils/interface";
import {
    BrowserRouter,
    Route,
    Switch,
    useHistory,
    useLocation,
} from "react-router-dom";
import Nav from "./Nav";
import { AddFarmer } from "./AddFarmer";
import { useWeb3Context } from "../hooks/web3Context";
import { Farms } from "../views/Farms";
import { Settings } from "../views/Settings";

const checkHasVisited = () => {
    try {
        return localStorage.getItem(Storage.HasVisited) === "true";
    } catch {
        return false;
    }
};

const Router = () => {
    const [existingContracts, setExistingContracts] =
        useState<IExistingContracts | null>(null);
    const [farmer, setFarmer] = useState<SushiFarmer | undefined>();
    const [farmerAddress, setFarmerAddress] = useState("");
    const [owner, setOwner] = useState("");
    const [existingLpPositions, setExistingLpPositions] = useState<
        IExistingLPPosition[]
    >([]);
    const history = useHistory();
    const location = useLocation();

    const { user, chainID } = useWeb3Context();

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

    useEffect(() => {
        if (location.pathname !== PATH.Landing) return;
        const hasEntered = checkHasVisited();

        if (hasEntered) {
            history.push(PATH.Home);
        } else {
            history.push(PATH.Landing);
        }
    }, [history, location.pathname]);

    const addExistingFarmer = async (farmerAddress: string) => {
        if (!farmerAddress || !farmerAddress.trim() || !chainID) return;
        const isAddress = ethers.utils.isAddress(farmerAddress);
        if (!isAddress) {
            return;
        }
        try {
            const farmerContract = getContract(
                chainID,
                ContractType.SushiFarmer
            );
            if (farmerContract) {
                const owner = await farmerContract.owner();
                setOwner(owner);
            }
            setFarmer(farmerContract);
            const storageContracts = {
                ...existingContracts,
                [chainID]: farmerAddress,
            };
            const stringifiedContracts = JSON.stringify(storageContracts);
            localStorage.setItem(
                Storage.ContractAddresses,
                stringifiedContracts
            );
            localStorage.setItem(Storage.HasVisited, "true");
            history.push(PATH.Home);
        } catch (err) {
            console.error(err);
        }
    };

    const testStuff = async () => {
        if (!farmer) return;
        const owner = await farmer.owner();
        console.log(owner);
    };

	const handleSave = async () => {
		// if (farmerAddress !== localstorageFarmerAddress) {
		// 	await addExistingFarmer(farmerAddress);
		// }
	}

    return (
        <Switch>
            <Route path={PATH.Landing} exact>
                <AddFarmer
                    farmerAddress={farmerAddress}
                    createFarmer={() => addExistingFarmer(farmerAddress)}
                    setFarmerAddress={(x) => setFarmerAddress(x)}
                />
            </Route>
            <Route path={PATH.Home} exact>
                <Farms />
            </Route>
            <Route path={PATH.Settings} exact>
                <Settings
					farmer={farmer}
                    farmerAddress={farmerAddress}
                    setFarmerAddress={(x) => setFarmerAddress(x)}
					save={() => handleSave()}
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
    return (
        <div>
            <BrowserRouter>
                <Nav />
                <Container>
                    <Router />
                </Container>
            </BrowserRouter>
        </div>
    );
};
