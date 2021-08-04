import {
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@material-ui/core";
import { ChainId } from "@sushiswap/sdk";
import { useState } from "react";
import { Chef, PairType } from "../enum";
import { useMiniChefFarms, useMiniChefPairAddresses } from "../graph/hooks";
import { useSushiPairs } from "../graph/hooks/exchange";

export const Farms = () => {
  const [myPools, setMyPools] = useState(true);

  const pairAddresses = useMiniChefPairAddresses();
  const farms = useMiniChefFarms();

  const swapPairs = useSushiPairs({
    where: {
      id_in: pairAddresses,
    },
  });

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
