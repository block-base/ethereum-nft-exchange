var SmartContents = artifacts.require('SmartContents')
var SmartMarket = artifacts.require('SmartMarket')
var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var Identity = artifacts.require('./Identity.sol')

var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");

var { readFileSync } = require('fs')
var Web3 = require('web3');
var Wallet = require('ethereumjs-wallet');
var wallet = Wallet.generate();

var signerPrivKey = readFileSync('signer_priv_key', 'utf-8');

const web3Eth = new Web3(web3.currentProvider).eth;
const web3Utils = new Web3(web3.currentProvider).utils;

contract('SmartMarket', async function (accounts) {

    var ID;
    const PRICE = 1000000000000000000;

    it('Deploy identity', async function () {
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        await Identity.new(v00_UserRegistry.address);
        await Identity.new(v00_UserRegistry.address, { from: accounts[1]} );
    })

    it('minting with kyc', async function () {
        smartContents = await SmartContents.deployed();

        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[0]);
        var identity = await Identity.at(user);
        var issuer = await ClaimHolder.deployed();

        var claimType = 1;
        var rawData = "Verified OK";
        var hexData = web3Utils.asciiToHex(rawData)

        var data = web3Utils.soliditySha3(user, claimType, hexData)
        var sig = web3Eth.accounts.sign(data, signerPrivKey).signature;

        await identity.addClaim(
            claimType,
            0,
            issuer.address,
            sig,
            hexData,
            ""
        )

        var hash = wallet.getPrivateKeyString();
        await smartContents.mint(hash);

        ID = await smartContents.getContentToTokenId(hash);
        assert.equal(await smartContents.ownerOf(ID), accounts[0]);
    })

    it('kyc for seller', async function () {
        smartMarket = await SmartMarket.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[0]);
        var identity = await Identity.at(user);
        var issuer = await ClaimHolder.deployed();

        var claimType = 2;
        var rawData = "Verified OK";
        var hexData = web3Utils.asciiToHex(rawData)

        var data = web3Utils.soliditySha3(user, claimType, hexData)
        var sig = web3Eth.accounts.sign(data, signerPrivKey).signature;

        await identity.addClaim(
            claimType,
            0,
            issuer.address,
            sig,
            hexData,
            ""
        )

        result = await claimVerifier.claimIsValid(user, claimType);
        assert.equal(result, true);
    })

    it('kyc for purchase', async function () {
        smartMarket = await SmartMarket.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
        var v00_UserRegistry = await V00_UserRegistry.deployed()

        var user = await v00_UserRegistry.users(accounts[1]);
        var identity = await Identity.at(user);
        var issuer = await ClaimHolder.deployed();

        var claimType = 2;
        var rawData = "Verified OK";
        var hexData = web3Utils.asciiToHex(rawData)

        var data = web3Utils.soliditySha3(user, claimType, hexData)
        var sig = web3Eth.accounts.sign(data, signerPrivKey).signature;

        await identity.addClaim(
            claimType,
            0,
            issuer.address,
            sig,
            hexData,
            "",
            { from: accounts[1]}
        )

        result = await claimVerifier.claimIsValid(user, claimType);
        assert.equal(result, true);
    })

    it('sell', async function () {
        smartMarket = await SmartMarket.deployed();
        await smartContents.approve(smartMarket.address, ID);
        await smartMarket.sell(smartContents.address, ID, PRICE);
        items = await smartMarket.items(smartContents.address, ID)
        assert.equal(await smartContents.ownerOf(ID), smartMarket.address);
        assert.equal(items[0], accounts[0]);
        assert.equal(items[1], PRICE);
        assert.equal(items[2], true);
    })

    it('purchase', async function () {
        smartMarket = await SmartMarket.deployed();
        await smartMarket.purchase(smartContents.address, ID, { from: accounts[1], value: PRICE });
        assert.equal(await smartContents.ownerOf(ID), accounts[1]);
    })

    it('cancel', async function () {
        smartMarket = await SmartMarket.deployed();
        await smartContents.approve(smartMarket.address, ID, { from: accounts[1] });
        await smartMarket.sell(smartContents.address, ID, PRICE, { from: accounts[1] });
        await smartMarket.cancel(smartContents.address, ID, { from: accounts[1] });
        assert.equal(await smartContents.ownerOf(ID), accounts[1]);
    })

})