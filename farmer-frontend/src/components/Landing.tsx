import { Button, TextField, Typography } from "@material-ui/core";
import Alert from "@material-ui/core/Alert";
import { ethers } from "ethers";

const ADDRESS_LENGTH = 42;

export interface ILandingProps {
  readonly farmerAddress: string;
  readonly createFarmer: () => void;
  readonly setFarmerAddress: (address: string) => void;
}

export const Landing = ({
  farmerAddress,
  createFarmer,
  setFarmerAddress,
}: ILandingProps) => {
  const isInvalidAddress =
    farmerAddress.length === ADDRESS_LENGTH &&
    !ethers.utils.isAddress(farmerAddress);

  return (
    <div>
      <div className="landing-page-container">
        <Typography variant="h4">enter farmer contract address</Typography>
        <TextField
          className="landing-input"
          value={farmerAddress || ""}
          onChange={(
            e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
          ) => setFarmerAddress(e.target.value)}
        />
        <Button
          className="landing-button"
          color="primary"
          disabled={farmerAddress.length < ADDRESS_LENGTH || isInvalidAddress}
          variant="contained"
          onClick={createFarmer}
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
