pragma solidity ^0.4.23;

contract WhiteList  {

    mapping (address=>bool) public verified;

    function addWhiteList (address _contract) public {
        verified[_contract] = true;
    }
    
    function removeWhiteList(address _contract) public {
        verified[_contract] = false;
    }

}