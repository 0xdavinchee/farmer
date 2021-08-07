import gql from "graphql-tag";

const blockFieldsQuery = gql`
    fragment blockFields on Block {
        id
        number
        timestamp
    }
`;

export const blocksQuery = gql`
    query blocksQuery(
        $first: Int! = 1000
        $skip: Int! = 0
        $start: Int!
        $end: Int!
    ) {
        blocks(
            first: $first
            skip: $skip
            orderBy: number
            orderDirection: desc
            where: { timestamp_gt: $start, timestamp_lt: $end }
        ) {
            ...blockFields
        }
    }
    ${blockFieldsQuery}
`;
