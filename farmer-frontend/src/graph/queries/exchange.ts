import gql from "graphql-tag";

// Pairs...
export const pairFieldsQuery = gql`
  fragment pairFields on Pair {
    id
    reserveUSD
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    trackedReserveETH
    token0 {
      ...PairToken
    }
    token1 {
      ...PairToken
    }
    reserve0
    reserve1
    token0Price
    token1Price
    totalSupply
    txCount
    timestamp
  }
  fragment PairToken on Token {
    id
    name
    symbol
    totalSupply
    derivedETH
  }
`;

export const pairsQuery = gql`
  query pair(
    $skip: Int = 0
    $first: Int = 1000
    $where: Pair_filter
    $block: Block_height
    $orderBy: Pair_orderBy = "trackedReserveETH"
    $orderDirection: OrderDirection = "desc"
  ) {
    pairs(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      block: $block
      where: $where
    ) {
      ...pairFields
    }
  }
  ${pairFieldsQuery}
`;
