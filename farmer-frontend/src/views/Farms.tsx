import {
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@material-ui/core";
import { useState } from "react";

export const Farms = () => {
  const [myPools, setMyPools] = useState(true);
  return (
    <Container maxWidth="md" className="farms-container">
      <div className="toggle-pools">
        <ToggleButtonGroup
          color="primary"
          value={myPools}
          exclusive
          onChange={(_e, val) => setMyPools(val)}
        >
          <ToggleButton value={true}>My Pools</ToggleButton>
          <ToggleButton value={false}>All Pools</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Typography variant="h4">Sushiswap</Typography>

      <Typography variant="h4">Quickswap</Typography>
    </Container>
  );
};
