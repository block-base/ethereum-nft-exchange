var SmartContents = artifacts.require('SmartContents')
var SmartExchange = artifacts.require('SmartExchange')
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

contract('SmartExchange', async function (accounts) {

    var ID1;
    var ID2;

    it('Deploy identity', async function () {
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        await Identity.new(v00_UserRegistry.address);
        await Identity.new(v00_UserRegistry.address, { from: accounts[1] });
    })


    it('minting with kyc1', async function () {
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

        ID1 = await smartContents.getContentToTokenId(hash);
        assert.equal(await smartContents.ownerOf(ID1), accounts[0]);
    })

    it('minting with kyc2', async function () {
        smartContents = await SmartContents.deployed();

        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[1]);
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
            "",
            { from: accounts[1] }
        )

        var hash = wallet.getPrivateKeyString();
        await smartContents.mint(hash, { from: accounts[1] });

        ID2 = await smartContents.getContentToTokenId(hash);
        assert.equal(await smartContents.ownerOf(ID2), accounts[1]);

    })


    it('kyc for seller', async function () {
        smartExchange = await SmartExchange.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[0]);
        var identity = await Identity.at(user);
        var issuer = await ClaimHolder.deployed();

        var claimType = 3;
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
        smartExchange = await SmartExchange.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
        var v00_UserRegistry = await V00_UserRegistry.deployed()

        var user = await v00_UserRegistry.users(accounts[1]);
        var identity = await Identity.at(user);
        var issuer = await ClaimHolder.deployed();

        var claimType = 3;
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


    it('request', async function () {
        smartExchange = await SmartExchange.deployed();
        await smartContents.approve(smartExchange.address, ID1);
        await smartExchange.request(smartContents.address, ID1, smartContents.address, ID2);

        items = await smartExchange.items(smartContents.address, ID1)
        assert.equal(await smartContents.ownerOf(ID1), smartExchange.address);
        assert.equal(items[0], accounts[0]);
        assert.equal(items[1], smartContents.address);        
        assert.equal(items[2].toString(), ID2.toString());
        assert.equal(items[3], true);
    })

    it('confirm', async function () {
        smartExchange = await SmartExchange.deployed();
        await smartContents.approve(smartExchange.address, ID2, { from: accounts[1] });
        await smartExchange.confirm(smartContents.address, ID1, { from: accounts[1] });
        assert.equal(await smartContents.ownerOf(ID1), accounts[1]);
        assert.equal(await smartContents.ownerOf(ID2), accounts[0]);
    })

    it('cancel', async function () {
        smartExchange = await SmartExchange.deployed();
        await smartContents.approve(smartExchange.address, ID2);
        await smartExchange.request(smartContents.address, ID2, smartContents.address, ID1);
        await smartExchange.cancel(smartContents.address, ID2);
        
        assert.equal(await smartContents.ownerOf(ID2), accounts[0]);
    })

})