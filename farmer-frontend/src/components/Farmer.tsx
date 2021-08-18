import { Container } from "@material-ui/core";
import { useEffect } from "react";
import { PATH, Storage } from "../utils/constants";
import {
    BrowserRouter,
    Route,
    Switch,
    useHistory,
    useLocation,
} from "react-router-dom";
import Nav from "./Nav";
import { AddFarmer } from "./AddFarmer";
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
            <Route path={PATH.Landing} exact>
                <AddFarmer />
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
