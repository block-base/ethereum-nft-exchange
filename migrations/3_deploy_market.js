var Market = artifacts.require("./Market.sol");

module.exports = async function (deployer) {

    deployer.deploy(Market).then(async () => {
    });
};
