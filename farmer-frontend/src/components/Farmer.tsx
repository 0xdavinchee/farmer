import { Container } from "@material-ui/core";
import { useEffect, useState } from "react";
import { ContractType, PATH, Storage } from "../utils/constants";
import { getContract, getContractAddresses } from "../utils/helpers";
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
            const existingContracts = getContractAddresses();
            if (existingContracts) {
                setExistingContracts(existingContracts);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    /** Add existing farmer address if there is one saved in localStorage. */
    useEffect(() => {
        if (chainID == null || existingContracts == null) return;
        setFarmerAddress(existingContracts[chainID]);
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

    return (
        <Switch>
            <Route path={PATH.Landing} exact>
                <AddFarmer
                />
            </Route>
            <Route path={PATH.Home} exact>
                <Farms />
            </Route>
            <Route path={PATH.Settings} exact>
                <Settings />
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
