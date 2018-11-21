var { writeFileSync } = require('fs')

var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");
var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var SmartContents = artifacts.require("./SmartContents.sol");
var SmartMarket = artifacts.require("./SmartMarket.sol");
var SmartExchange = artifacts.require("./SmartExchange.sol");
var WhiteList = artifacts.require("./WhiteList.sol");

var Wallet = require('ethereumjs-wallet');
var Web3Utils = require('web3-utils');

var wallet = Wallet.generate();
var signerPrivKey = wallet.getPrivateKeyString();
var signerAddress = wallet.getAddressString();

writeFileSync('../signer_priv_key', signerPrivKey)

module.exports = async function (deployer) {
    await deployer.deploy(V00_UserRegistry).then(async () => {
        await deployer.deploy(ClaimHolder).then(async () => {
            await deployer.deploy(WhiteList).then(async () => {
                var v00_UserRegistry = await V00_UserRegistry.deployed()
                var claimHolder = await ClaimHolder.deployed()
                var whiteList = await WhiteList.deployed();

                var signerKey = Web3Utils.soliditySha3(signerAddress)
                await claimHolder.addKey(signerKey, 3, 1)

                await deployer.deploy(ClaimVerifier, claimHolder.address)
                await deployer.deploy(SmartContents, v00_UserRegistry.address, claimHolder.address)

                var smartContents = await SmartContents.deployed()
                await whiteList.addWhiteList(smartContents.address);
                
                await deployer.deploy(SmartExchange, whiteList.address, v00_UserRegistry.address, claimHolder.address)
                await deployer.deploy(SmartMarket, whiteList.address, v00_UserRegistry.address, claimHolder.address)

            });
        });
    });
};
