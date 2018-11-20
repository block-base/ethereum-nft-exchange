var Market = artifacts.require("./Market.sol");

module.exports = async function (deployer) {
    await deployer.deploy(Market).then(async () => {
    });
};
