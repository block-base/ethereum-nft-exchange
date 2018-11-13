pragma solidity ^0.4.23;

import "./openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";

contract SmartExchange {

    struct Item {
        address requester;
        address toContract;
        uint    toId;
        bool    exist;
    }    

    event Request(address indexed _fromContract, uint _fromId, address indexed _toContract, uint _toId);
    event Cancel(address indexed _contract, uint _tokenId);
    event Confirm(address indexed _contract, uint _tokenId);

    mapping (address=>mapping(uint256 => Item)) public items;

    function request(address _fromContract, uint _fromId, address _toContract, uint _toId) public {
        require(!items[_fromContract][_fromId].exist); 
        Item memory _item = Item(msg.sender, _toContract, _toId, true);
        items[_fromContract][_fromId] = _item;
        IERC721(_fromContract).transferFrom(msg.sender, address(this), _fromId);
        emit Request(_fromContract, _fromId, _toContract, _toId);
    }

    function cancel(address _fromContract, uint256 _fromId) public {
        require(items[_fromContract][_fromId].exist); 
        require(items[_fromContract][_fromId].requester == msg.sender);
        IERC721(_fromContract).transferFrom(address(this), msg.sender, _fromId);
        delete items[_fromContract][_fromId];
        emit Cancel(_fromContract, _fromId);
    }

    function confirm(address _fromContract, uint256 _fromId) public {
        require(items[_fromContract][_fromId].exist); 
        Item memory _item = items[_fromContract][_fromId];
        IERC721(_item.toContract).transferFrom(msg.sender, _item.requester, _item.toId);
        IERC721(_fromContract).transferFrom(address(this), msg.sender, _fromId);
        delete items[_fromContract][_fromId];
        emit Confirm(_fromContract, _fromId);
    }
    
}