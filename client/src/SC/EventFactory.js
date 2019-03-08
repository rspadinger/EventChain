import web3 from './web3';
import EventFactory from './EventFactory.json';

export default new web3.eth.Contract(JSON.parse(EventFactory.interface), '0x821376852Bd7FbE78e0cD896eECEAF817200AD9B');
