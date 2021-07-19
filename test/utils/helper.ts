import {
  ChainId,
  computePairAddress,
  CurrencyAmount,
  FACTORY_ADDRESS,
  Pair,
  Token,
  Trade,
} from "@sushiswap/sdk";
import { BigNumber } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";
import ChefABI from "../abi/MiniChef.json";
import ComplexRewardTimerABI from "../abi/ComplexRewardTimer.json";
import PairABI from "@sushiswap/core/build/abi/IUniswapV2Pair.json";
import ERC20ABI from "@sushiswap/core/build/abi/ERC20.json";
import { tokens } from "@sushiswap/default-token-list/build/sushiswap-default.tokenlist.json";
import { IExchangePair, ISetupProps, ITokenObject, IUser } from "./interfaces";
import {
  IComplexRewardTimer,
  IERC20,
  IMiniChefV2,
  IUniswapV2Pair,
  IUniswapV2Router02,
} from "../../typechain";
import { ADDRESS } from "./constants";
import { setupUser } from ".";

/**
 * This function sets up the contracts by getting all the necessary stateful contracts
 * and creates an IUser object which can explicitly interact with these contracts.
 * @param data
 * @returns
 */
export const setup = async (data: ISetupProps) => {
  const { deployer, whale } = await getNamedAccounts();
  const { pair, independentToken, dependentToken, rewardTokenA, rewardTokenB } =
    data;

  const contracts = {
    // these contracts will always have the same addresses
    ComplexRewardTimer: (await ethers.getContractAt(
      ComplexRewardTimerABI,
      ADDRESS.COMPLEX_REWARD_TIMER
    )) as IComplexRewardTimer,
    MiniChef: (await ethers.getContractAt(
      ChefABI,
      ADDRESS.MINI_CHEF
    )) as IMiniChefV2,

    // reward tokens
    RewardTokenA: (await ethers.getContractAt(
      ERC20ABI,
      rewardTokenA
    )) as IERC20,
    RewardTokenB: (await ethers.getContractAt(
      ERC20ABI,
      rewardTokenB
    )) as IERC20,

    // these contract addresses will vary
    V2Pair: (await ethers.getContractAt(PairABI, pair)) as IUniswapV2Pair,
    IndependentToken: (await ethers.getContractAt(
      ERC20ABI,
      independentToken
    )) as IERC20,
    DependentToken: (await ethers.getContractAt(
      ERC20ABI,
      dependentToken
    )) as IERC20,
  };

  const setupObject = {
    ...contracts,
    deployer: await setupUser(deployer, contracts),
    whale: await setupUser(whale, contracts),
  };

  return setupObject;
};

export const format = (x: BigNumber) => ethers.utils.formatUnits(x.toString());

/** Given an array of tokens, creates pairs of all of them. */
export const pairs = (arr: Token[]) =>
  arr.map((v, i) => arr.slice(i + 1).map((w) => [v, w])).flat() as Token[][];

/** Creates a list of matic tokens using the token list. */
export const maticTokens = tokens
  .filter((x) => x.chainId === ChainId.MATIC)
  .filter((x) =>
    ["DAI", "USDC", "USDT", "WETH", "SUSHI", "WMATIC"].includes(x.symbol)
  )
  .map((x) => new Token(x.chainId, x.address, x.decimals, x.symbol, x.name));

export const maticPairs = pairs(maticTokens);

/** Returns a list pair addresses given a list of pairs. */
export const pairAddresses = maticPairs.map(([tokenA, tokenB]) => {
  return tokenA &&
    tokenB &&
    tokenA.chainId === tokenB.chainId &&
    !tokenA.equals(tokenB) &&
    FACTORY_ADDRESS[tokenA.chainId]
    ? computePairAddress({
        factoryAddress: FACTORY_ADDRESS[tokenA.chainId],
        tokenA,
        tokenB,
      })
    : undefined;
});

/** Returns a key-value object of all tokens, where key is the
 * symbol and pair is the Token object.
 */
export const tokenToObject = (arr: Token[]) =>
  arr.reduce((x, y) => {
    x[y.symbol as string] = y;
    return x;
  }, {} as any);

export const maticTokenObject: { [symbol: string]: Token } =
  tokenToObject(maticTokens);

/** Parse the units given the decimals.*/
export const parseUnits = (symbol: string, value: number, decimals: number) =>
  ethers.utils.parseUnits(value.toString(), decimals).toString();

/** Given a list of exchange pairs from the sushi-data endpoint,
 * returns a list of pair objects.
 */
export const createPairs = (
  pairs: IExchangePair[],
  tokenObject: ITokenObject
) => {
  return pairs.map((x) => {
    const token0 = tokenObject[x.token0.symbol];
    const token1 = tokenObject[x.token1.symbol];
    return new Pair(
      CurrencyAmount.fromRawAmount(
        token0,
        parseUnits(x.token0.symbol, x.reserve0, token0.decimals)
      ),
      CurrencyAmount.fromRawAmount(
        token1,
        parseUnits(x.token1.symbol, x.reserve1, token1.decimals)
      )
    );
  });
};

/** Gets the data needed for auto compounding a position.
 * Given that the two rewards are sushi/wmatic and a list
 * of the token symbols of the underlying LP position we
 * are compounding, this returns an array of tokenPaths
 * from reward to tokenA/B.
 */
