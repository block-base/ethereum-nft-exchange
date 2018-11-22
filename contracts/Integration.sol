pragma solidity ^0.4.23;

import "./openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./origin/identity/V00_UserRegistry.sol";
import "./origin/identity/ClaimVerifier.sol";
import "./SmartMarket.sol";

contract Integration is ERC721Full, ClaimVerifier {

    struct Token {
        string title;
        string description;
        string content;
        address publisher;
    }

    struct Market {
        address seller;
        uint    price;
        bool    exist;
    }    

    struct Exchange {
        address requester;
        uint    tokenId;
        bool    exist;
    }    

    mapping (string => uint) contentToTokenId;
    mapping(uint => Market) public markets;
    mapping(uint => Exchange) public exchanges;

    Token[] public tokens;
    V00_UserRegistry public userRegistry;
    SmartMarket public smartMarket;

    string public tokenURIPrefix = "https://smartcontents.glitch.me/token?id=";
    uint128 public mintingFee = 0 ether;

    event Sell(uint _tokenId, uint _price);
    event CancelMarket(uint _tokenId);
    event Purchase(uint _tokenId);
    event Request(uint _fromId, uint _toId);
    event CancelExchange(uint _tokenId);
    event Confirm(uint _tokenId);

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

    function mint(string _title, string _description, string _content, uint128 _price) public payable {
        require(msg.value == mintingFee);
        require(contentToTokenId[_content] == 0);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));

        Token memory _token = Token({title: _title, description:_description, content: _content, publisher: msg.sender});

        uint _tokenId = tokens.push(_token) - 1;
        contentToTokenId[_content] = _tokenId;
        
        _mint(address(this), _tokenId);
        Market memory _market = Market(msg.sender, _price, true);
        markets[_tokenId] = _market;
        emit Sell(_tokenId, _price);
    }    


    function sell(uint _tokenId, uint128 _price) public {
        require(!markets[_tokenId].exist);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));

        Market memory _market = Market(msg.sender, _price, true);
        markets[_tokenId] = _market;
        transferFrom(msg.sender, address(this), _tokenId);
        emit Sell(_tokenId, _price);

    }

    function cancelMarket(uint _tokenId) public {
        require(markets[_tokenId].exist);
        require(markets[_tokenId].seller == msg.sender);

        this.transferFrom(address(this), msg.sender, _tokenId);
        delete markets[_tokenId];
        emit CancelMarket(_tokenId);
    }

    function purchase(uint _tokenId) public payable {
        require(markets[_tokenId].exist);
        require(markets[_tokenId].seller != msg.sender);
        require(markets[_tokenId].price == msg.value);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));
      
        Market memory _market = markets[_tokenId];
        delete markets[_tokenId];
        this.transferFrom(address(this), msg.sender, _tokenId);      

        if (_market.price > 0) {
            _market.seller.transfer(msg.value); 
        }
        emit Purchase(_tokenId);

    }

    function request(uint _fromId, uint _toId) public {
        require(!exchanges[_fromId].exist); 
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));

        Exchange memory _exchange = Exchange(msg.sender, _toId, true);
        exchanges[_fromId] = _exchange;
        transferFrom(msg.sender, address(this), _fromId);
        emit Request(_fromId, _toId);

    }

    function cancelExchange(uint256 _fromId) public {
        require(exchanges[_fromId].exist); 
        require(exchanges[_fromId].requester == msg.sender);
        this.transferFrom(address(this), msg.sender, _fromId);
        delete exchanges[_fromId];
        emit CancelMarket(_fromId);
    }

    function confirm(uint256 _fromId) public {
        require(exchanges[_fromId].exist); 
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),1));
        
        Exchange memory _exchange = exchanges[_fromId];
        transferFrom(msg.sender, _exchange.requester, _exchange.tokenId);
        this.transferFrom(address(this), msg.sender, _fromId);
        delete exchanges[_fromId];
        emit Confirm(_fromId);
    }

    function ownedTokens(address _address) public returns (uint[]) {
        return _ownedTokens[_address];
    }

    function tokenURI(uint _tokenId) external view returns (string) {
        bytes32 tokenIdBytes;
        if (_tokenId == 0) {
            tokenIdBytes = "0";
        } else {
            uint value = _tokenId;
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