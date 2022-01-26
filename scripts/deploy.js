const hre = require("hardhat");
const {abi, bytecode} = require("../artifacts/contracts/tokenICO.sol/TTT.json");

async function main() {
  const accounts = await web3.eth.requestAccounts();
  const token = await new web3.eth.Contract(abi)
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: '10000000'});
  await token.methods.createICO(web3.utils.toWei('1000000')).send({from: accounts[0]});
  const ICOAddress = await token.methods.ICOAddress().call();
  
  console.log('Contract deployed to: ', token.options.address, 'ICO deployed to: ', ICOAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