export const getAutoCompoundData = (
  pairs: Pair[],
  splitSushiRewards: BigNumber,
  splitWMaticRewards: BigNumber,
  tokenSymbols: string[]
) => {
  const rewardTokenData = [
    { symbol: "SUSHI", rewards: splitSushiRewards },
    { symbol: "WMATIC", rewards: splitWMaticRewards },
  ];
  let data = [];
  for (let i = 0; i < rewardTokenData.length; i++) {
    let object: {
      tokenAPath: string[];
      tokenBPath: string[];
    } = { tokenAPath: [], tokenBPath: [] };
    for (let j = 0; j < tokenSymbols.length; j++) {
      // get the best trade given an exact input
      const rewardTokenToTokenTrade = Trade.bestTradeExactIn(
        pairs,
        CurrencyAmount.fromRawAmount(
          maticTokenObject[rewardTokenData[i].symbol],
          splitSushiRewards.toString()
        ),
        maticTokenObject[tokenSymbols[j]]
      );
      const path = rewardTokenToTokenTrade[0].route.path.map((x) => x.address);
      object.tokenAPath.length === 0
        ? (object.tokenAPath = path)
        : (object.tokenBPath = path);
    }
    data.push(object);
  }
  return data;
};


/**
 * Returns the pair address of two tokens.
 * @param independentToken 
 * @param dependentToken 
 * @returns pair address.
 */
export const getPairAddress = (
  independentToken: string,
  dependentToken: string
) => {
  const tokenListA = tokens.find(
    (x) => x.address.toUpperCase() === independentToken.toUpperCase()
  )!;
  const tokenListB = tokens.find(
    (x) => x.address.toUpperCase() === dependentToken.toUpperCase()
  )!;

  const tokenA = new Token(
    ChainId.MATIC,
    independentToken,
    tokenListA.decimals,
    tokenListA.symbol,
    tokenListA.name
  );
  const tokenB = new Token(
    ChainId.MATIC,
    dependentToken,
    tokenListB.decimals,
    tokenListB.symbol,
    tokenListB.name
  );

  return computePairAddress({
    factoryAddress: FACTORY_ADDRESS[ChainId.MATIC],
    tokenA,
    tokenB,
  });
};

/**
 * Transfers tokens to the farmer contract so it
 * can start farming.
 * @param user 
 * @param farmer 
 * @param independentAmount 
 * @param dependentAmount 
 */
export const transferTokensToFarmer = async (
  user: IUser,
  farmer: string,
  independentAmount: string,
  dependentAmount: string
) => {
  // transfer funds to the sushi farmer contract
  await user.IndependentToken.transfer(
    farmer,
    ethers.utils.parseUnits(independentAmount)
  );
  await user.DependentToken.transfer(
    farmer,
    ethers.utils.parseUnits(dependentAmount)
  );
};

/**
 * Given an independentToken and dependentToken,
 * this function computes the amount of dependentToken 
 * needed given farmer's independent token balance. If
 * the amount of dependentToken is greater than the 
 * farmer's balance, we call this again with independent
 * and dependent token swapped.
 * @param independentToken 
 * @param dependentToken 
 * @param farmer 
 * @param v2Pair 
 * @param router 
 * @returns 
 */
export const getLPTokenAmounts = async (
  independentToken: IERC20,
  dependentToken: IERC20,
  farmer: string,
  v2Pair: IUniswapV2Pair,
  router: IUniswapV2Router02
) => {
  // get our independent token balance
  let independentTokenBalance = await independentToken.balanceOf(farmer);
  const dependentTokenBalance = await dependentToken.balanceOf(farmer);

  // given our independent token balance, how much dependent token do we need to LP?
  const [reservesA, reservesB] = await v2Pair.getReserves();
  let dependentTokenRequiredAmount = await router.quote(
    independentTokenBalance,
    reservesA,
    reservesB
  );

  // if the dependent token required amount is greater than our balance of the dependent token
  // we will swap dependent token and independent token around so we can add LP.
  if (dependentTokenRequiredAmount > dependentTokenBalance) {
    console.log("Dependent token amount required is greater than our dependent token balance.");
    console.log("Attempting with dependent token as the independent token.");
    [independentTokenBalance, dependentTokenRequiredAmount] =
      await getLPTokenAmounts(
        dependentToken,
        independentToken,
        farmer,
        v2Pair,
        router
      );
  }

  return [independentTokenBalance, dependentTokenRequiredAmount];
};

/**
 * Prints reward token balance of user.
 * @param whale
 */
export const printRewardTokensBalance = async (whale: IUser, user: string) => {
  const rewardABalance = await whale.RewardTokenA.balanceOf(user);
  const rewardBBalance = await whale.RewardTokenB.balanceOf(user);

  console.log("********** Reward Balance **********");
  console.log("rewardTokenA Balance: ", format(rewardABalance));
  console.log("rewardTokenB Balance: ", format(rewardBBalance));
};

/**
 * Gets and prints the pending reward balance amount.
 * @param miniChef
 * @param complexRewardTimer
 * @param pid
 * @param user
 * @returns
 */
export const getAndPrintPendingRewardBalance = async (
  miniChef: IMiniChefV2,
  complexRewardTimer: IComplexRewardTimer,
  pid: number,
  user: string
) => {
  const rewardAAmount = await miniChef.pendingSushi(pid, user);
  const [rewardBAddresses, rewardBAmount] =
    await complexRewardTimer.pendingTokens(pid, user, 0);

  console.log("********** Pending Reward Amounts **********");
  console.log("rewardA Amount: ", format(rewardAAmount));
  console.log("rewardB Address: ", rewardBAddresses[0]);
  console.log("rewardB Amount: ", format(rewardBAmount[0]));

  return { wMaticRewards: rewardBAmount[0], sushiRewards: rewardAAmount };
};
