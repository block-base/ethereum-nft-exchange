pragma solidity ^0.4.23;

import "./openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721 {
    
    uint public totalSupply;

    function mint() public {
        totalSupply++;
        _mint(msg.sender, totalSupply);
    }

}