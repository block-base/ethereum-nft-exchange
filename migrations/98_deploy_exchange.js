var Exchange = artifacts.require("./Exchange.sol");

module.exports = async function (deployer) {
    await deployer.deploy(Exchange).then(async () => {
    });
};
