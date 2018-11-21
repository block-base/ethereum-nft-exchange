pragma solidity ^0.4.23;

import "./openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "./origin/identity/ClaimVerifier.sol";
import "./origin/identity/V00_UserRegistry.sol";
import "./WhiteList.sol";

contract SmartMarket is ClaimVerifier {

    struct Item {
        address seller;
        uint    price;
        bool    exist;
    }    

    event Sell(address indexed _contract, uint _tokenId, uint _price);
    event Cancel(address indexed _contract, uint _tokenId);
    event Purchase(address indexed _contract, uint _tokenId);

    mapping (address=>mapping(uint => Item)) public items;

    address smartContentsAddress;
    WhiteList whiteList;
    V00_UserRegistry userRegistry;

    constructor (
        address _whiteListAddress, 
        address _userRegistryAddress, 
        address _claimHolderAddress) 
    ClaimVerifier (
        _claimHolderAddress
    ) {
        whiteList = WhiteList(_whiteListAddress);
        userRegistry = V00_UserRegistry(_userRegistryAddress);
    }

    function publish(uint _tokenId, uint128 _price, address _owner) public {
        require(msg.sender == smartContentsAddress);

        Item memory _item = Item(_owner, _price, true);
        items[smartContentsAddress][_tokenId] = _item;
        emit Sell(smartContentsAddress, _tokenId, _price);
    }

    function sell(address _contract, uint _tokenId, uint128 _price) public {
        require(!items[_contract][_tokenId].exist);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),2));
        require(whiteList.verified(_contract));

        Item memory _item = Item(msg.sender, _price, true);
        items[_contract][_tokenId] = _item;
        IERC721(_contract).transferFrom(msg.sender, address(this), _tokenId);
        emit Sell(_contract, _tokenId, _price);
    }

    function cancel(address _contract, uint _tokenId) public {
        require(items[_contract][_tokenId].exist);
        require(items[_contract][_tokenId].seller == msg.sender);

        IERC721(_contract).transferFrom(address(this), msg.sender, _tokenId);
        delete items[_contract][_tokenId];
        emit Cancel(_contract, _tokenId);
    }

    function purchase(address _contract, uint _tokenId) public payable {
        require(items[_contract][_tokenId].exist);
        require(items[_contract][_tokenId].seller != msg.sender);
        require(items[_contract][_tokenId].price == msg.value);
        require(checkClaim(ClaimHolder(userRegistry.users(msg.sender)),2));
        
        Item memory _item = items[_contract][_tokenId];
        delete items[_contract][_tokenId];
        IERC721(_contract).transferFrom(address(this), msg.sender, _tokenId);      
        if (_item.price > 0) {
            _item.seller.transfer(msg.value); 
        }
        emit Purchase(_contract, _tokenId);
    }
    
}