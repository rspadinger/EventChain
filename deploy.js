const path = require('path');
const fs = require('fs-extra');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

require('dotenv').config();
const compileAllContracts = require('./SCCompile');

//const buildFolder = path.resolve(__dirname, process.env.BUILDFOLDER);
const clientSCFolder = path.resolve(__dirname, process.env.CLIENTSCFOLDER);
const contractPath = path.resolve(clientSCFolder, process.env.CONTRACTTODEPLOY);
const addressFile = path.resolve(__dirname, 'ADDRESS');

const deploySpecifiedContract = async () => {
  //first, we compile all contracts
  try {
    //const res = await compileAllContracts();
    //console.log(res);

    console.log('START DEPLOYMENT...');

    const web3 = getWeb3();

    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    const compiledContract = require(contractPath + '.json');

    const result = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
      .deploy({ data: '0x' + compiledContract.bytecode })
      .send({ gas: '5000000', from: accounts[0] });

    // const addressFileContent = `module.exports = '${result.options.address}';`;
    const addressFileContent = result.options.address;
    fs.writeFileSync(addressFile, addressFileContent);

    //replace the placeholder 'MYCONTRACTADDRESS' in the Factory.js file with the actual contract address
    const files = fs.readdirSync(clientSCFolder);
    for (let i in files) {
      const contractJSFile = process.env.CONTRACTTODEPLOY.toLowerCase() + '.js';
      if (files[i].toLowerCase().includes(contractJSFile)) {
        const SCFile = path.resolve(__dirname, process.env.CLIENTSCFOLDER, files[i]);
        const content = fs.readFileSync(SCFile, 'utf8');
        fs.writeFileSync(SCFile, content.replace('MYCONTRACTADDRESS', result.options.address));
      }
    }

    console.log('Contract deployed to', result.options.address);
  } catch (err) {
    console.log('ERR: ', err.message);
  }
};

const getWeb3 = () => {
  //select the required provider
  let provider;
  if (process.env.DEPLOYTOGANACHE === 'true') {
    //deploy to local ganache
    provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
  } else {
    //deploy to Rinkeby test network using infura and the MetaMask seed words
    console.log('Deploy to Rinkeby...');
    provider = new HDWalletProvider(
      'length peace seat balance pet note copy impose divert rifle lock hobby',
      'https://rinkeby.infura.io/v3/22a0aa32d784482393a03f6caa4e3c37'
    );
  }

  return new Web3(provider);
};

deploySpecifiedContract();
