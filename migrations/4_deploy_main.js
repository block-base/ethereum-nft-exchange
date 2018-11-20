var { writeFileSync} = require('fs')

var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");
var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var SmartMarket = artifacts.require("./SmartMarket.sol");
var SmartExchange = artifacts.require("./SmartExchange.sol");

var Wallet = require('ethereumjs-wallet');
var Web3Utils = require('web3-utils');

var wallet = Wallet.generate();
var signerPrivKey = wallet.getPrivateKeyString();
var signerAddress = wallet.getAddressString();

writeFileSync('../signer_priv_key', signerPrivKey)

module.exports = async function (deployer) {
    await deployer.deploy(V00_UserRegistry).then(async () => {
        await deployer.deploy(ClaimHolder).then(async () => {

            var v00_UserRegistry = await V00_UserRegistry.deployed()
            var claimHolder = await ClaimHolder.deployed()            

            var signerKey = Web3Utils.soliditySha3(signerAddress)
            await claimHolder.addKey(signerKey, 3, 1)            

            await deployer.deploy(ClaimVerifier, claimHolder.address)
            await deployer.deploy(SmartExchange, claimHolder.address, v00_UserRegistry.address)
            await deployer.deploy(SmartMarket, claimHolder.address, v00_UserRegistry.address)
            
        });
    });
};
