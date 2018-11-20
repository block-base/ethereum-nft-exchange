var TestToken = artifacts.require('TestToken')
var Exchange = artifacts.require('Exchange')

contract('Exchange', async function (accounts) {

    var testToken1;
    var testToken2;

    const ID = 1;

    it('deploy token1', async function () {
        testToken1 = await TestToken.new();
        await testToken1.mint();
        assert.equal(await testToken1.balanceOf(accounts[0]), 1);
        assert.equal(await testToken1.ownerOf(ID), accounts[0]);
    })

    it('deploy token2', async function () {
        testToken2 = await TestToken.new();
        await testToken2.mint({ from: accounts[1] });
        assert.equal(await testToken2.balanceOf(accounts[1]), 1);
        assert.equal(await testToken2.ownerOf(ID), accounts[1]);
    })

    it('request', async function () {
        smartExchange = await Exchange.deployed();
        await testToken1.approve(smartExchange.address, ID);
        await smartExchange.request(testToken1.address, ID, testToken2.address, ID);

        items = await smartExchange.items(testToken1.address, ID)
        assert.equal(await testToken1.ownerOf(ID), smartExchange.address);
        assert.equal(items[0], accounts[0]);
        assert.equal(items[1], testToken2.address);
        assert.equal(items[2], ID);
        assert.equal(items[3], true);
    })

    it('confirm', async function () {
        smartExchange = await Exchange.deployed();
        await testToken2.approve(smartExchange.address, ID, { from: accounts[1] });
        await smartExchange.confirm(testToken1.address, ID, { from: accounts[1] });
        assert.equal(await testToken1.ownerOf(ID), accounts[1]);
        assert.equal(await testToken2.ownerOf(ID), accounts[0]);
    })

    it('cancel', async function () {
        smartExchange = await Exchange.deployed();
        await testToken2.approve(smartExchange.address, ID);
        await smartExchange.request(testToken2.address, ID, testToken1.address, ID);
        await smartExchange.cancel(testToken2.address, ID);
        assert.equal(await testToken2.ownerOf(ID), accounts[0]);
    })

})