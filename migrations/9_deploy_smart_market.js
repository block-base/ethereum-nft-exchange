var SmartMarket = artifacts.require("./SmartMarket.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");
var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");

module.exports = async function (deployer) {

    deployer.link(KeyHolderLibrary, SmartMarket)    
    deployer.link(ClaimHolderLibrary, SmartMarket)  

    var v00_UserRegistry = await V00_UserRegistry.deployed()
    var claimHolder = await ClaimHolder.deployed()
　   
    deployer.deploy(SmartMarket, claimHolder.address, v00_UserRegistry.address).then(async () => {
    });

};
