import { ChainId } from "@sushiswap/sdk";

export const MATIC_POOLS = [
    {
        accSushiPerShare: "15655082994441",
        allocPoint: "10",
        id: "9",
        pair: "0x396e655c309676caf0acf4607a868e0cded876db",
    },
    {
        accSushiPerShare: "239551845171138790056494",
        allocPoint: "45",
        id: "8",
        pair: "0x4b1f1e2435a9c96f7330faea190ef6a7c8d70001",
    },
    {
        accSushiPerShare: "64449144130041",
        allocPoint: "50",
        id: "7",
        pair: "0x74d23f21f780ca26b47db16b0504f2e3832b9321",
    },
    {
        accSushiPerShare: "4535189585825",
        allocPoint: "80",
        id: "6",
        pair: "0x2813d43463c374a680f235c428fb1d7f08de0b69",
    },
    {
        accSushiPerShare: "242471680762",
        allocPoint: "90",
        id: "5",
        pair: "0x6ff62bfb8c12109e8000935a6de54dad83a4f39f",
    },
    {
        accSushiPerShare: "6450229313841634324",
        allocPoint: "135",
        id: "3",
        pair: "0xe62ec2e799305e0d367b0cc3ee2cda135bf89816",
    },
    {
        accSushiPerShare: "3109562651033776136567",
        allocPoint: "30",
        id: "24",
        pair: "0x8f8e95ff4b4c5e354ccb005c6b0278492d7b5907",
    },
    {
        accSushiPerShare: "22427136717610093498",
        allocPoint: "5",
        id: "23",
        pair: "0x180237bd326d5245d0898336f54b3c8012c5c62f",
    },
    {
        accSushiPerShare: "34343083611",
        allocPoint: "4",
        id: "22",
        pair: "0x25e8bbc103842f0dad2465f4e04cb8d44fb787bc",
    },
    {
        accSushiPerShare: "2197648014728104256",
        allocPoint: "5",
        id: "21",
        pair: "0xd8d51ea2edca2c2ea15a053a5730f559d79a1570",
    },
    {
        accSushiPerShare: "195772481159502045",
        allocPoint: "135",
        id: "2",
        pair: "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9",
    },
    {
        accSushiPerShare: "4351102131564",
        allocPoint: "4",
        id: "19",
        pair: "0xa375d23a751124359568f3a22576528bd1c8c3e3",
    },
    {
        accSushiPerShare: "31928618432095",
        allocPoint: "4",
        id: "18",
        pair: "0x21ef14b5580a852477ef31e7ea9373485bf50377",
    },
    {
        accSushiPerShare: "3682543133222223388",
        allocPoint: "4",
        id: "17",
        pair: "0xb6d9a4649c579b8768f1cb55e9dd6ba99581e4a9",
    },
    {
        accSushiPerShare: "63048296913",
        allocPoint: "1",
        id: "16",
        pair: "0x1ceda73c034218255f50ef8a2c282e6b4c301d60",
    },
    {
        accSushiPerShare: "18634816945",
        allocPoint: "4",
        id: "15",
        pair: "0xd53a56ae0f48c9a03660cd36c2e4ae20493a1eca",
    },
    {
        accSushiPerShare: "1180058721733106613",
        allocPoint: "18",
        id: "14",
        pair: "0x9e20a8d3501bf96eda8e69b96dd84840058a1cb0",
    },
    {
        accSushiPerShare: "21273104073327",
        allocPoint: "3",
        id: "13",
        pair: "0x211f8e61113edaf00cf37a804b0ba721875ef560",
    },
    {
        accSushiPerShare: "2943536992740192",
        allocPoint: "26",
        id: "11",
        pair: "0xcd578f016888b57f1b1e3f887f392f0159e26747",
    },
    {
        accSushiPerShare: "17254986418310",
        allocPoint: "5",
        id: "10",
        pair: "0x116ff0d1caa91a6b94276b3471f33dbeb52073e7",
    },
    {
        accSushiPerShare: "156900764461882148",
        allocPoint: "152",
        id: "1",
        pair: "0x34965ba0ac2451a34a0471f04cca3f990b8dea27",
    },
    {
        accSushiPerShare: "271279790598",
        allocPoint: "190",
        id: "0",
        pair: "0xc4e595acdd7d12fec385e5da5d43160e8a0bac0e",
    },
];

export const ADDRESS: { [chainId: number]: { [key: string]: string } } = {
    [ChainId.MATIC]: {
        COMPLEX_REWARD_TIMER: "0xa3378Ca78633B3b9b2255EAa26748770211163AE",
        SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
        WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        WETH_DAI_SLP: "0x6ff62bfb8c12109e8000935a6de54dad83a4f39f",
        WETH_USDT_SLP: "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9",
        WETH_USDC_SLP: "0x34965ba0ac2451a34a0471f04cca3f990b8dea27",
        SUSHI_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        MINI_CHEF: process.env.MINI_CHEF_V2_ADDRESS || "",
        WHALE_TEST: process.env.WHALE_TEST_ADDRESS || "",
    },
};
