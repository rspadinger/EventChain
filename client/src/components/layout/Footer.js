import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Divider, Dropdown, Grid, Header, Image, List, Menu, Segment, Icon } from 'semantic-ui-react';

class Footer extends Component {
  render() {
    return (
      <Segment inverted vertical style={{ margin: '6em 0em 0em', padding: '2em 0em' }}>
        <Container textAlign="left">
          <Grid divided inverted stackable>
            <Grid.Row>
              <Grid.Column floated="right" width={6}>
                <Header inverted as="h4" content="Any Questions?" />
                <p>
                  Please{' '}
                  <a href="#">
                    <b>Contact Me</b>
                  </a>{' '}
                  if you have any question, suggestions, ideas for improvements… or if you would like to hire me for
                  contract work.
                </p>
              </Grid.Column>
              <Grid.Column floated="left" width={6}>
                <Header inverted as="h4" content="Your donation for this project is very welcome." />
                <List size="tiny" inverted>
                  {/*
                    <List.Item ><Image src={BTC} style={{ marginRight: 5}} />3AepRv8MVpnr3mDnzfDmcHvpFEx8osAA1k </List.Item>
                    <List.Item ><Image src={ETH} style={{ marginRight: 5}} />0x6C37e55c7b9B5e9961375384AE334803fAB3dBC1 </List.Item>
                    <List.Item ><Image src={LTC} style={{ marginRight: 5}} />MUh3x97KZrfvER1Cmz3u3f7zYWzKgPLo59 </List.Item>
                    */}
                  <List.Item>
                    <Image src="http://crypto-calc.com/zzzEventChainImages/BTC.png" style={{ marginRight: 5 }} />
                    3AepRv8MVpnr3mDnzfDmcHvpFEx8osAA1k{' '}
                  </List.Item>
                  <List.Item>
                    <Image src="http://crypto-calc.com/zzzEventChainImages/ETH.png" style={{ marginRight: 5 }} />
                    0x6C37e55c7b9B5e9961375384AE334803fAB3dBC1{' '}
                  </List.Item>
                  <List.Item>
                    <Image src="http://crypto-calc.com/zzzEventChainImages/LTC.png" style={{ marginRight: 5 }} />
                    MUh3x97KZrfvER1Cmz3u3f7zYWzKgPLo59{' '}
                  </List.Item>
                </List>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Divider inverted section />

          <Grid columns={2} divided>
            <Grid.Row stretched>
              <Grid.Column floated="right" width={6}>
                <List horizontal inverted divided link>
                  <List.Item as="a" href="#">
                    Home
                  </List.Item>
                  <List.Item as="a" href="#">
                    Contact Me
                  </List.Item>
                </List>
              </Grid.Column>
              <Grid.Column floated="left" width={6}>
                <Icon size="small" fitted name="copyright">
                  <span style={{ fontSize: 12 }}> Robert Spadinger</span>
                </Icon>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </Segment>
    );
  }
}

export default Footer;
