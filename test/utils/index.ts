import { Contract } from "ethers";
import { ethers } from "hardhat";
import { IUser } from "./interfaces";

export async function setupUsers<
  T extends { [contractName: string]: Contract }
>(addresses: string[], contracts: T): Promise<IUser[]> {
  const users: IUser[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<IUser> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as { address: string } & IUser;
}
