import { AppBar, Button, Toolbar, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import farmer from "../farmer.png";
import { useWeb3Context } from "../hooks/web3Context";
import { PATH } from "../utils/constants";

const Nav = () => {
    const { connected, connect, disconnect } = useWeb3Context();

    return (
        <AppBar position="static">
            <Toolbar className="nav-container">
                <div className="anchor logo-container">
                    <Link className="logo-link" to="/farm">
                        <img
                            className="farmer-logo"
                            src={farmer}
                            alt="farmer-logo"
                        />
                        <Typography variant="h4" className="nav-title">
                            farmer
                        </Typography>
                    </Link>
                </div>
                <div>
                  <Link className="nav-link link-text" to={PATH.Home}>
                        Farm
                    </Link>
                    <Link className="nav-link link-text" to={PATH.Settings}>
                        Settings
                    </Link>
                    {!connected && (
                        <Button
                            className="button nav-button"
                            variant="contained"
                            onClick={connect}
                        >
                            Connect Wallet
                        </Button>
                    )}
                    {connected && (
                        <Button
                            className="button nav-button"
                            variant="contained"
                            onClick={disconnect}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Nav;
