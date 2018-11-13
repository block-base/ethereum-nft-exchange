var SmartMarket = artifacts.require("./SmartMarket.sol");

module.exports = function (deployer) {

    deployer.deploy(SmartMarket).then(async () => {
    });
};
