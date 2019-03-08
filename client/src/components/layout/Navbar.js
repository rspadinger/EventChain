import React, { Component } from 'react';
import { Menu, Container, Image } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { activeMenuItem: 'home' };

    //this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    // if (this.props.auth.isAuthenticated) {
    //     this.props.history.push('/dashboard');
    // }
  }

  handleItemClick = (e, menu) => {
    this.setState({ activeMenuItem: menu.name });

    switch (menu.name) {
      case 'home': {
        this.props.history.push('/');
        break;
      }
      case 'eventList': {
        this.props.history.push('/eventlist');
        break;
      }
      case 'createEvent': {
        this.props.history.push('/eventcreate');
        break;
      }
      default: {
        this.props.history.push('/');
        break;
      }
    }
  };

  render() {
    const { activeMenuItem } = this.state;

    return (
      <Menu style={{ marginTop: '0px' }} inverted fixed="top">
        <Container>
          <Menu.Item name="home" as="a" header onClick={this.handleItemClick}>
            <Image
              src="http://crypto-calc.com/zzzEventChainImages/EventChain.png"
              style={{ marginRight: '0em' }}
            />
          </Menu.Item>
          <Menu.Item
            name="home"
            as="a"
            header
            active={activeMenuItem === 'home'}
            onClick={this.handleItemClick}
          >
            Home
          </Menu.Item>

          <Menu.Item
            name="eventList"
            active={activeMenuItem === 'eventList'}
            onClick={this.handleItemClick}
          >
            Event List
          </Menu.Item>

          <Menu.Item
            name="createEvent"
            active={activeMenuItem === 'createEvent'}
            onClick={this.handleItemClick}
          >
            Create Event
          </Menu.Item>
        </Container>
      </Menu>
    );
  }
}

export default withRouter(Navbar);
