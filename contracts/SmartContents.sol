pragma solidity ^0.4.23;

import "./openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./origin/identity/V00_UserRegistry.sol";
import "./origin/identity/ClaimVerifier.sol";
import "./SmartMarket.sol";

contract SmartContents is ERC721Full, ClaimVerifier {

    struct Token {
        string content;
        address publisher;
    }

    Token[] public tokens;
    mapping (string => uint) contentToTokenId;

    string public tokenURIPrefix = "https://smartcontents.glitch.me/token?id=";
    uint128 public mintingFee = 0 ether;

    V00_UserRegistry userRegistry;
    SmartMarket smartMarket;

    constructor (
        address _userRegistryAddress,
        address _claimHolderAddress
    ) ERC721Full(
        "SmartContents",
        "SC"
    ) ClaimVerifier (
        _claimHolderAddress
    ) public {
        userRegistry = V00_UserRegistry(_userRegistryAddress);
    }    

    function getContentToTokenId(string _content) public view returns (uint256){
        return contentToTokenId[_content];
    }

    function sell(string _content, uint128 _price) public payable {
        require(msg.value == mintingFee);
        require(contentToTokenId[_content] == 0);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));

        Token memory _token = Token({
            content: _content,
            publisher: msg.sender
        });

        uint _id = tokens.push(_token) - 1;
        contentToTokenId[_content] = _id;
        _mint(smartMarket, _id);
        smartMarket.publish(_id, _price, msg.sender);

    }    

    function mint(string _content) public payable {
        require(msg.value == mintingFee);
        require(contentToTokenId[_content] == 0);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));

        Token memory _token = Token({
            content: _content,
            publisher: msg.sender
        });

        uint _id = tokens.push(_token) - 1;
        contentToTokenId[_content] = _id;
        
        _mint(msg.sender, _id);
        
    }    


    function tokenURI(uint _id) external view returns (string) {
        bytes32 tokenIdBytes;
        if (_id == 0) {
            tokenIdBytes = "0";
        } else {
            uint value = _id;
            while (value > 0) {
                tokenIdBytes = bytes32(uint256(tokenIdBytes) / (2 ** 8));
                tokenIdBytes |= bytes32(((value % 10) + 48) * 2 ** (8 * 31));
                value /= 10;
            }
        }

        bytes memory prefixBytes = bytes(tokenURIPrefix);
        bytes memory tokenURIBytes = new bytes(prefixBytes.length + tokenIdBytes.length);

        uint i;
        uint index = 0;
        
        for (i = 0; i < prefixBytes.length; i++) {
            tokenURIBytes[index] = prefixBytes[i];
            index++;
        }
        
        for (i = 0; i < tokenIdBytes.length; i++) {
            tokenURIBytes[index] = tokenIdBytes[i];
            index++;
        }
        
        return string(tokenURIBytes);
    }

}