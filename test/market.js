var TestToken = artifacts.require('TestToken')
var Market = artifacts.require('Market')

contract('Market', async function(accounts) {
  
    var testToken;
    const ID = 1;
    const PRICE = 1000000000000000000;

    it('deploy token', async function() {
      testToken = await TestToken.new();    
      await testToken.mint();
      assert.equal(await testToken.balanceOf(accounts[0]), 1);
      assert.equal(await testToken.ownerOf(ID), accounts[0]);
    })

    it('sell', async function() {
        smartMarket = await Market.deployed();
        await testToken.approve(smartMarket.address, ID);
        await smartMarket.sell(testToken.address, ID, PRICE);
        items =  await smartMarket.items(testToken.address, ID)
        assert.equal(await testToken.ownerOf(ID), smartMarket.address);        
        assert.equal(items[0], accounts[0]);
        assert.equal(items[1], PRICE);
        assert.equal(items[2], true);
    })    

    it('purchase', async function() {
        smartMarket = await Market.deployed();
        await smartMarket.purchase(testToken.address, ID, {from: accounts[1], value: PRICE});
        assert.equal(await testToken.ownerOf(ID), accounts[1]);
    })    

    it('cancel', async function() {
        smartMarket = await Market.deployed();
        await testToken.approve(smartMarket.address, ID, {from: accounts[1]});
        await smartMarket.sell(testToken.address, ID, PRICE, {from: accounts[1]});
        await smartMarket.cancel(testToken.address, ID, {from: accounts[1]});
        assert.equal(await testToken.ownerOf(ID), accounts[1]);        
    })       

})