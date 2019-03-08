const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
require('dotenv').config();

const compileAllContracts = () => {
  return new Promise((resolve, reject) => {
    try {
      this.buildFolder = path.resolve(__dirname, process.env.BUILDFOLDER);
      this.clientSCFolder = path.resolve(__dirname, process.env.CLIENTSCFOLDER);
      this.contractsFolder = path.resolve(__dirname, process.env.CONTRACTSFOLDER);

      //delete the build folder
      fs.removeSync(this.buildFolder);

      // Loop through all the files in the contracts directory
      const contracts = fs.readdirSync(this.contractsFolder);

      //create the build folder
      fs.ensureDirSync(this.buildFolder);

      contracts.forEach(async contract => {
        if (path.extname(contract) === '.sol') {
          const currentContractPath = path.resolve(__dirname, process.env.CONTRACTSFOLDER, contract);
          const contractSource = fs.readFileSync(currentContractPath, 'utf8');
          //const compiledContract = solc.compile(contractSource, 1).contracts;

          try {
            const compiledContract = await doCompile(contractSource);

            //loop over all contracts that may be found in a single contract file and save them as .json
            for (let contr in compiledContract) {
              const SC = contr.replace(':', '');
              const isFactory = SC.toLowerCase().includes('factory') ? true : false;

              console.log('Saving contract: ', SC + '.json');
              //fs.outputJsonSync(path.resolve(this.buildFolder, SC + '.json'), compiledContract[contr]);
              fs.outputJsonSync(path.resolve(this.clientSCFolder, SC + '.json'), compiledContract[contr]);

              //create a .js file for each compiled contract
              const fileContent = getContractAccessContent(SC, isFactory);
              const clientSCFile = path.resolve(this.clientSCFolder, SC + '.js');
              fs.writeFileSync(clientSCFile, fileContent);
            }
          } catch (err) {
            console.log(`The following contract could not be compiled: ${contract} - Error: ${err.message}`);
          }
        }
      }); //end of forEach

      //everything worked fine
      resolve('All contracts have been compiled successfully!');
    } catch (err) {
      reject('There was a problem while compiling one of your contracts: ' + err.message);
    }
  });
};

const getContractAccessContent = (SC, isFactory) => {
  const header = `import web3 from './web3';
import ${SC} from './${SC}.json';
`;

  if (isFactory)
    return `${header}
export default new web3.eth.Contract(JSON.parse(${SC}.interface), 'MYCONTRACTADDRESS');
`;
  else
    return `${header}
export default address => {
  return new web3.eth.Contract(JSON.parse(${SC}.interface), address);
};
`;
};

const doCompile = async contractSource => {
  //solc.compile is sync - so, we don't really need to wrap this into a promise
  return new Promise((resolve, reject) => {
    try {
      const compiledContract = solc.compile(contractSource, 1).contracts;
      resolve(compiledContract);
    } catch (err) {
      reject(err.message);
    }
  });
};

module.exports = compileAllContracts;
