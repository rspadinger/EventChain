import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Segment, Button, Form, Radio, Divider, Modal, Header, Image, Icon, Container } from 'semantic-ui-react';
import _ from 'lodash';
import moment from 'moment';

import factory from '../SC/EventFactory';
import web3 from '../SC/web3';
import Event from '../SC/Event';

class EventList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeRadio: '1',
      modalOpen: false,
      eventDetails: [],
      activeEv: [],
      canceledEv: [],
      expiredEv: []
    };

    //this.onChange = this.onChange.bind(this);
  }

  async componentDidMount() {
    //debugger;
    const eventAddresses = await factory.methods.getDeployedEvents().call();
    const eventCount = eventAddresses.length;

    const events = await Promise.all(
      Array(parseInt(eventCount))
        .fill()
        .map((element, index) => {
          return Event(eventAddresses[index])
            .methods.getEventDetails()
            .call();
        })
    );

    const orderedEvents = _.orderBy(events, [5], ['asc']);
    const currentDateTime = parseInt(Date.now() / 1000);

    const activeEvents = orderedEvents.filter(ev => ev[5] > currentDateTime && ev[8] == false);
    const canceledEvents = orderedEvents.filter(ev => ev[8] == true);
    const expiredEvents = orderedEvents.filter(ev => ev[5] <= currentDateTime && ev[8] == false);

    this.setState({
      activeEv: activeEvents,
      canceledEv: canceledEvents,
      expiredEv: expiredEvents
    });
  }

  renderEvents() {
    let activeEv, expiredEv, canceledEv;
    let headerColor = 'teal';
    activeEv = [];
    const { activeRadio } = this.state;

    if (activeRadio === '1' || activeRadio === '2') {
      activeEv = this.state.activeEv.map(myEvent => {
        headerColor = 'teal';
        return this.getEventBlock(myEvent, headerColor, false);
      });
    }

    if (activeRadio === '1' || activeRadio === '3') {
      expiredEv = this.state.expiredEv.map(myEvent => {
        headerColor = 'grey';
        return this.getEventBlock(myEvent, headerColor, true);
      });
      if (this.state.expiredEv.length > 0) {
        expiredEv.unshift(
          <Divider section horizontal>
            Expired Events
          </Divider>
        );
      }
    }

    if (activeRadio === '1' || activeRadio === '4') {
      canceledEv = this.state.canceledEv.map(myEvent => {
        headerColor = 'orange';
        return this.getEventBlock(myEvent, headerColor, true);
      });
      if (this.state.canceledEv.length > 0) {
        canceledEv.unshift(
          <Divider section horizontal>
            Canceled Events
          </Divider>
        );
      }
    }

    var allEvents = activeEv.concat(expiredEv, canceledEv);
    return allEvents;
  }

  getEventBlock(myEvent, headerColor, disabled) {
    const ethAmount = web3.utils.fromWei(myEvent[3], 'ether');
    return (
      <Segment.Group size="mini">
        <Segment inverted color={headerColor} style={styles.mediumBoldTextStyle}>
          {myEvent[0]}
        </Segment>
        <Segment style={styles.mediumTextStyle}>Where: {myEvent[2]}</Segment>
        <Segment.Group horizontal>
          <Segment style={styles.mediumTextStyle}>
            When: {moment.unix(myEvent[5]).format('MMMM Do YYYY, h:mm a')}
          </Segment>
          <Segment style={styles.mediumTextStyle}>
            Fee: {ethAmount} ETH
            <Link to={`/eventshow/${myEvent[7]}`}>
              <Button positive icon labelPosition="left" size="small" disabled={disabled} floated="right" primary>
                <Icon name="signup" />
                Register
              </Button>
            </Link>
            <Button
              icon
              labelPosition="left"
              size="small"
              floated="right"
              primary
              onClick={() => this.onDetailsButtonClick(myEvent)}
            >
              <Icon name="list" />
              Details
            </Button>
          </Segment>
        </Segment.Group>
        <Segment secondary size="mini" style={styles.verySmallTextStyle}>
          Event Owner: {myEvent[6]}
        </Segment>
      </Segment.Group>
    );
  }

  handleChange = (e, radio) => {
    this.setState({ activeRadio: radio.value });
  };

  onModalClose = () => {
    this.setState({ modalOpen: false });
  };

  onDetailsButtonClick = myEvent => {
    this.setState({ modalOpen: true, eventDetails: myEvent });
  };

  getAmountInEther(wei) {
    if (typeof wei != 'undefined') return web3.utils.fromWei(wei.toString(), 'ether');
  }

  getEventStatus(dateTime, canceled) {
    //1: active ; 2: canceled ; 3: expired
    const currentDateTime = parseInt(Date.now() / 1000);

    if (canceled == true) return 'Canceled';
    else if (dateTime > currentDateTime && canceled == false) return 'Active';
    else if (dateTime <= currentDateTime && canceled == false) return 'Expired';
  }

  render() {
    const { activeRadio } = this.state;
    //console.log(activeRadio);
    return (
      <Container text style={{ marginTop: '6em', flex: '1' }}>
        <h3>List of Events:</h3>

        <Form>
          <Form.Group inline>
            <label>Display: </label>
            <Form.Field
              control={Radio}
              label="All Events"
              value="1"
              checked={activeRadio === '1'}
              onChange={this.handleChange}
            />
            <Form.Field
              control={Radio}
              label="Active Events"
              value="2"
              checked={activeRadio === '2'}
              onChange={this.handleChange}
            />
            <Form.Field
              control={Radio}
              label="Expired Events"
              value="3"
              checked={activeRadio === '3'}
              onChange={this.handleChange}
            />
            <Form.Field
              control={Radio}
              label="Canceled Events"
              value="4"
              checked={activeRadio === '4'}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>

        {this.renderEvents()}

        <Modal open={this.state.modalOpen} onClose={this.onModalClose} closeIcon size="small">
          <Header icon="list" content="Event Details" />
          <Modal.Content>
            <p>
              <b>Title: </b>
              {this.state.eventDetails[0]}{' '}
            </p>
            <p>
              <b>Description: </b>
              {this.state.eventDetails[1]}{' '}
            </p>
            <p>
              <b>Location: </b>
              {this.state.eventDetails[2]}{' '}
            </p>
            <p>
              <b>Date & Time: </b>
              {moment.unix(this.state.eventDetails[5]).format('MMMM Do YYYY, h:mm a')}{' '}
            </p>
            <p>
              <b>Fee: </b>
              {this.getAmountInEther(this.state.eventDetails[3])} Ether{' '}
            </p>
            <p>
              <b>Maximum number of participants: </b>
              {this.state.eventDetails[4]}{' '}
            </p>
            <p>
              <b>Already registered participants: </b>
              {this.state.eventDetails[9]}{' '}
            </p>
            <p>
              <b>Event Status: </b>
              {this.getEventStatus(this.state.eventDetails[5], this.state.eventDetails[8])}{' '}
            </p>
          </Modal.Content>
        </Modal>
      </Container>
    );
  }
}

const styles = {
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red'
  },
  verySmallTextStyle: {
    fontSize: 12
  },
  mediumTextStyle: {
    fontSize: 14
  },
  mediumBoldTextStyle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
};

export default EventList;
