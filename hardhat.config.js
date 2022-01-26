require("@nomiclabs/hardhat-web3");
require('@nomiclabs/hardhat-truffle5');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
PRIVATE_KEY = process.env.NOT_THE_PRIVATE_KEY;
module.exports = {
  solidity: "0.8.4",
  networks: {
    Bsc_testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [`${PRIVATE_KEY}`]
    },
    Rinkeby: {
      url: 'https://speedy-nodes-nyc.moralis.io/93813387eb21013f8a586a4a/eth/rinkeby',
      accounts: [`${PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
