import {
  ChainId,
  computePairAddress,
  CurrencyAmount,
  FACTORY_ADDRESS,
  Pair,
  Token,
  Trade,
} from "@sushiswap/sdk";
import { BigNumber, Contract } from "ethers";
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

// TODO: anywhere using formatUnits or parseUnits MUST take into consideration decimals.

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
      ADDRESS[data.chainId].COMPLEX_REWARD_TIMER
    )) as IComplexRewardTimer,
    MiniChef: (await ethers.getContractAt(
      ChefABI,
      ADDRESS[data.chainId].MINI_CHEF
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

export const format = (x: BigNumber) =>
  Number(ethers.utils.formatUnits(x.toString()));

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
    x[y.symbol as string] = y; // TODO: key should be address.toUppercase()
    return x;
  }, {} as any);

export const maticTokenObject: { [symbol: string]: Token } =
  tokenToObject(maticTokens);

/** Parse the units given the decimals.*/
export const parseUnits = (
  address: string,
  value: number,
  decimals: number
) => {
  return ethers.utils.parseUnits(value.toString(), decimals).toString();
};

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
  tokenSymbols: string[] // TODO: this must be tokenAddresses
) => {
  // TODO: symbol must be address
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
      // if the reward token is the same as the underlying token
      // set the path w/ two elements, same address
      if (rewardTokenData[i].symbol === tokenSymbols[j]) {
        // TODO: we should be passing addresses in here, not .symbol
        object.tokenAPath.length === 0
          ? (object.tokenAPath = [
              rewardTokenData[i].symbol,
              rewardTokenData[i].symbol,
            ])
          : (object.tokenBPath = [
              rewardTokenData[i].symbol,
              rewardTokenData[i].symbol,
            ]);
        continue;
      }
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
  console.log("********** Transferring Tokens To Farmer Contract **********");
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
    console.log(
      "Dependent token amount required is greater than our dependent token balance."
    );
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
 * @param user
 */
export const printRewardTokensBalance = async (whale: IUser, user: string) => {
  const rewardABalance = await whale.RewardTokenA.balanceOf(user);
  const rewardBBalance = await whale.RewardTokenB.balanceOf(user);

  console.log("********** Reward Balance **********");
  console.log("Reward A Balance: ", format(rewardABalance));
  console.log("Reward B Balance: ", format(rewardBBalance));
};

/**
 * Prints token(s) balance of user.
 * @param whale
 * @param user
 */
export const printTokensBalance = async (whale: IUser, user: string) => {
  const independentTokenBalance = await whale.IndependentToken.balanceOf(user);
  const dependentTokenBalance = await whale.DependentToken.balanceOf(user);

  console.log("********** Tokens Balance **********");
  console.log("Independent Token Balance: ", format(independentTokenBalance));
  console.log("Dependent Token Balance: ", format(dependentTokenBalance));
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
  user: string,
  time: string
) => {
  const rewardAAmount = await miniChef.pendingSushi(pid, user);
  const [rewardBAddresses, rewardBAmount] =
    await complexRewardTimer.pendingTokens(pid, user, 0);

  console.log("********** Pending Reward Amounts (" + time + ") **********");
  console.log("Reward A Amount: ", format(rewardAAmount));
  console.log("Reward B Address: ", rewardBAddresses[0]);
  console.log("Reward B Amount: ", format(rewardBAmount[0]));
  console.log("\n");

  return [rewardAAmount, rewardBAmount[0]];
};

/**
 * Gets the min amount of tokens to be expected in exchange for your
 * liquidity.
 * @param user
 * @param farmer
 * @returns
 */
export const getAndPrintLPBurnMinAmounts = async (
  user: IUser,
  farmer: string
) => {
  const farmerLPBalance = await user.V2Pair.balanceOf(farmer);

  const v2PairTotalSupply = await user.V2Pair.totalSupply();

  const v2PairToken0Balance = await user.IndependentToken.balanceOf(
    user.V2Pair.address
  );
  const v2PairToken1Balance = await user.DependentToken.balanceOf(
    user.V2Pair.address
  );
  const v2PairLiquidity = await user.V2Pair.balanceOf(user.V2Pair.address);
  const totalLiquidity = v2PairLiquidity.add(farmerLPBalance);

  const amount0 = totalLiquidity
    .mul(v2PairToken0Balance)
    .div(v2PairTotalSupply);
  const amount1 = totalLiquidity
    .mul(v2PairToken1Balance)
    .div(v2PairTotalSupply);

  console.log(
    "Exchanging " +
      format(farmerLPBalance) +
      " V2-LP tokens for " +
      format(amount0) +
      " of token A and " +
      format(amount1) +
      " of token B."
  );

  return [farmerLPBalance, amount0, amount1];
};
