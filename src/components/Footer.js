import React from "react"
import { Container, Divider, Grid, Header, Image, List, Segment, Icon } from "semantic-ui-react"

import btc from "../images/BTC.png"
import eth from "../images/ETH.png"

const Footer = () => {
    return (
        <Segment inverted vertical style={{ margin: "2em 0em 0em", padding: "2em 0em 1em" }}>
            <Container textAlign="left">
                <Grid divided inverted stackable>
                    <Grid.Row>
                        <Grid.Column floated="right" width={6}>
                            <Header inverted as="h4" content="Any Questions?" />
                            <p>
                                Please{" "}
                                <a href="#">
                                    <b>Contact Me</b>
                                </a>{" "}
                                if you have any question, suggestions, ideas for improvements… or if
                                you would like to hire me for contract work.
                            </p>
                        </Grid.Column>
                        <Grid.Column floated="left" width={6}>
                            <Header inverted as="h4" content="☕ Buy me a coffee..." />
                            <List size="tiny" inverted>
                                <List.Item>
                                    <Image src={btc} style={{ marginRight: 5 }} />
                                    bc1pnags...{" "}
                                </List.Item>
                                <List.Item>
                                    <Image src={eth} style={{ marginRight: 5 }} />
                                    0x6C37e5...{" "}
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
                            <Icon style={{ color: "#858D8E" }} size="small" fitted name="copyright">
                                &nbsp;&nbsp;
                                <span style={{ color: "#858D8E" }}>RS</span>
                            </Icon>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </Segment>
    )
}

export default Footer
