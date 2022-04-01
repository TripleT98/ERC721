// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import web3 from "web3";
import * as dotenv from "dotenv";
import {Contract, ContractFactory} from "ethers";


dotenv.config();

async function main() {
  let mainAdmin: string = web3.utils.keccak256("admin");
  let baseURL: string ="https://ipfs.io/ipfs/"
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MyERC721: ContractFactory = await ethers.getContractFactory("MyERC721");
  const myERC721: Contract = await MyERC721.deploy("MyERC721", "MRCNF", mainAdmin, process.env.PUBLIC_KEY, baseURL);

  await myERC721.deployed();

  console.log("MyERC721 deployed to:", myERC721.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
