var Integration = artifacts.require('Integration')
var Identity = artifacts.require('Identity.sol')

var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");

var { readFileSync } = require('fs')

var Web3 = require('web3');
var Wallet = require('ethereumjs-wallet');
var wallet = Wallet.generate();

var signerPrivKey = readFileSync('signer_priv_key', 'utf-8');

const web3Eth = new Web3(web3.currentProvider).eth;
const web3Utils = new Web3(web3.currentProvider).utils;

contract('Integration', async function (accounts) {

    var ID1;
    var ID2;
    const PRICE = 1000000000000000000;    

    it('Deploy identity', async function () {
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        await Identity.new(v00_UserRegistry.address);
        await Identity.new(v00_UserRegistry.address, { from: accounts[1] });
    })

    it('kyc for publish', async function () {
        integration = await Integration.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
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

        result = await claimVerifier.claimIsValid(user, claimType);
        assert.equal(result, true);

        /*
        var hash = wallet.getPrivateKeyString();
        await integration.mint(hash, PRICE);

        ID1 = await integration.getContentToTokenId(hash);
        assert.equal(await integration.ownerOf(ID1), integration.address);
        */

    })

    it('kyc for market 1 ', async function () {
        integration = await Integration.deployed();
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

        /*
        var hash = wallet.getPrivateKeyString();
        await integration.mint(hash, PRICE);

        ID1 = await integration.getContentToTokenId(hash);
        assert.equal(await integration.ownerOf(ID1), integration.address);
        */

    })

    it('kyc for market 2', async function () {
        integration = await Integration.deployed();
        var claimVerifier = await ClaimVerifier.deployed();
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[1], { from: accounts[1]});
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

        /*
        var hash = wallet.getPrivateKeyString();
        await integration.mint(hash, PRICE);

        ID1 = await integration.getContentToTokenId(hash);
        assert.equal(await integration.ownerOf(ID1), integration.address);
        */

    })

    it('mint1 ', async function () {

        integration = await Integration.deployed();
        var hash = wallet.getPrivateKeyString();
        await integration.mint(hash, PRICE);

        ID1 = await integration.getContentToTokenId(hash);
        assert.equal(await integration.ownerOf(ID1), integration.address);

    })


    it('purchase', async function () {
        integration = await Integration.deployed();
        await integration.purchase(ID1, { from: accounts[1], value: PRICE });
        assert.equal(await integration.ownerOf(ID1), accounts[1]);
    })

    it('sell', async function () {
        integration = await Integration.deployed();
        await integration.sell(ID1, PRICE, { from: accounts[1]});
        markets = await integration.markets(ID1)
        assert.equal(await integration.ownerOf(ID1), integration.address);
        assert.equal(markets[0], accounts[1]);
        assert.equal(markets[1], PRICE);
        assert.equal(markets[2], true);
    })

    it('cancel Market', async function () {
        integration = await Integration.deployed();
        await integration.cancelMarket(ID1, { from: accounts[1] });
        assert.equal(await integration.ownerOf(ID1), accounts[1]);
    })

    it('mint2 ', async function () {

        integration = await Integration.deployed();
        var hash = wallet.getPrivateKeyString();
        await integration.mint(hash, PRICE);
        ID2 = await integration.getContentToTokenId(hash);
        assert.equal(await integration.ownerOf(ID2), integration.address);

    })

    it('cancel Market', async function () {
        integration = await Integration.deployed();
        await integration.cancelMarket(ID2);
        assert.equal(await integration.ownerOf(ID2), accounts[0]);
    })

    it('request', async function () {
        integration = await Integration.deployed();
        await integration.request(ID2, ID1);

        items = await integration.exchanges(ID2)
        assert.equal(await integration.ownerOf(ID2), integration.address);
        assert.equal(items[0], accounts[0]);    
        assert.equal(items[1].toString(), ID1.toString());
        assert.equal(items[2], true);

    })

    it('confirm', async function () {
        integration = await Integration.deployed();
        await integration.confirm(ID2, { from: accounts[1] });
        assert.equal(await integration.ownerOf(ID2), accounts[1]);
        assert.equal(await integration.ownerOf(ID1), accounts[0]);
    })

    it('cancel', async function () {
        integration = await Integration.deployed();
        await integration.request(ID1, ID2);
        await integration.cancelExchange(ID1);
        
        assert.equal(await integration.ownerOf(ID1), accounts[0]);
    })    

})