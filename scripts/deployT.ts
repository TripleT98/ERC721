
import { ethers } from "hardhat";
import web3 from "web3";
import * as dotenv from "dotenv";
import {Contract, ContractFactory} from "ethers";


dotenv.config();

async function main() {

  const MyERC721: ContractFactory = await ethers.getContractFactory("MyTestContract");
  const myERC721: Contract = await MyERC721.deploy();

  await myERC721.deployed();

  console.log("MyERC721 deployed to:", myERC721.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
