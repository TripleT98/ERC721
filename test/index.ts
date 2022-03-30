import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Signer, Contract, ContractFactory, BigNumber } from "ethers";
import web3 from "web3";

describe("Testing ERC721 contract", async()=>{

  let MyERC721: ContractFactory, myERC721: Contract, owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress;
  let zeroAddress: string = "0x0000000000000000000000000000000000000000";
  //general roles
  let minter: string = web3.utils.keccak256("minter");
  let burner: string = web3.utils.keccak256("burner");
  let mainAdmin: string = web3.utils.keccak256("admin");
  beforeEach(async()=>{

    [owner, user1, user2, user3] = await ethers.getSigners();

    MyERC721 = await ethers.getContractFactory("MyERC721");
    myERC721 = await MyERC721.connect(owner).deploy("MyERC721", "MRCNF", mainAdmin, user1.address);
    await myERC721.deployed();
  })

  it("Testing mint, balanceOf, ownerOf and isOwner functions", async()=>{

    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user2.address, 2);
    await myERC721.connect(owner).mint(user2.address, 3);
    await myERC721.connect(owner).mint(user3.address, 4);
    await myERC721.connect(owner).mint(user3.address, 5);
    await myERC721.connect(owner).mint(user3.address, 6);
    let u1Balance:BigNumber = await myERC721.balanceOf(user1.address);
    let u2Balance:BigNumber = await myERC721.balanceOf(user2.address);
    let u3Balance:BigNumber = await myERC721.balanceOf(user3.address);
    expect([String(u1Balance),String(u2Balance),String(u3Balance)]).to.deep.equal(["1","2","3"]);
    let ownerOf1:string = await myERC721.ownerOf("1");
    let ownerOf2:string = await myERC721.ownerOf("2");
    let ownerOf3:string = await myERC721.ownerOf("4");
    expect([ownerOf1,ownerOf2,ownerOf3]).to.deep.equal([user1.address, user2.address, user3.address]);
    let isUser1OwnerOfToken1:boolean = await myERC721.isOwner(user1.address, 1);
    let isUser2OwnerOfToken2:boolean = await myERC721.isOwner(user2.address, 2);
    let isUser3OwnerOfToken4:boolean = await myERC721.isOwner(user3.address, 4);
    let isAllOwners:boolean = isUser1OwnerOfToken1 && isUser1OwnerOfToken1 && isUser1OwnerOfToken1;
    expect(isAllOwners).to.equal(true);

  })

  it("Testing transfer function", async()=>{

    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(user1).transfer(user2.address, 1);
    let ownerOfToken1:string = await myERC721.ownerOf("1");
    let balanceOfUser2:BigNumber = await myERC721.balanceOf(user2.address);
    expect(ownerOfToken1).to.equal(user2.address);
    expect(String(balanceOfUser2)).to.equal("1");

  })

  it("Testing approve, isApproved functions", async()=>{

    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(owner).mint(user1.address, 3);
    await myERC721.connect(user1).approve(user2.address, 1);
    await myERC721.connect(user1).approve(user3.address, 2);
    await myERC721.connect(user1).approve(owner.address, 3);
    let isToken1ApprovedToUser2:boolean = await myERC721.isApproved(user2.address, 1);
    let isToken2ApprovedToUser3:boolean = await myERC721.isApproved(user3.address, 2);
    let isToken3ApprovedToOwner:boolean = await myERC721.isApproved(owner.address, 3);
    let isTrue:boolean = isToken1ApprovedToUser2 && isToken2ApprovedToUser3 && isToken3ApprovedToOwner;
    expect(isTrue).to.equal(true);

  })

  it("Testing transferFrom function", async()=>{

    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(owner).mint(user1.address, 3);
    await myERC721.connect(user1).approve(user2.address, 1);
    await myERC721.connect(user1).approve(user2.address, 2);
    await myERC721.connect(user1).approve(user2.address, 3);
    await myERC721.connect(user1).transferFrom(user1.address, user2.address, 1);
    await myERC721.connect(user2).transferFrom(user1.address, user3.address, 2);
    await myERC721.connect(user3).transferFrom(user1.address, user2.address, 3);
    let u1Balance:BigNumber = await myERC721.balanceOf(user1.address);
    let u2Balance:BigNumber = await myERC721.balanceOf(user2.address);
    let u3Balance:BigNumber = await myERC721.balanceOf(user3.address);
    expect([String(u1Balance),String(u2Balance),String(u3Balance)]).to.deep.equal(["0","2","1"]);

  })

  it("Testing approvalForAll and isApprovedForAll functions. Then call transferFrom function from(user1) to(user3) msg.sender(user2). Then check the balances.", async()=>{
    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(owner).mint(user1.address, 3);
    await myERC721.connect(user1).approvalForAll(user2.address, true);
    expect(await myERC721.isApprovedForAll(user1.address, user2.address)).to.equal(true);
    expect(String(await myERC721.balanceOf(user1.address))).to.equal("3");
    await myERC721.connect(user1).transferFrom(user1.address, user2.address, 1);
    expect(String(await myERC721.balanceOf(user1.address))).to.equal("2");
    expect(String(await myERC721.balanceOf(user2.address))).to.equal("1");
  })

  it("Testing burn function", async()=>{
    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(owner).mint(user1.address, 3);
    expect(String(await myERC721.balanceOf(user1.address))).to.equal("3");
    await myERC721.connect(owner).burn(user1.address, 3);
    expect(String(await myERC721.balanceOf(user1.address))).to.equal("2");
    await myERC721.connect(owner).burn(user1.address, 2);
    expect(String(await myERC721.balanceOf(user1.address))).to.equal("1");
  })

  it("Testing burnOwnToken and exist functions", async()=>{
      await myERC721.connect(owner).mint(user1.address, 1);
      await myERC721.connect(owner).mint(user1.address, 2);
      expect(String(await myERC721.balanceOf(user1.address))).to.equal("2");
      await myERC721.connect(user1).burnOwnToken(1);
      expect(String(await myERC721.balanceOf(user1.address))).to.equal("1");
      expect(await myERC721.exist(1)).to.equal(false);
      expect(await myERC721.exist(2)).to.equal(true);
  })

  it("Testing transferFrom function's requires", async()=>{
    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(user1).approve(user2.address, 1);
    await myERC721.connect(user3).transferFrom(user1.address, user2.address, 1);
    await myERC721.connect(owner).mint(user1.address, 2);
    await myERC721.connect(user1).approve(user2.address, 2);
    await myERC721.connect(user2).transferFrom(user1.address, user3.address, 2);
    await myERC721.connect(owner).mint(user1.address, 3);
    await myERC721.connect(user1).approvalForAll(user2.address, true);
    await myERC721.connect(user2).transferFrom(user1.address, user3.address, 3);
    await myERC721.connect(owner).mint(user1.address, 4);
    await myERC721.connect(user1).approvalForAll(user2.address, true);
    await myERC721.connect(user3).transferFrom(user1.address, user2.address, 4);
  })

  it("Testing isOwner function", async()=>{
    await myERC721.connect(owner).mint(user1.address, 1);
    expect(await myERC721.isOwner(user1.address, 1)).to.equal(true);
    expect(await myERC721.isOwner(user1.address, 2)).to.equal(false);
  })

  it("Testing isApproved function", async()=>{
    await myERC721.connect(owner).mint(user1.address, 1);
    await myERC721.connect(user1).approve(user2.address, 1);
    expect(await myERC721.isApproved(user2.address, 1)).to.equal(true);
    expect(await myERC721.isApproved(user3.address, 1)).to.equal(false);
  })

  describe("Testing reverts with error message", async()=>{

    it("Mint existed token", async()=>{
      let err_mess:string = "Error: Token with this id is already exists!";
      await myERC721.connect(owner).mint(user2.address, 1);
      await expect(myERC721.connect(owner).mint(user2.address, 1)).to.be.revertedWith(err_mess)
    })

    it("Burn unexisted token", async()=>{
      let err_mess:string = "Error: This token doesn't exist!";
      await expect(myERC721.connect(owner).burn(user2.address, 1)).to.be.revertedWith(err_mess)
    })

    it("If not minter tries to mint token", async()=>{
      let err_mess:string = "Error: You have no access to mint tokens!";
      await expect(myERC721.connect(user2).mint(user1.address, 1)).to.be.revertedWith(err_mess)

    })

    it("If not burner tries to burn token", async()=>{

      await myERC721.connect(owner).mint(user2.address, 1);
      let err_mess:string = "Error: You have no access to burn tokens!";
      await expect(myERC721.connect(user2).burn(user1.address, 1)).to.be.revertedWith(err_mess)

    })

    it("If somebody wants to burn another's token via burnOwnToken function", async()=>{

      await myERC721.connect(owner).mint(user1.address, 1);
      let err_mess:string = "Error: You can't burn another's token!";
      await expect(myERC721.connect(owner).burnOwnToken(2)).to.be.revertedWith(err_mess);

    })

    it("Transfer to zero address", async()=>{

      let err_mess:string = "Error: Transfer to zero address!";
      await expect(myERC721.connect(owner).transfer(zeroAddress, 1)).to.be.revertedWith(err_mess);

    })

    it("Approve and ApprovalForAll to zero address", async()=>{
      await myERC721.connect(owner).mint(user1.address, 1);
      let err_mess:string = "Error: Approval to zero address!";
      await expect(myERC721.connect(user1).approve(zeroAddress, 1)).to.be.revertedWith(err_mess);
      await expect(myERC721.connect(owner).approvalForAll(zeroAddress, 1)).to.be.revertedWith(err_mess);
    })

    it("Approve another's token shoud reverts with error", async()=>{
      await myERC721.connect(owner).mint(user1.address, 1);
      let err_mess:string = "Error: This token is not yours!";
      await expect(myERC721.connect(owner).approve(user2.address, 1)).to.be.revertedWith(err_mess);
    })

    it("Transfer not existing token from somebody", async()=>{
      let err_mess:string = "Error: This token doesn't exist!";
      await expect(myERC721.connect(user1).transferFrom(user1.address, user2.address, 1)).to.be.revertedWith(err_mess);
    })

    it("Testing transferFrom function without allowance", async()=>{
      await myERC721.connect(owner).mint(user2.address, 1);
      let err_mess:string = "Error: You haven't allowance to transfer this token to your account!";
      await expect(myERC721.connect(user1).transferFrom(user1.address, user3.address, 1)).to.be.revertedWith(err_mess);
    })

    it("Mint to zero address", async()=>{
      let err_mess:string = "Error: Mint to zero address!";
      await expect(myERC721.connect(owner).mint(zeroAddress, 1)).to.be.revertedWith(err_mess);
    })

    it("Burn to zero address", async()=>{
      await myERC721.connect(owner).mint(user2.address, 1);
      let err_mess:string = "Error: Burn from zero address!";
      await expect(myERC721.connect(owner).burn(zeroAddress, 1)).to.be.revertedWith(err_mess);
    })

    it("Transfer another's token", async()=>{
      await myERC721.connect(owner).mint(user2.address, 1);
      let err_mess:string = "Error: This token is not yours!";
      await expect(myERC721.connect(user1).transfer(user2.address, 1)).to.be.revertedWith(err_mess);
    })
  })

  describe("Testing MyAccessControll", async()=>{

    //"minter", "admin" and "buner"roles is already been declared in contract constructor. Owner and user1 are already members of "minter", "admin" and "burner". "admin" role declaed as adminRole for "minter" and "burner" roles.

    it("Testing check role function", async()=>{
      expect(await myERC721.checkRole(minter, owner.address)).to.equal(true);
      expect(await myERC721.checkRole(burner, owner.address)).to.equal(true);
    })

    it("Testing grandRole", async()=>{
      //if role to this user is not granded yet
      await myERC721.connect(owner).grandRole(minter, user2.address);
      //Double grand to cover another "if" way
      await myERC721.connect(owner).grandRole(minter, user2.address);
    })

    it("Testing isAdminFunction", async()=>{
      await myERC721.connect(owner).grandRole(minter, user2.address);
      expect(await myERC721.isAdmin(minter, owner.address)).to.equal(true);
      expect(await myERC721.isAdmin(burner, owner.address)).to.equal(true);
      expect(await myERC721.isAdmin(mainAdmin, owner.address)).to.equal(true);
    })

    it("Testing changeAdminRole function",async()=>{
      let err_mess: string = "Error: You have no access to this function!";
      let grandMinter: string = web3.utils.keccak256("grand_minter");
      await myERC721.connect(owner).createNewRole(grandMinter, mainAdmin);
      await myERC721.connect(owner).changeAdminRole(minter, grandMinter);
      await myERC721.connect(owner).grandRole(grandMinter, user2.address);
      expect(await myERC721.isAdmin(minter, user2.address)).to.equal(true);
      await expect(myERC721.connect(user3).changeAdminRole(minter, grandMinter)).to.be.revertedWith(err_mess);

    })

    it("Testing revokeRole", async()=>{
      await myERC721.connect(owner).grandRole(minter, user2.address);
      await myERC721.connect(user2).mint(user3.address, 1);
      await myERC721.connect(owner).revokeRole(minter, user2.address);
      //Double revoke to cover another "if" way
      await myERC721.connect(owner).revokeRole(minter, user2.address);
      let err_mess: string = "Error: You have no access to mint tokens!";
      await expect(myERC721.connect(user2).mint(user3.address, 2)).to.be.revertedWith(err_mess);

    })

  })

});
