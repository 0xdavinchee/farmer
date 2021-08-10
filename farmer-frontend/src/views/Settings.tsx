import { Button, Container, TextField, Typography } from "@material-ui/core";
import { useState } from "react";
import { SushiFarmer } from "../typechain";

interface ISettingsProps {
    readonly farmer: SushiFarmer | undefined;
    readonly farmerAddress: string;
    readonly setFarmerAddress: (x: string) => void;
    readonly save: () => Promise<void>;
}

export const Settings = ({
    farmer,
    farmerAddress,
    setFarmerAddress,
    save,
}: ISettingsProps) => {
    const [rewardASavingsRate, setRewardASavingsRate] = useState("");
    const [rewardBSavingsRate, setRewardBSavingsRate] = useState("");

    const handleSave = async () => {
        await save();
        if (farmer) {
            await farmer.setRewardSavings(
                rewardASavingsRate,
                rewardBSavingsRate
            );
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
