var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");

module.exports = async function (deployer) {

    deployer.deploy(V00_UserRegistry).then(async () => {
    });

};
