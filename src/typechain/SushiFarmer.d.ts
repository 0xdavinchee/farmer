/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface SushiFarmerInterface extends ethers.utils.Interface {
  functions: {
    "ONE_HUNDRED_PERCENT()": FunctionFragment;
    "autoCompoundExistingLPPosition(uint256,address,tuple[])": FunctionFragment;
    "chef()": FunctionFragment;
    "claimRewards(uint256)": FunctionFragment;
    "createNewLPAndDeposit(tuple)": FunctionFragment;
    "getLPTokens(address,address,uint256,uint256)": FunctionFragment;
    "getLPTokensETH(address,uint256,uint256,uint256)": FunctionFragment;
    "lpBalance(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "removeLP(address,address,uint256,uint256,uint256)": FunctionFragment;
    "removeLPETH(address,uint256,uint256,uint256)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "router()": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "withdrawETH()": FunctionFragment;
    "withdrawFunds(address,uint256)": FunctionFragment;
    "withdrawLP(uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "ONE_HUNDRED_PERCENT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "autoCompoundExistingLPPosition",
    values: [
      BigNumberish,
      string,
      { tokenAPath: string[]; tokenBPath: string[] }[]
    ]
  ): string;
  encodeFunctionData(functionFragment: "chef", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "claimRewards",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createNewLPAndDeposit",
    values: [
      {
        pid: BigNumberish;
        amountADesired: BigNumberish;
        amountBDesired: BigNumberish;
        pair: string;
        tokenA: string;
        tokenB: string;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getLPTokens",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getLPTokensETH",
    values: [string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "lpBalance", values: [string]): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeLP",
    values: [string, string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "removeLPETH",
    values: [string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "router", values?: undefined): string;
  encodeFunctionData(functionFragment: "setOwner", values: [string]): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawETH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawFunds",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawLP",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "ONE_HUNDRED_PERCENT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "autoCompoundExistingLPPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "chef", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createNewLPAndDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLPTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLPTokensETH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lpBalance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "removeLP", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeLPETH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "router", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawETH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdrawLP", data: BytesLike): Result;

  events: {
    "LPDeposited(uint256,address,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "LPDeposited"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class SushiFarmer extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: SushiFarmerInterface;

  functions: {
    ONE_HUNDRED_PERCENT(overrides?: CallOverrides): Promise<[BigNumber]>;

    autoCompoundExistingLPPosition(
      _pid: BigNumberish,
      _pair: string,
      _data: { tokenAPath: string[]; tokenBPath: string[] }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    chef(overrides?: CallOverrides): Promise<[string]>;

    claimRewards(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    createNewLPAndDeposit(
      _data: {
        pid: BigNumberish;
        amountADesired: BigNumberish;
        amountBDesired: BigNumberish;
        pair: string;
        tokenA: string;
        tokenB: string;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getLPTokens(
      _tokenA: string,
      _tokenB: string,
      _amountADesired: BigNumberish,
      _amountBDesired: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getLPTokensETH(
      _token: string,
      _amountTokensDesired: BigNumberish,
      _amountETHMin: BigNumberish,
      _slippage: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lpBalance(
      _pair: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    removeLP(
      _tokenA: string,
      _tokenB: string,
      _liquidity: BigNumberish,
      _amountAMin: BigNumberish,
      _amountBMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    removeLPETH(
      _token: string,
      _liquidity: BigNumberish,
      _amountTokensMin: BigNumberish,
      _amountETHMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    router(overrides?: CallOverrides): Promise<[string]>;

    setOwner(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawETH(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawFunds(
      _asset: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawLP(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  ONE_HUNDRED_PERCENT(overrides?: CallOverrides): Promise<BigNumber>;

  autoCompoundExistingLPPosition(
    _pid: BigNumberish,
    _pair: string,
    _data: { tokenAPath: string[]; tokenBPath: string[] }[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  chef(overrides?: CallOverrides): Promise<string>;

  claimRewards(
    _pid: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  createNewLPAndDeposit(
    _data: {
      pid: BigNumberish;
      amountADesired: BigNumberish;
      amountBDesired: BigNumberish;
      pair: string;
      tokenA: string;
      tokenB: string;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getLPTokens(
    _tokenA: string,
    _tokenB: string,
    _amountADesired: BigNumberish,
    _amountBDesired: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getLPTokensETH(
    _token: string,
    _amountTokensDesired: BigNumberish,
    _amountETHMin: BigNumberish,
    _slippage: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lpBalance(
    _pair: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  removeLP(
    _tokenA: string,
    _tokenB: string,
    _liquidity: BigNumberish,
    _amountAMin: BigNumberish,
    _amountBMin: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  removeLPETH(
    _token: string,
    _liquidity: BigNumberish,
    _amountTokensMin: BigNumberish,
    _amountETHMin: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  router(overrides?: CallOverrides): Promise<string>;

  setOwner(
    _newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawETH(
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawFunds(
    _asset: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawLP(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    ONE_HUNDRED_PERCENT(overrides?: CallOverrides): Promise<BigNumber>;

    autoCompoundExistingLPPosition(
      _pid: BigNumberish,
      _pair: string,
      _data: { tokenAPath: string[]; tokenBPath: string[] }[],
      overrides?: CallOverrides
    ): Promise<void>;

    chef(overrides?: CallOverrides): Promise<string>;

    claimRewards(_pid: BigNumberish, overrides?: CallOverrides): Promise<void>;

    createNewLPAndDeposit(
      _data: {
        pid: BigNumberish;
        amountADesired: BigNumberish;
        amountBDesired: BigNumberish;
        pair: string;
        tokenA: string;
        tokenB: string;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    getLPTokens(
      _tokenA: string,
      _tokenB: string,
      _amountADesired: BigNumberish,
      _amountBDesired: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLPTokensETH(
      _token: string,
      _amountTokensDesired: BigNumberish,
      _amountETHMin: BigNumberish,
      _slippage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lpBalance(_pair: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    removeLP(
      _tokenA: string,
      _tokenB: string,
      _liquidity: BigNumberish,
      _amountAMin: BigNumberish,
      _amountBMin: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    removeLPETH(
      _token: string,
      _liquidity: BigNumberish,
      _amountTokensMin: BigNumberish,
      _amountETHMin: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    router(overrides?: CallOverrides): Promise<string>;

    setOwner(_newOwner: string, overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawETH(overrides?: CallOverrides): Promise<void>;

    withdrawFunds(
      _asset: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawLP(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    LPDeposited(
      pid?: null,
      pair?: null,
      amount?: null
    ): TypedEventFilter<
      [BigNumber, string, BigNumber],
      { pid: BigNumber; pair: string; amount: BigNumber }
    >;

    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;
  };

  estimateGas: {
    ONE_HUNDRED_PERCENT(overrides?: CallOverrides): Promise<BigNumber>;

    autoCompoundExistingLPPosition(
      _pid: BigNumberish,
      _pair: string,
      _data: { tokenAPath: string[]; tokenBPath: string[] }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    chef(overrides?: CallOverrides): Promise<BigNumber>;

    claimRewards(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    createNewLPAndDeposit(
      _data: {
        pid: BigNumberish;
        amountADesired: BigNumberish;
        amountBDesired: BigNumberish;
        pair: string;
        tokenA: string;
        tokenB: string;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getLPTokens(
      _tokenA: string,
      _tokenB: string,
      _amountADesired: BigNumberish,
      _amountBDesired: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getLPTokensETH(
      _token: string,
      _amountTokensDesired: BigNumberish,
      _amountETHMin: BigNumberish,
      _slippage: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lpBalance(
      _pair: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    removeLP(
      _tokenA: string,
      _tokenB: string,
      _liquidity: BigNumberish,
      _amountAMin: BigNumberish,
      _amountBMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    removeLPETH(
      _token: string,
      _liquidity: BigNumberish,
      _amountTokensMin: BigNumberish,
      _amountETHMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    router(overrides?: CallOverrides): Promise<BigNumber>;

    setOwner(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawETH(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawFunds(
      _asset: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawLP(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ONE_HUNDRED_PERCENT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    autoCompoundExistingLPPosition(
      _pid: BigNumberish,
      _pair: string,
      _data: { tokenAPath: string[]; tokenBPath: string[] }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    chef(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    claimRewards(
      _pid: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    createNewLPAndDeposit(
      _data: {
        pid: BigNumberish;
        amountADesired: BigNumberish;
        amountBDesired: BigNumberish;
        pair: string;
        tokenA: string;
        tokenB: string;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getLPTokens(
      _tokenA: string,
      _tokenB: string,
      _amountADesired: BigNumberish,
      _amountBDesired: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getLPTokensETH(
      _token: string,
      _amountTokensDesired: BigNumberish,
      _amountETHMin: BigNumberish,
      _slippage: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lpBalance(
      _pair: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeLP(
      _tokenA: string,
      _tokenB: string,
      _liquidity: BigNumberish,
      _amountAMin: BigNumberish,
      _amountBMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    removeLPETH(
      _token: string,
      _liquidity: BigNumberish,
      _amountTokensMin: BigNumberish,
      _amountETHMin: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setOwner(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawETH(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawFunds(
      _asset: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawLP(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}