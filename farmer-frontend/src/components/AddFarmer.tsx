import { Button, TextField, Typography } from "@material-ui/core";
import Alert from "@material-ui/core/Alert";
import { ethers } from "ethers";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useWeb3Context } from "../hooks/web3Context";
import { PATH, Storage } from "../utils/constants";
import { getContractAddresses } from "../utils/helpers";

const ADDRESS_LENGTH = 42;

export const AddFarmer = () => {
    const [farmerAddress, setFarmerAddress] = useState("");

    const { chainID } = useWeb3Context();

    const history = useHistory();

    const isInvalidAddress =
        farmerAddress.length === ADDRESS_LENGTH &&
        !ethers.utils.isAddress(farmerAddress);

    const addExistingFarmer = async () => {
        if (!farmerAddress || !farmerAddress.trim() || !chainID) return;
        const isAddress = ethers.utils.isAddress(farmerAddress);
        if (!isAddress) {
            return;
        }
        try {
            const existingContracts = getContractAddresses();
            if (existingContracts) {
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
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="landing-page-container">
                <Typography variant="h4">
                    enter farmer contract address
                </Typography>
                <TextField
                    className="landing-input"
                    value={farmerAddress || ""}
                    onChange={(
                        e: React.ChangeEvent<
                            HTMLTextAreaElement | HTMLInputElement
                        >
                    ) => setFarmerAddress(e.target.value)}
                />
                <Button
                    className="landing-button"
                    color="primary"
                    disabled={
                        farmerAddress.length < ADDRESS_LENGTH ||
                        isInvalidAddress
                    }
                    variant="contained"
                    onClick={() => addExistingFarmer()}
                >
                    <Typography variant="body1">create</Typography>
                </Button>
                {isInvalidAddress && (
                    <Alert severity="error">
                        The address you have entered is not a valid address.
                    </Alert>
                )}
            </div>
        </div>
    );
};
