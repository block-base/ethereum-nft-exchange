var ClaimHolderLibrary = artifacts.require("./origin/identity/ClaimHolderLibrary.sol");
var KeyHolderLibrary = artifacts.require("./origin/identity/KeyHolderLibrary.sol");


module.exports = async function (deployer) {

    deployer.link(KeyHolderLibrary, ClaimHolderLibrary)   

    deployer.deploy(ClaimHolderLibrary).then(async () => {
    });

};
