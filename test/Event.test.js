const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/EventFactory.json');
const compiledEvent = require('../ethereum/build/Event.json');

//let declares a block-scope variable
let accounts;
let factory;
let eventAddress;
let myEvent;

//variables used for various getRequestsCountlet eventManager;
let fee;
let fee2;
let eventManager;
let particip1;
let particip2;
let particip3;
let particip4;
let eventDateTime;

//unix timestamp calculator
//https://www.epochconverter.com/
// 5 ether => 5000000000000000000

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  fee = web3.utils.toWei('2', 'ether');
  fee2 = web3.utils.toWei('3', 'ether');
  eventManager = accounts[1];
  particip1 = accounts[2];
  particip2 = accounts[3];
  particip3 = accounts[4];
  particip4 = accounts[5];
  eventDateTime = parseInt(Date.now() / 1000) + (86400 * 10); // 10 days from now

  //let balance = await web3.eth.getBalance(accounts[0]);

  //the company deploys the factory contract
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  //an event manager creates a new event (represented by an individual event contract)
  await factory.methods.createEvent('My Event', 'Event Description',
      'Event location', fee, '50', eventDateTime).send({
        from: eventManager,
        //value: '500000',  => here we could send ether along with the contract creation
        gas: '5000000'
    });

    //traditional syntax:
    //const addresses = await factory.methods.getDeployedEvents().call();
    //eventAddress = addresses[0];

    //new ES6 syntax => take the first element in the returned array and assign it to eventAddress
    [eventAddress] = await factory.methods.getDeployedEvents().call();

    //console.log('Contract Address: ' + eventAddress);

    //we get a reference to the event contract we just created
    myEvent = await new web3.eth.Contract(
      JSON.parse(compiledEvent.interface),
      eventAddress
    );

});

