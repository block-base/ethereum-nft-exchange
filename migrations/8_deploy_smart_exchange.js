var SmartExchange = artifacts.require("./SmartExchange.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");
var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");

module.exports = async function (deployer) {

    deployer.link(KeyHolderLibrary, SmartExchange)    
    deployer.link(ClaimHolderLibrary, SmartExchange)  

    var v00_UserRegistry = await V00_UserRegistry.deployed()
    var claimHolder = await ClaimHolder.deployed()
    　   
    deployer.deploy(SmartExchange, claimHolder.address, v00_UserRegistry.address).then(async () => {
    });

};
