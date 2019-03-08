import React, { Component } from 'react';
import { Form, Button, Input, Message, TextArea, Container } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import factory from '../SC/EventFactory';
import web3 from '../SC/web3';
import Event from '../SC/Event';

class CampaignNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: 'Title...',
      description: 'Event description...',
      location: 'Event location...',
      fee: '100000000000000000',
      maxParticip: '10',
      dateTime: moment(),
      loading: false,
      errorMessage: ''
    };
  }

  onSubmit = async event => {
    event.preventDefault();

    const { title, description, location, fee, maxParticip, dateTime, loading } = this.state;

    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();

      if (accounts.length == 0) {
        this.setState({
          loading: false,
          errorMessage: 'Please make sure you are logged in with MetaMask and connected to the Rinkeby network!'
        });
        return;
      }

      const dateTimeUnix = moment(dateTime).unix();

      await factory.methods.createEvent(title, description, location, fee, maxParticip, dateTimeUnix).send({
        from: accounts[0],
        gas: '5000000'
      });

      this.props.history.push('/eventlist');
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  handleDateChange = date => {
    this.setState({ dateTime: date });
  };

  render() {
    const { title, description, location, fee, maxParticip, dateTime, loading } = this.state;

    return (
      <Container text style={{ marginTop: '6em', flex: '1' }}>
        <h3>Create a new Event</h3>

        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label htmlFor="title">Event Title</label>
            <Input
              id="title"
              placeholder="Title"
              value={title}
              onChange={event => this.setState({ title: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="description">Event Description</label>
            <TextArea
              id="description"
              placeholder="Event description..."
              value={description}
              onChange={event => this.setState({ description: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="location">Event Location</label>
            <Input
              id="location"
              placeholder="Location"
              value={location}
              onChange={event => this.setState({ location: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="fee">Event Fee</label>
            <Input
              id="fee"
              label="ETH"
              labelPosition="right"
              placeholder="0.1"
              value={web3.utils.fromWei(fee, 'ether')}
              onChange={event => this.setState({ fee: web3.utils.toWei(event.target.value.toString(), 'ether') })}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="maxPart">Max Participants</label>
            <Input
              id="maxPart"
              placeholder="10"
              value={maxParticip}
              onChange={event => this.setState({ maxParticip: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="datTime">Event Date & Time</label>
            <style>{`.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {padding-left: 0; padding-right: 0;}`}</style>
            <style>{`.react-datepicker__input-container {width: inherit; }`}</style>
            <style>{`.react-datepicker-wrapper {width: 100%; }`}</style>

            <DatePicker
              selected={dateTime}
              onChange={this.handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="LLL"
              timeCaption="time"
            />
          </Form.Field>

          <Message error header="There was a problem!" content={this.state.errorMessage} />
          <Button floated="right" loading={this.state.loading} primary>
            Create Event
          </Button>
        </Form>
      </Container>
    );
  }
}

export default withRouter(CampaignNew);
