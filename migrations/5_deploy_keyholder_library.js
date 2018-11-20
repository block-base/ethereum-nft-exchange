var KeyHolderLibrary = artifacts.require("./origin/identity/KeyHolderLibrary.sol");

module.exports = async function (deployer) {

    deployer.deploy(KeyHolderLibrary).then(async () => {
    });

};
