var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");
var KeyHolderLibrary = artifacts.require("./origin/identity/KeyHolderLibrary.sol");
var ClaimHolderLibrary = artifacts.require("./origin/identity/ClaimHolderLibrary.sol");

module.exports = async function (deployer) {

    deployer.link(KeyHolderLibrary, ClaimHolder)    
    deployer.link(ClaimHolderLibrary, ClaimHolder)    

    deployer.deploy(ClaimHolder).then(async () => {
    });

};
