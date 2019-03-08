import React, { Component } from 'react';
import {
  Grid,
  Button,
  Form,
  Input,
  TextArea,
  Message,
  Segment,
  Divider,
  Modal,
  Header,
  Icon,
  Popup,
  Container
} from 'semantic-ui-react';
import moment from 'moment';
import DatePicker from 'react-datepicker';

import web3 from '../SC/web3';
import Event from '../SC/Event';

class EventShow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      event: null,
      title: '',
      description: '',
      location: '',
      fee: 1,
      maxParticip: 10,
      dateTime: null,
      manager: '',
      eventCanceled: false,
      regParticipantCount: 0,
      badRatingCount: 0,
      loadingModify: false,
      loadingCancel: false,
      loadingBalance: false,
      loadingRetrieve: false,
      loadingRegister: false,
      loadingUnregister: false,
      loadingRate: false,
      loadingUnrate: false,
      loadingRefund: false,
      loadingParticipList: false,
      errorMessage: '',
      balance: 0,
      participList: '',
      registerModalOpen: false,
      cancelModalOpen: false,
      unregisterModalOpen: false,
      rateBadModalOpen: false,
      balanceModalOpen: false,
      participListModalOpen: false,
      participName: '',
      participEmail: '',
      participTel: '',
      showSuccessMessage: false,
      successMessage: '',
      userAddress: '',
      isOwner: false,
      isRegistered: false,
      gaveBadRating: false,
      allowModify: false,
      allowCancel: false,
      allowBalance: false,
      allowRetrieve: false,
      allowRegister: false,
      allowUnregiste: false,
      allowRate: false,
      allowUnrate: false,
      allowRefund: false,
      allowParticipList: false,
      userInfo: ''
    };

    //this.onChange = this.onChange.bind(this);
  }

  async componentDidMount() {
    const id = this.props.match.params.id;
    const event = Event(id);
    const details = await event.methods.getEventDetails().call();

    this.setState({
      event,
      title: details[0],
      description: details[1],
      location: details[2],
      fee: details[3],
      maxParticip: details[4],
      dateTime: moment.unix(details[5]),
      manager: details[6]
    });

    this.interval = setInterval(this.getContractProperties, 2000);
    this.updateEventDetails();
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  };

  handleDateChange = date => {
    this.setState({ dateTime: date });
  };

  updateEventDetails = async () => {
    const { event } = this.state;

    const details = await event.methods.getEventDetails().call();

    this.setState({
      eventCanceled: details[8],
      regParticipantCount: details[9],
      badRatingCount: details[10]
    });

    this.getContractProperties();
  };

  getContractProperties = async () => {
    const {
      event,
      fee,
      maxParticip,
      dateTime,
      manager,
      eventCanceled,
      regParticipantCount,
      badRatingCount,
      balance,
      userAddress,
      isRegistered,
      gaveBadRating,
      allowModify,
      allowCancel,
      allowBalance,
      allowRetrieve,
      allowRegister,
      allowUnregister,
      allowRate,
      allowUnrate,
      allowRefund,
      allowParticipList,
      userInfo
    } = this.state;

    // isOwner, isRegistered, gaveBadRating, allowRegister, allowCancel, allowRetrieve, maxParticipReached,
    // allowRating, allowRecoverPaidFees

    const accounts = await web3.eth.getAccounts();
    if (accounts.length == 0) {
      clearInterval(this.interval);
      this.setState({
        errorMessage: 'Please make sure you are logged in with MetaMask and connected to the Rinkeby network!'
      });
      return;
    }

    if (accounts === null) {
      return;
    }

    const isOwner = manager == accounts[0] ? true : false;
    const maxParticipReached = regParticipantCount >= maxParticip ? true : false;
    const particip = await event.methods.participants(accounts[0]).call();
    this.setState({ isRegistered: particip[4] });
    const badRate = await event.methods.badRating(accounts[0]).call();
    this.setState({ gaveBadRating: badRate });
    //console.log('Registered: ' + particip[4] + ' Bad Rating: ' + badRate + ' Registered Particip: ' + regParticipantCount);

    this.setState({ userAddress: accounts[0] });
    this.setState({ allowParticipList: isOwner ? true : false });
    this.setState({
      allowModify: moment().add(1, 'days') < dateTime && isOwner && !maxParticipReached && !eventCanceled ? true : false
    });
    this.setState({ allowCancel: moment().add(1, 'days') < dateTime && isOwner && !eventCanceled ? true : false });
    this.setState({ allowBalance: isOwner ? true : false });
    this.setState({ allowRetrieve: moment() > moment(dateTime).add(7, 'days') && isOwner ? true : false });
    this.setState({
      allowRegister:
        moment().add(1, 'hours') < dateTime && !isOwner && !maxParticipReached && !isRegistered ? true : false
    });
    this.setState({ allowUnregister: moment().add(6, 'hours') < dateTime && !isOwner && isRegistered ? true : false });
    this.setState({
      allowRating:
        moment() > moment(dateTime).add(2, 'hours') &&
        moment() < moment(dateTime).add(7, 'days') &&
        !isOwner &&
        isRegistered &&
        !gaveBadRating
          ? true
          : false
    });
    this.setState({
      allowUnrate:
        moment() > moment(dateTime).add(2, 'hours') &&
        moment() < moment(dateTime).add(7, 'days') &&
        !isOwner &&
        isRegistered &&
        gaveBadRating
          ? true
          : false
    });
    this.setState({
      allowRefund: badRatingCount > regParticipantCount / 2 && !isOwner && isRegistered && gaveBadRating ? true : false
    });

    //user state: address - You are reegistered for this event - You provided a bad rating
    let uinfo = 'Your address: ' + accounts[0];
    if (isRegistered && !isOwner) uinfo += ' - You are alreday registered for this event';
    if (!isRegistered && !isOwner) uinfo += ' - You are not yet registered for this event';
    if (isRegistered && !isOwner && gaveBadRating) uinfo += ' - You provided a bad rating for this event';

    //this.setState({userInfo: allowModify.toString()});
    this.setState({ userInfo: uinfo });
  };

  onModifyButtonClick = async () => {
    this.setState({ loadingModify: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    //const feeWei = web3.utils.toWei(this.state.fee.toString(), 'ether');
    const dateTimeUnix = moment(this.state.dateTime).unix();

    const { event } = this.state;

    try {
      await event.methods
        .modifyEvent(
          this.state.title,
          this.state.description,
          this.state.location,
          this.state.fee,
          this.state.maxParticip,
          dateTimeUnix
        )
        .send({
          from: accounts[0],
          gas: '5000000'
        });

      this.setState({
        loadingModify: false,
        showSuccessMessage: true,
        successMessage: 'The event details have been modified!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem modifying the event details!' });
    }
    this.setState({ loadingModify: false });
  };

  onCancelButtonClick = () => {
    this.setState({ cancelModalOpen: true });
  };
  onCancelModalClose = () => {
    this.setState({ cancelModalOpen: false });
  };
  onCancelModalClickNo = () => {
    this.setState({ cancelModalOpen: false });
  };

  onCancelModalClickYes = async () => {
    this.setState({ cancelModalOpen: false, loadingCancel: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();

    const { event } = this.state;

    try {
      await event.methods.cancelEvent().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({
        loadingCancel: false,
        showSuccessMessage: true,
        successMessage: 'This event has been canceled!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem canceling this event!' });
    }
    this.setState({ loadingCancel: false });
  };

  onBalanceButtonClick = async () => {
    this.setState({ loadingBalance: true, errorMessage: '' });
    let balance = 0;
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      balance = await event.methods.contractBalance().call({ from: accounts[0] });
      balance = web3.utils.fromWei(balance.toString(), 'ether');

      this.setState({ balanceModalOpen: true, balance: balance, loadingBalance: false });
    } catch (err) {
      this.setState({ errorMessage: 'The contract balance can only be retrieved by the contract owner.' });
      //this.setState({ errorMessage: err.message });
    }
    this.setState({ loadingBalance: false });
  };

  onBalanceModalClose = () => {
    this.setState({ balanceModalOpen: false });
  };

  onParticipListButtonClick = async () => {
    this.setState({ loadingParticipList: true, errorMessage: '' });
    let pList = '';
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      const regParticipants = await event.methods.getListOfRegisteredParticipants().call();
      const regParticipCount = regParticipants.length;

      const participList = await Promise.all(
        Array(parseInt(regParticipCount))
          .fill()
          .map((element, index) => {
            return event.methods.participants(regParticipants[index]).call();
          })
      );

      if (participList.length == 0) pList = 'Nobody has registered yet for this event.';

      for (var i = 0; i < participList.length; i++) {
        pList +=
          'Name: ' + participList[i][1] + ' - Email: ' + participList[i][2] + ' - Tel: ' + participList[i][3] + '\n';
      }

      let partList = pList.split('\n').map((item, i) => <p key={i}>{item}</p>);

      this.setState({ participListModalOpen: true, participList: partList, loadingParticipList: false });
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem showing the list of registered participants.' });
    }
    this.setState({ loadingParticipList: false });
  };

  onParticipListModalClose = () => {
    this.setState({ participListModalOpen: false });
  };

  onRetrieveButtonClick = async () => {
    this.setState({ loadingRetrieve: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods.retrieveEventFees().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({
        loadingRetrieve: false,
        showSuccessMessage: true,
        successMessage: 'Your funds have been retrieved!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem retrieving your funds - please try again later!' });
    }
    this.setState({ loadingRetrieve: false });
  };

  onRegisterButtonClick = () => {
    this.setState({ registerModalOpen: true });
  };

  onRegisterModalClose = () => {
    this.setState({ registerModalOpen: false, participName: '', participEmail: '', participTel: '' });
  };

  onRegisterModalClickCancel = () => {
    this.setState({ registerModalOpen: false, participName: '', participEmail: '', participTel: '' });
  };

  onRegisterModalClick = async () => {
    this.setState({ registerModalOpen: false, loadingRegister: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods
        .registerForEvent(this.state.participName, this.state.participEmail, this.state.participTel)
        .send({
          from: accounts[0],
          value: this.state.fee,
          gas: '5000000'
        });

      this.setState({
        loadingRegister: false,
        showSuccessMessage: true,
        successMessage: 'Thank you very much, you have been registered for this event!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem registering you for this event!' });
    }
    this.setState({ loadingRegister: false, participName: '', participEmail: '', participTel: '' });
  };

  onUnregisterButtonClick = () => {
    this.setState({ unregisterModalOpen: true });
  };

  onUnregisterModalClose = () => {
    this.setState({ unregisterModalOpen: false });
  };

  onUnregisterModalClickNo = () => {
    this.setState({ unregisterModalOpen: false });
  };

  onUnregisterModalClickYes = async () => {
    this.setState({ unregisterModalOpen: false, loadingUnregister: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods.unregisterFromEvent().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({
        loadingUnregister: false,
        showSuccessMessage: true,
        successMessage: 'You have been unregistered for this event!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem unregistering you from this event!' });
    }
    this.setState({ loadingUnregister: false });
  };

  onRateButtonClick = async () => {
    this.setState({ rateBadModalOpen: true });
  };

  onRateBadModalClose = () => {
    this.setState({ rateBadModalOpen: false });
  };

  onRateBadModalClickNo = () => {
    this.setState({ rateBadModalOpen: false });
  };

  onRateBadModalClickYes = async () => {
    this.setState({ rateBadModalOpen: false, loadingRate: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods.rateEventAsBad().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({ loadingRate: false, showSuccessMessage: true, successMessage: 'Your rating has been applied!' });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem applying your rating - please try again later!' });
    }
    this.setState({ loadingRate: false });
  };

  onUnrateButtonClick = async () => {
    this.setState({ loadingUnrate: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods.reverseBadRating().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({
        loadingUnrate: false,
        showSuccessMessage: true,
        successMessage: 'Your rating has been reversed!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem reversing your rating!' });
    }
    this.setState({ loadingUnrate: false });
  };

  onRefundButtonClick = async () => {
    this.setState({ loadingRefund: true, errorMessage: '' });
    const accounts = await web3.eth.getAccounts();
    const { event } = this.state;

    try {
      await event.methods.recoverPaidFees().send({
        from: accounts[0],
        gas: '5000000'
      });

      this.setState({
        loadingRefund: false,
        showSuccessMessage: true,
        successMessage: 'Your fees have been refunded!'
      });
      setTimeout(() => {
        this.setState({ showSuccessMessage: false, successMessage: '' });
      }, 10000);
      this.updateEventDetails();
    } catch (err) {
      this.setState({ errorMessage: 'There was a problem refunding your paid fees - please try again later!' });
    }
    this.setState({ loadingRefund: false });
  };

  render() {
    const {
      title,
      description,
      location,
      fee,
      maxParticip,
      dateTime,
      errorMessage,
      participName,
      participEmail,
      participTel,
      showSuccessMessage,
      successMessage,
      allowModify,
      allowCancel,
      allowBalance,
      allowRetrieve,
      allowRegister,
      allowUnregister,
      allowRate,
      allowUnrate,
      allowRefund,
      allowParticipList,
      userInfo,
      participList
    } = this.state;

    return (
      <Container text style={{ marginTop: '6em', flex: '1' }}>
        <h3>Event Details</h3>

        <Form error={!!errorMessage} success={showSuccessMessage}>
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

          <Form.Group>
            <Form.Field width="7">
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

            <Form.Field width="5">
              <label htmlFor="fee">Event Fee</label>
              <Input
                id="fee"
                label="ETH"
                labelPosition="right"
                placeholder="0.1"
                value={web3.utils.fromWei(fee.toString(), 'ether')}
                onChange={event => this.setState({ fee: web3.utils.toWei(event.target.value.toString(), 'ether') })}
              />
            </Form.Field>

            <Form.Field width="4">
              <label htmlFor="maxPart">Max Participants</label>
              <Input
                id="maxPart"
                placeholder="10"
                value={maxParticip}
                onChange={event => this.setState({ maxParticip: event.target.value })}
              />
            </Form.Field>
          </Form.Group>

          <Message
            error
            icon="warning"
            header="There was a problem!"
            attached="bottom"
            negative
            content={this.state.errorMessage}
          />
          <Message success header={successMessage} />
        </Form>

        <Divider horizontal section>
          User Actions
        </Divider>

        <Message color="teal" size="mini" content={userInfo} />

        <Grid columns={2} divided>
          <Grid.Row stretched>
            <Grid.Column>
              <Segment color="teal">
                <Grid>
                  <Grid.Row columns={1}>
                    <Grid.Column textAlign="center">
                      <h4>Event Owner</h4>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={2} stretched>
                    <Grid.Column>
                      <Button
                        disabled={!allowModify}
                        loading={this.state.loadingModify}
                        onClick={this.onModifyButtonClick}
                        primary
                      >
                        Modify Event
                      </Button>
                    </Grid.Column>
                    <Grid.Column>
                      <Button
                        disabled={!allowCancel}
                        loading={this.state.loadingCancel}
                        onClick={this.onCancelButtonClick}
                        negative
                      >
                        Cancel Event
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={2} stretched>
                    <Grid.Column>
                      <Button
                        disabled={!allowBalance}
                        loading={this.state.loadingBalance}
                        onClick={this.onBalanceButtonClick}
                        primary
                      >
                        Contract Balance
                      </Button>
                    </Grid.Column>
                    <Grid.Column>
                      <Button
                        disabled={!allowParticipList}
                        loading={this.state.loadingParticipList}
                        onClick={this.onParticipListButtonClick}
                        primary
                      >
                        List of Participants
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1} stretched>
                    <Grid.Column>
                      <Button
                        disabled={!allowRetrieve}
                        loading={this.state.loadingRetrieve}
                        onClick={this.onRetrieveButtonClick}
                        primary
                      >
                        Retrieve Event Fees
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            </Grid.Column>

            <Grid.Column>
              <Segment color="teal">
                <Grid>
                  <Grid.Row columns={1}>
                    <Grid.Column textAlign="center">
                      <h4>Event Participant</h4>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={2} stretched>
                    <Grid.Column>
                      <Button
                        disabled={!allowRegister}
                        loading={this.state.loadingRegister}
                        onClick={this.onRegisterButtonClick}
                        primary
                      >
                        Register
                      </Button>
                    </Grid.Column>
                    <Grid.Column>
                      <Popup
                        trigger={
                          <Button
                            disabled={!allowUnregister}
                            loading={this.state.loadingUnregister}
                            onClick={this.onUnregisterButtonClick}
                            negative
                          >
                            Unregister
                          </Button>
                        }
                        content="Test"
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={2} stretched>
                    <Grid.Column>
                      <Button
                        disabled={!allowRate}
                        loading={this.state.loadingRate}
                        onClick={this.onRateButtonClick}
                        negative
                      >
                        Rate Event as Bad
                      </Button>
                    </Grid.Column>
                    <Grid.Column>
                      <Button
                        disabled={!allowUnrate}
                        loading={this.state.loadingUnrate}
                        onClick={this.onUnrateButtonClick}
                        primary
                      >
                        Delete Bad Rating
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row columns={1} stretched>
                    <Grid.Column>
                      <Button
                        onClick={this.onRefundButtonClick}
                        loading={this.state.loadingRefund}
                        disabled={!allowRefund}
                        primary
                      >
                        Request a Refund
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* Modal for Cancel Event */}
        <Modal open={this.state.cancelModalOpen} onClose={this.onCancelModalClose} closeIcon size="small">
          <Header icon="calendar times" content="Cancel Event" />
          <Modal.Content>
            <p>Are you sure you want to cancel this event?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="green" onClick={this.onCancelModalClickNo}>
              <Icon name="remove" /> No
            </Button>
            <Button basic color="red" onClick={this.onCancelModalClickYes}>
              <Icon name="checkmark" /> Yes
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Modal for Unregister from Event */}
        <Modal open={this.state.unregisterModalOpen} onClose={this.onUnregisterModalClose} closeIcon size="small">
          <Header icon="times rectangle outline" content="Unregister from Event" />
          <Modal.Content>
            <p>Are you sure you want to unregister from this event?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="green" onClick={this.onUnregisterModalClickNo}>
              <Icon name="remove" /> No
            </Button>
            <Button basic color="red" onClick={this.onUnregisterModalClickYes}>
              <Icon name="checkmark" /> Yes
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Modal for Bad Rating */}
        <Modal open={this.state.rateBadModalOpen} onClose={this.onRateBadModalClose} closeIcon size="small">
          <Header icon="thumbs outline down" content="Provide a Bad Rating" />
          <Modal.Content>
            <p>Are you sure you want to provide a bad rating for this event?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="green" onClick={this.onRateBadModalClickNo}>
              <Icon name="remove" /> No
            </Button>
            <Button basic color="red" onClick={this.onRateBadModalClickYes}>
              <Icon name="checkmark" /> Yes
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Modal for Contract Balance */}
        <Modal open={this.state.balanceModalOpen} onClose={this.onBalanceModalClose} closeIcon size="small">
          <Header icon="money" content={'Contract Balance: ' + this.state.balance + ' ETH'} />
        </Modal>

        {/* Modal for Participants List */}
        <Modal open={this.state.participListModalOpen} onClose={this.onParticipListModalClose} closeIcon size="small">
          <Header icon="list" content="List of registered participants" />
          <Modal.Content>
            <Modal.Description>{participList}</Modal.Description>
          </Modal.Content>
        </Modal>

        {/* Modal for Register Event */}
        <Modal open={this.state.registerModalOpen} onClose={this.onRegisterModalClose} closeIcon size="small">
          <Header icon="checkmark box" content="Register for this Event" />
          <Modal.Content>
            <p>Please provide the details below</p>
            <Form>
              <Form.Field>
                <label htmlFor="name">Your Name</label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={participName}
                  onChange={event => this.setState({ participName: event.target.value })}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="email">Your Email Address</label>
                <Input
                  id="email"
                  placeholder="Email"
                  value={participEmail}
                  onChange={event => this.setState({ participEmail: event.target.value })}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="tel">Your Telephone Number</label>
                <Input
                  id="tel"
                  placeholder="Telephone"
                  value={participTel}
                  onChange={event => this.setState({ participTel: event.target.value })}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="green" onClick={this.onRegisterModalClick}>
              <Icon name="checkmark" /> Register
            </Button>
            <Button basic color="red" onClick={this.onRegisterModalClickCancel}>
              <Icon name="cancel" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    );
  }
}

export default EventShow;
