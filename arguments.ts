import {contract, web3, task, envParams, getSign} from "./tasks/tasks";

let mainAdmin: string = web3.utils.keccak256("admin");
let baseURL: string ="https://ipfs.io/ipfs/";

module.exports = ["MyERC721", "MRCNF", mainAdmin, envParams.PUBLIC_KEY, baseURL]
