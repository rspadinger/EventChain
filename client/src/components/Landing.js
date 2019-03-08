import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';

//import Layout from '../components/Layout';
import { Container, Segment, Button, Form, Radio, Message, Header, Image } from 'semantic-ui-react';
import factory from '../SC/EventFactory';
import web3 from '../SC/web3';
import Event from '../SC/Event';

import eventlist from '../images/EventList.png';
import eventdetails from '../images/EventDetail.png';
import eventactions from '../images/EventActionOwner.png';
import eventcreate from '../images/EventCreate.png';
import metamask from '../images/metamask.png';
import event from '../images/Event.png';
//import DatePicker from 'react-datepicker';

//"Title 1", "Description 1 ...", "Location 1", 1000000000000000000, "50", "1552166837"

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = { errorMessage: '', createButtonVisible: false };
  }

  async componentDidMount() {
    let eventAddresses = await factory.methods.getDeployedEvents().call();
    let eventCount = eventAddresses.length;

    if (eventCount == 0) {
      this.setState({ createButtonVisible: true });
    }
  }

  createEvents = async () => {
    const accounts = await web3.eth.getAccounts();

    if (accounts.length == 0) {
      this.setState({
        errorMessage: 'Please make sure you are logged in with MetaMask and connected to the Rinkeby network!'
      });
      return;
    }

    let eventAddresses = await factory.methods.getDeployedEvents().call();
    let eventCount = eventAddresses.length;

    if (eventCount == 0) {
      //create 2 active events
      await factory.methods
        .createEvent('Title 1', 'Description 1 ...', 'Location 1', web3.utils.toWei('0.1', 'ether'), '50', '1577901600')
        .send({
          from: accounts[0],
          gas: '5000000'
        });

      //return;

      await factory.methods
        .createEvent('Title 2', 'Description 2 ...', 'Location 2', web3.utils.toWei('0.1', 'ether'), '50', '1577901600')
        .send({
          from: accounts[0],
          gas: '5000000'
        });

      //create 1 expired events
      await factory.methods
        .createEvent(
          'Expired Event',
          'Description ...',
          'Location',
          web3.utils.toWei('0.1', 'ether'),
          '50',
          '152226360'
        )
        .send({
          from: accounts[0],
          gas: '5000000'
        });

      //create event & cancel it
      await factory.methods
        .createEvent(
          'Canceled Event',
          'Description ...',
          'Location',
          web3.utils.toWei('0.1', 'ether'),
          '50',
          '1577901600'
        )
        .send({
          from: accounts[0],
          gas: '5000000'
        });

      eventAddresses = await factory.methods.getDeployedEvents().call();
      await Event(eventAddresses[eventAddresses.length - 1])
        .methods.cancelEvent()
        .send({
          from: accounts[0],
          gas: '5000000'
        });
    }
  };

  render() {
    return (
      <Container text style={{ marginTop: '5em' }}>
        <Form error={!!this.state.errorMessage}>
          <Message error header="There was a problem!" content={this.state.errorMessage} />
        </Form>
        <Header as="h1">Event Managment on the Blockchain</Header>

        <Message positive>
          <p>
            If you would like to create events or register for existing events, you need to install the MetaMask browser
            addon, connect to the Rinkeby testnet and add some test Ether to your account. You can obtain free test
            Ether at{' '}
            <a target="_blank" href="https://www.rinkeby.io/#faucet">
              Rinkeby.io Crypto Faucet
            </a>
          </p>
        </Message>

        <p>
          This is a simple DAPP (decentralized application) that provides basic event managment capabilities on the
          Ethereum blockchain.
        </p>

        <p>
          The DAPP allows event managers to create events on the ETH Blockchain. Other users(participants) can register
          for those events.
        </p>

        <h4 style={{ marginTop: '1.5em' }}>
          Screenshot of the event list page - there are different types of events: Active, expired and canceled events:
        </h4>

        <img src={eventlist} style={{ marginTop: '0.5em' }} />

        <h4 style={{ marginTop: '1.5em' }}>
          When the user clicks the "Details" button, a preview of the event details is displayed in a popup window:
        </h4>

        <img src={eventdetails} style={{ marginTop: '1em' }} />

        <h4 style={{ marginTop: '1.5em' }}>
          When the user clicks the "Register" button, various actions are possible - depending if the user is the event
          owner or an event participant:
        </h4>

        <img src={eventactions} style={{ marginTop: '1em' }} />

        <p>
          <b>Only event owners can:</b>
        </p>
        <ul>
          <li>Modify or cancel their events</li>
          <li>Request the current contract balance (amount in ETH transferred by registered participants)</li>
          <li>Request a list of registered participants with their contact details</li>
          <li>Retrieve event fees after a specific period (7 days) once the event is finished</li>
        </ul>

        <p>
          <b>Event Participants can:</b>
        </p>

        <ul>
          <li>Register for an event</li>
          <li>Unregister for an event</li>
          <li>
            Provide a bad rating for an event - if more than 50% of all event participants provide a bad rating within 7
            days after the event has ended, those participate can issue a refund of the fees they already paid. The
            refund is issued whether the event manager agrees or not, because all funds are locked on the blockchain and
            are managed by the business rules that are defined in the smart contract.
          </li>
          <li>Revoke a previously given bad rating.</li>
        </ul>

        <h4 style={{ marginTop: '1.5em' }}>
          On the "Create Event" tab, a user can create a new event and he automatically becomes the owner / manager of
          that event:
        </h4>

        <img src={eventcreate} style={{ marginTop: '1em' }} />

        <h4 style={{ marginTop: '1.5em' }}>
          MetaMask popup that allows to confirm or cancel a Blockchain transaction:
        </h4>

        <img src={metamask} style={{ marginTop: '1em' }} />

        {this.state.createButtonVisible && (
          <div style={{ marginTop: 20 }}>
            <Button hidden onClick={this.createEvents} size="mini" content="Create Events" primary />
          </div>
        )}
      </Container>
    );
  }
}

export default Landing;
