var V00_UserRegistry = artifacts.require("./origin/identity/V00_UserRegistry.sol");
var ClaimVerifier = artifacts.require("./origin/identity/ClaimVerifier.sol");
var ClaimHolder = artifacts.require("./origin/identity/ClaimHolder.sol");

var Identity = artifacts.require('./Identity.sol')


var {readFileSync} = require('fs')
var Web3 = require('web3');

const web3Eth = new Web3(web3.currentProvider).eth;
const web3Utils = new Web3(web3.currentProvider).utils;

var signerPrivKey = readFileSync('signer_priv_key', 'utf-8');

contract('Identity', async function(accounts) {

  it('Deploy identity', async function() {
    var v00_UserRegistry = await V00_UserRegistry.deployed()
    await Identity.new(v00_UserRegistry.address);
  })

  it('Add key to identity', async function() {

    var claimVerifier = await ClaimVerifier.deployed();

    var v00_UserRegistry = await V00_UserRegistry.deployed()
    var user = await v00_UserRegistry.users(accounts[0]);
    var identity = await Identity.at(user);

    var issuer = await ClaimHolder.deployed();

    var claimType = 99;
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

    result = await claimVerifier.claimIsValid(user, claimType);
    assert.equal(result, true);
    
  })

  it('False check', async function() {
    var claimVerifier = await ClaimVerifier.deployed();
    var v00_UserRegistry = await V00_UserRegistry.deployed()
    var user = await v00_UserRegistry.users(accounts[0]);
    var claimType = 98;

    result = await claimVerifier.claimIsValid(user, claimType);
    assert.equal(result, false);
  })

})