/* eslint it: "off" */
describe('Events', () => {

  it('deploys a factory and an event', () => {
    //assert(true);
    assert.ok(factory.options.address);
    assert.ok(myEvent.options.address);
  });

  it('marks caller as the event manager', async () => {
    const manager = await myEvent.methods.manager().call();
    assert.equal(eventManager, manager);
  });

  it('participants get refund if event is cancelled', async () => {

    const balBefore = await web3.eth.getBalance(particip1);  //100
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });

    const balAfterReg = await web3.eth.getBalance(particip1); //95
    assert(balAfterReg <= balBefore - fee);

    await myEvent.methods.cancelEvent().send({
      from: eventManager
    });

    const balAfter = await web3.eth.getBalance(particip1); //100
    assert(parseInt(balAfterReg) + parseInt(web3.utils.toWei('1.5', 'ether')) < parseInt(balAfter));
  });

  it('participant cannot retrieve event fees', async () => {

    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });

    //modify eventDateTime so that we can execute the retrieveEventFees function
    await myEvent.methods.changeDateTimeOfEvent(getNewEventDateTime(-10)).send({
      from: eventManager
    });

    try {
      await myEvent.methods.retrieveEventFees().send({
          from: particip1,
          gas: 1000000
      });
    } catch (err) {
      assert(err);
      return;
    }

    assert(false);
  });

  it('participant who gave bad rating gets money back', async () => {
    //we create 3 participants
    await myEvent.methods.registerForEvent('Particip1', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('Particip2', '', '').send({
      from: particip2,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('Particip3', '', '').send({
      from: particip3,
      value: fee,
      gas: 1000000
    });

    // contract balance should now be 3 * fee
    const contrBalance = await myEvent.methods.contractBalance().call({
      from: eventManager
    });
    assert.equal(contrBalance, fee * 3);

    let P1 = await myEvent.methods.participants(particip1).call();
    assert(P1[4] === true);

    const BP1afterReg = await web3.eth.getBalance(particip1);
    const BP3afterReg = await web3.eth.getBalance(particip3);
    const BEMafterReg = await web3.eth.getBalance(eventManager);
    //CL(BP3afterReg);

    //at the end of the event, 2 participants give a bad rating => change dateTime of event to yesterday
    await myEvent.methods.changeDateTimeOfEvent(getNewEventDateTime(-1)).send({
      from: eventManager
    });

    await myEvent.methods.rateEventAsBad().send({
      from: particip1,
      gas: 5000000
    });
    await myEvent.methods.rateEventAsBad().send({
      from: particip2,
      gas: 5000000
    });

    //change again event date so thet the owner can retrieve funds
    await myEvent.methods.changeDateTimeOfEvent(getNewEventDateTime(-10)).send({
      from: eventManager
    });

    //owner tries to retrieve event recoverPaidFees
    await myEvent.methods.retrieveEventFees().send({
      from: eventManager
    });

    const BP1afterRetrieve = await web3.eth.getBalance(particip1);
    const BP3afterRetrieve = await web3.eth.getBalance(particip3);
    const BEMafterRetrieve = await web3.eth.getBalance(eventManager);

    //Particip1 got refunded
    assert(BP1afterRetrieve > parseInt(BP1afterReg) + parseInt(web3.utils.toWei('1.5', 'ether')));
    //Particip3 did not get refunded
    assert(BP3afterRetrieve <= BP3afterReg);
    //EM receifed fee from 1 participant who did not rate event as bad
    assert(BEMafterRetrieve > parseInt(BEMafterReg) + parseInt(web3.utils.toWei('1.5', 'ether')));

    //make sure property registered has been reset to false for particip1
    P1 = await myEvent.methods.participants(particip1).call();
    assert(P1[4] === false);

  });

  it('participant gets refund if he sends more than the event fee', async () => {
    const BP1BeforeReg = await web3.eth.getBalance(particip1);
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee2,
      gas: 1000000
    });
    const BP1AfterReg = await web3.eth.getBalance(particip1);
    const final = parseInt(BP1BeforeReg) - parseInt(fee) - parseInt(web3.utils.toWei('0.1', 'ether'));

    assert(BP1AfterReg > final);

    //make sure, props for particip1 have been set correctly
    const part1 = await myEvent.methods.participants(particip1).call();
    assert.equal(part1[4], true);
    assert.equal(part1[5], fee);

    //registration fails if we register less than 1 hour before the events
    await myEvent.methods.changeDateTimeOfEvent(parseInt(Date.now() / 1000) + 2000).send({
      from: eventManager
    });
    try {
      await myEvent.methods.registerForEvent('', '', '').send({
        from: particip1,
        value: fee2
      });
    } catch (err) {
      assert(err);
      return;
    }
    assert(false);

  });

  it('test registering & unregistering', async () => {
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip2,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip3,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip4,
      value: fee,
      gas: 1000000
    });

    //unregister 1 particip
    const BP4BeforeUnreg = await web3.eth.getBalance(particip4);
    await myEvent.methods.unregisterFromEvent().send({
      from: particip4,
      gas: 1000000
    });
    const BP4AfterUnreg = await web3.eth.getBalance(particip4);

    //make sure, particip4 got his refund
    const final = parseInt(BP4BeforeUnreg) + parseInt(web3.utils.toWei('1.5', 'ether'));
    assert(BP4AfterUnreg > final);

    //const allParticip = await myEvent.methods.allParticipantCount().call();
    const regParticip = await myEvent.methods.registeredParticipantCount().call();
    //assert.equal(allParticip, 4);
    assert.equal(regParticip, 3);
  });

  it('make sure, a participant cannot unregister twice', async () => {
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });

    await myEvent.methods.unregisterFromEvent().send({
      from: particip1,
      gas: 1000000
    });

    try {
      await myEvent.methods.unregisterFromEvent().send({
        from: particip1,
        gas: 1000000
      });

    } catch (err) {
      assert(err);
      return;
    }

    assert(false);
  });

  it('someone who never rgistered cannot unregister', async () => {
    try {
      await myEvent.methods.unregisterFromEvent().send({
        from: particip1,
        gas: 1000000
      });

    } catch (err) {
      assert(err);
      return;
    }

    assert(false);
  });

  it('get list of registered & unregistered participants', async () => {
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip2,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip3,
      value: fee,
      gas: 1000000
    });

    await myEvent.methods.unregisterFromEvent().send({
      from: particip2,
      gas: 1000000
    });

    const regPart = await myEvent.methods.getListOfRegisteredParticipants().call();
    //const unregPart = await myEvent.methods.getListOfUnregisteredParticipants().call();

    assert.equal(regPart.length, 2);
    //assert.equal(unregPart.length, 1);

    //const allPartCount = await myEvent.methods.allParticipantCount().call();
    const regPartCount = await myEvent.methods.registeredParticipantCount().call();

    //assert.equal(allPartCount, 3);
    assert.equal(regPartCount, 2);
  });

  it('recover fees after bad rating', async () => {
    const BP1BeforeReg = await web3.eth.getBalance(particip1);
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip1,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip2,
      value: fee,
      gas: 1000000
    });
    await myEvent.methods.registerForEvent('', '', '').send({
      from: particip3,
      value: fee,
      gas: 1000000
    });

    //change date time of event to yesterday
    await myEvent.methods.changeDateTimeOfEvent(getNewEventDateTime(-1)).send({
      from: eventManager
    });

    //we make 3 bad ratings
    await myEvent.methods.rateEventAsBad().send({
      from: particip1,
      gas: 5000000
    });
    await myEvent.methods.rateEventAsBad().send({
      from: particip2,
      gas: 5000000
    });
    await myEvent.methods.rateEventAsBad().send({
      from: particip3,
      gas: 5000000
    });

    let badRat = await myEvent.methods.badRatingCount().call();
    assert.equal(badRat, 3);

    //we reverse 1 bad rating
    await myEvent.methods.reverseBadRating().send({
      from: particip3,
      gas: 5000000
    });

    badRat = await myEvent.methods.badRatingCount().call();
    assert.equal(badRat, 2);

    await myEvent.methods.rateEventAsBad().send({
      from: particip3,
      gas: 5000000
    });

    badRat = await myEvent.methods.badRatingCount().call();
    assert.equal(badRat, 3);

    //recover paid recoverPaidFees
    await myEvent.methods.recoverPaidFees().send({
      from: particip1,
      gas: 5000000
    });
    const BP1AftrRecover = await web3.eth.getBalance(particip1);

    assert(BP1AftrRecover > parseInt(BP1BeforeReg) - parseInt(web3.utils.toWei('0.1', 'ether')));

  });

  it('someone who is not registered cannot give a bad rating', async () => {
    await myEvent.methods.changeDateTimeOfEvent(getNewEventDateTime(-1)).send({
      from: eventManager
    });

    try {
      await myEvent.methods.rateEventAsBad().send({
        from: particip1,
        gas: 5000000
      });
    } catch (err) {
      assert(err);
      return;
    }

    assert(false);
  });


});


function getNewEventDateTime(days) {
  return parseInt(Date.now() / 1000) + (86400 * days);
}

function CL(mess) {
  console.log(mess);
}
