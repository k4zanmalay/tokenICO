const TTT = artifacts.require('TTT');

const STAGE1 = 60*60*24*3;
const STAGE2 = 60*60*24*30 + STAGE1;
const STAGE3 = 60*60*24*14 + STAGE2;

describe('Token with ICO', () => {
  let token, ICOAddress, accounts, timestamp

  beforeEach(async () => {
      token = await TTT.new();
      accounts = await web3.eth.getAccounts();
      await token.createICO(web3.utils.toWei('1000000'));
      ICOAddress = await token.ICOAddress();
      const block = await web3.eth.getBlock('latest');
      timestamp = block.timestamp;
  });

  describe('TTT', () => {
    it('should create an ICO contract', async () => {
      assert.ok(ICOAddress);
    });

    it('allows only owner to add chosen members to the whitelist', async () => {
      try {
        await token.whitelist(accounts[2], {from: accounts[1]});
        throw null;
      } catch(err) {
        const message = err.message.match(/(?<=\')(.*?)(?=\')/);
        assert.equal('Ownable: caller is not the owner', message[0]);
      }
    });

    it('allows only whitelisted member to transfer their tokens during the ICO', async () => {
      await token.whitelist(accounts[1]);
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: ICOAddress, 
        value: web3.utils.toWei('1')
      });
      await token.transfer(accounts[2], web3.utils.toWei('10'), {from: accounts[1]});
      let balance = await token.balanceOf(accounts[2]);
      balance = web3.utils.fromWei(balance);
      assert.equal(10, balance);
    });

    it('restricts common members from transfering their tokens during the ICO', async () => {
      try {
        await web3.eth.sendTransaction({
          from: accounts[1],
          to: ICOAddress, 
          value: web3.utils.toWei('1')
        });
        await token.transfer(accounts[2], '10', {from: accounts[1]});
        throw null;
      } catch(err) {
        const message = err.message.match(/(?<=\')(.*?)(?=\')/);
        assert.equal('Not authorized to transfer until the end of ICO', message[0]);
      }
    })

    it('allows everyone to transfer tokens after the ICO ends', async () => {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: ICOAddress, 
        value: web3.utils.toWei('1')
      });
      await token.setICOState(false);
      await token.transfer(accounts[2], web3.utils.toWei('10'), {from: accounts[1]});
      let balance = await token.balanceOf(accounts[2]);
      balance = web3.utils.fromWei(balance);
      assert.equal(10, balance);
    });
  });

  describe('ICO', () => {
    it('should send 42 tokens for 1 ETH at stage 1', async () => {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: ICOAddress, 
        value: web3.utils.toWei('1')
      });
      let balance = await token.balanceOf(accounts[1]);
      balance = web3.utils.fromWei(balance);
      assert.equal(42, balance);
    });
    
    it('should send 21 tokens for 1 ETH at stage 2', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [timestamp + STAGE1]);
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: ICOAddress, 
        value: web3.utils.toWei('1')
      });
      let balance = await token.balanceOf(accounts[1]);
      balance = web3.utils.fromWei(balance);
      assert.equal(21, balance);
    });

    it('should send 8 tokens for 1 ETH at stage 3', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [timestamp + STAGE2]);
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: ICOAddress, 
        value: web3.utils.toWei('1')
      });
      let balance = await token.balanceOf(accounts[1]);
      balance = web3.utils.fromWei(balance);
      assert.equal(8, balance);
    });

    it('should close ICO after the end of the stage 3', async () => {
      try{
        await network.provider.send('evm_setNextBlockTimestamp', [timestamp + STAGE3]);
        await web3.eth.sendTransaction({
          from: accounts[1],
          to: ICOAddress, 
          value: web3.utils.toWei('1')
        });
        throw null;
      } catch(err) {
        const message = err.message.match(/(?<=\')(.*?)(?=\')/);
        assert.equal('ICO closed', message[0]);
      }
    });
  });
});
