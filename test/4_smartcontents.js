var SmartContents = artifacts.require('SmartContents')
var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var Identity = artifacts.require('./Identity.sol')

var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");

var {readFileSync} = require('fs')
var Web3 = require('web3');
var Wallet = require('ethereumjs-wallet');
var wallet = Wallet.generate();


var signerPrivKey = readFileSync('signer_priv_key', 'utf-8');

const web3Eth = new Web3(web3.currentProvider).eth;
const web3Utils = new Web3(web3.currentProvider).utils;

contract('SmartContents', async function (accounts) {

    it('Deploy identity', async function () {
        var v00_UserRegistry = await V00_UserRegistry.deployed()
        await Identity.new(v00_UserRegistry.address);
    })

    it('minting without kyc', async function () {
        smartContents = await SmartContents.deployed();
        var hash = wallet.getPrivateKeyString();
        var result = false;
        try {
            await smartContents.mint(hash);
            result = true;
        } catch (error) {
        }

        assert.equal(result, false);        
    
    })

    it('minting with kyc', async function () {

        smartContents = await SmartContents.deployed();
        var claimVerifier = await ClaimVerifier.deployed();

        var v00_UserRegistry = await V00_UserRegistry.deployed()
        var user = await v00_UserRegistry.users(accounts[0]);
        var identity = await Identity.at(user);
    
        var issuer = await ClaimHolder.deployed();
    
        var claimType = 1;
        var rawData = "Verified OK";
        var hexData = web3Utils.asciiToHex(rawData)  
    
        var data = web3Utils.soliditySha3(user,claimType,hexData)
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

        var id = await smartContents.getContentToTokenId(hash);
        assert.equal(await smartContents.ownerOf(id), accounts[0]);

    })

})