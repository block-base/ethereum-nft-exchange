var Exchange = artifacts.require("./Exchange.sol");

module.exports = async function (deployer) {

    deployer.deploy(Exchange).then(async () => {
    });
};
