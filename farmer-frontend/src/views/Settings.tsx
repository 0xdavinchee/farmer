import { Button, Container, TextField, Typography } from "@material-ui/core";
import { useState } from "react";
import { useWeb3Context } from "../hooks/web3Context";
import { ContractType, Storage } from "../utils/constants";
import { getContract, getContractAddresses } from "../utils/helpers";

export const Settings = () => {
    const [rewardASavingsRate, setRewardASavingsRate] = useState("");
    const [rewardBSavingsRate, setRewardBSavingsRate] = useState("");
    const { chainID } = useWeb3Context();
    const sushiFarmer = getContract(chainID, ContractType.SushiFarmer);
    const [farmerAddress, setFarmerAddress] = useState(
        sushiFarmer ? sushiFarmer.address : ""
    );

    const handleSave = async () => {
        if (!sushiFarmer) return;
        const existingContracts = getContractAddresses();
        if (existingContracts) {
            const storageContracts = {
                ...existingContracts,
                [chainID]: farmerAddress,
            };
            localStorage.setItem(
                Storage.ContractAddresses,
                JSON.stringify(storageContracts)
            );
        }
        try {
            await sushiFarmer.setRewardSavings(
                rewardASavingsRate,
                rewardBSavingsRate
            );
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container maxWidth="md" className="farms-container settings">
            <Typography variant="h3">Settings</Typography>
            <TextField
                className="settings-input"
                label="Contract Address"
                variant="standard"
                type="text"
                value={farmerAddress}
                onChange={(e) => setFarmerAddress(e.target.value)}
            />
            <TextField
                className="settings-input"
                label="Reward A Savings Rate"
                variant="standard"
                type="number"
                value={rewardASavingsRate}
                onChange={(e) => setRewardASavingsRate(e.target.value)}
            />
            <TextField
                className="settings-input"
                label="Reward B Savings Rate"
                variant="standard"
                value={rewardBSavingsRate}
                type="number"
                onChange={(e) => setRewardBSavingsRate(e.target.value)}
            />
            <div className="settings-button">
                <Button variant="contained" onClick={() => handleSave()}>
                    Save
                </Button>
            </div>
        </Container>
    );
};
