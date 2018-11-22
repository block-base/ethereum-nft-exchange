var { writeFileSync } = require('fs')

var Integration = artifacts.require("./Integration.sol");
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

                var v00_UserRegistry = await V00_UserRegistry.deployed()
                var claimHolder = await ClaimHolder.deployed()
                var signerKey = Web3Utils.soliditySha3(signerAddress)

                await claimHolder.addKey(signerKey, 3, 1)
                await deployer.deploy(Integration, v00_UserRegistry.address, claimHolder.address);
                var integration = await Integration.deployed();

                /*
                await integration.mint("1", "test1", "Qmaurc3QCxriNbozR5LPQ3aJHd4qrbjiVxvvoLJtj8AeNQ", 100)
                await integration.mint("2", "test2", "QmWMSuErBER8n2maYFdM74XaFHMt4xNKR3crhsgkYzXVLv", 100)
                await integration.mint("3", "test3", "QmUJPnD1hC9MDp1NCS1vrwuXbjJhyRKExsTP1sPtjgfmbF", 100)
                await integration.mint("4", "test4", "QmXzePSRPtLpGm21BrnmcKTyWDywf36dFDePwYrk124vw8", 100)
                await integration.mint("5", "test5", "QmZpinRSyjuVHQhMDPiG4jAe9m5Xginr4xZBgZydfXyffm", 100)
                await integration.mint("6", "test6", "QmXXjXomp6zRSn23yXZkTCFVkF6h4UyS1Yvmpao5dawnL1", 100)
                await integration.mint("7", "test7", "Qmf1bp57pFNtdKLjyrGaQMybjapbLWR2KzGezdZzySWE5w", 100)
                await integration.mint("8", "test8", "QmTk8BhgE3WaeBE7aD7DWy7VmjbKuSiJFaj9kQLjrPdjot", 100)
                */

        });
    });
};
