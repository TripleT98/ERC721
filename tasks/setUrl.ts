import {contract, web3, task, envParams, getSign} from "./tasks";


type taskArgs = {
  tokenid: string;
  gaslimit: string;
  privatekey: string;
  url:string;
}

export default function setUrlTask() {
  task("seturl", "mint some erc1155 tokens")
  .addParam("tokenid", "Token id")
  .addParam("gaslimit", "The limit of gas")
  .addParam("url", "Set url to token")
  .addParam("privatekey", "Your private key")
  .setAction(async(tArgs:taskArgs)=>{
    let {tokenid, url, gaslimit, privatekey} = tArgs;
    console.log(0)
    try{
    let data = await contract.methods.setTokenURI(tokenid, url).encodeABI();
    console.log(1)
    let sign = await getSign({gaslimit, privatekey, data});
    console.log(2)
    let transaciton = await web3.eth.sendSignedTransaction(sign.rawTransaction);
    console.log(3)
    console.log(transaciton.transactionHash);
  }catch(e:any){
    console.log(e.message);
  }
  })
}
