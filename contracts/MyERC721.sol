//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyAccessControll.sol";
import "./ERC721URIStorage.sol";

contract MyERC721 is MyAccessControll, ERC721URIStorage{

  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol, bytes32 _adminRole, address _admin, string memory _baseURL) MyAccessControll(_adminRole, _admin) ERC721URIStorage(_baseURL){
    name = _name;
    symbol = _symbol;
    bytes32 minter = keccak256("minter");
    bytes32 burner = keccak256("burner");
    createNewRole(minter, _adminRole);
    grandRole(minter, msg.sender);
    grandRole(minter, _admin);
    createNewRole(burner, _adminRole);
    grandRole(burner, msg.sender);
    grandRole(burner, _admin);
  }

  function _mint(address _to, uint _tokenId) internal {
    require(!_exist(_tokenId), "Error: Token with this id is already exists!");
    require(address(0) != _to, "Error: Mint to zero address!");
    balances[_to]++;
    owners[_tokenId] = _to;
    emit Transfer(address(0), _to, _tokenId);
  }

  function mint(address _to, uint _tokenId) public OnlyMinter(msg.sender) {
    _mint(_to, _tokenId);
  }

  modifier OnlyMinter(address _sender){
    require(checkRole(keccak256("minter"), _sender), "Error: You have no access to mint tokens!");
    _;
  }

  modifier OnlyBurner(address _sender){
    require(checkRole(keccak256("burner"), _sender), "Error: You have no access to burn tokens!");
    _;
  }

  function _burn(address _to, uint _tokenId) internal {
    require(_exist(_tokenId), "Error: This token doesn't exist!");
    require(address(0) != _to, "Error: Burn from zero address!");
    balances[_to]--;
    owners[_tokenId] = address(0);
    emit Transfer(_to, address(0), _tokenId);
  }

  function burnOwnToken(uint _tokenId) public {
    require(owners[_tokenId] == msg.sender, "Error: You can't burn another's token!");
    _burn(msg.sender, _tokenId);
  }

  function burn(address _to, uint _tokenId) public OnlyBurner(msg.sender) {
    _burn(_to, _tokenId);
  }

  function balanceOf(address _owner) view public returns (uint) {
    return balances[_owner];
  }

  mapping (address => uint) balances;
  mapping (uint => address) owners;
  mapping (uint => address) tokenApprovals;
  mapping (address => mapping (address => bool)) operatorApprovals;

  event Transfer (address indexed from, address indexed to, uint indexed tokenId);
  event Approval (address indexed owner, address spender, uint indexed tokenId);
  event ApprovalForAll (address indexed owner, address indexed operator, bool approved);

  function _transfer(address _from, address _to, uint _tokenId) internal {
    require(_to != address(0), "Error: Transfer to zero address!");
    require(isOwner(_from, _tokenId), "Error: This token is not yours!");
    balances[_from] -= 1;
    balances[_to] += 1;
    owners[_tokenId] = _to;
    _approve(address(0), _tokenId);
    emit Transfer(_from, _to, _tokenId);
  }

  function transfer(address _to, uint _tokenId) public {
    _transfer(msg.sender, _to, _tokenId);
  }

  function _approve(address _to, uint _tokenId) internal {
    tokenApprovals[_tokenId] = _to;
    emit Approval(msg.sender, _to, _tokenId);
  }

  function approve(address _spender, uint _tokenId) external {
    require(isOwner(msg.sender, _tokenId), "Error: This token is not yours!");
    require(_spender != address(0), "Error: Approval to zero address!");
    _approve(_spender, _tokenId);
  }

 function approvalForAll(address _operator, bool _approved) external {
    require(_operator != address(0), "Error: Approval to zero address!");
    operatorApprovals[msg.sender][_operator] = _approved;
    emit ApprovalForAll (msg.sender, _operator, _approved);
 }

 function transferFrom(address _from, address _to, uint _tokenId) external {
  require(_exist(_tokenId), "Error: This token doesn't exist!");
  require(isApproved(_to, _tokenId) || isApproved(msg.sender, _tokenId) || (isApprovedForAll(_from, msg.sender) && isOwner(_from, _tokenId)) || (isApprovedForAll(_from, _to) && isOwner(_from, _tokenId)) , "Error: You haven't allowance to transfer this token to your account!");
  _transfer(_from, _to, _tokenId);
  tokenApprovals[_tokenId] = address(0);
 }

function isApproved(address _to, uint _tokenId) view public returns (bool) {
  return tokenApprovals[_tokenId] == _to ? true : false;
}

function isOwner(address _owner, uint _tokenId) view public returns (bool) {
  return owners[_tokenId] == _owner ? true : false;
}

function ownerOf(uint _tokenId) external view returns (address) {
  return owners[_tokenId];
}

function isApprovedForAll(address _owner, address _spender) view public returns (bool) {
  return operatorApprovals[_owner][_spender] == true ? true : false;
}

function _exist(uint _tokenId) view internal returns (bool) {
  return owners[_tokenId] == address(0)? false : true;
}

function exist(uint _tokenId) view public returns (bool) {
  return _exist(_tokenId);
}

function setTokenURI(uint _tokenId, string memory _tokenURI) public OnlyMinter(msg.sender) {
  require(_exist(_tokenId), "Error: This token doesn't exist!");
  _setTokenURI(_tokenId, _tokenURI);
}

function getTokenURI(uint _tokenId) view public returns (string memory) {
  require(_exist(_tokenId), "Error: This token doesn't exist!");
  bytes memory tokenUri = abi.encodePacked(_getTokenURI(_tokenId));
  bytes memory baseUrl = abi.encodePacked(baseURL());
  require((tokenUri.length != baseUrl.length), "This token hasn't URI yet!");
  return _getTokenURI(_tokenId);
}

}
