import { Container, Message, Header } from "semantic-ui-react"

import eventlist from "../images/EventList.png"
import eventdetails from "../images/EventDetail.png"
import eventactions from "../images/EventActionOwner.png"
import eventcreate from "../images/EventCreate.png"
import metamask from "../images/metamask.png"

const Home = () => {
    return (
        <Container text style={{ marginTop: "6em" }}>
            <Header style={{ textAlign: "center", marginBottom: "1.5em" }} as="h1">
                Event Management on the Blockchain
            </Header>
            <Message positive>
                <p>
                    If you would like to create events or register for existing events, you need to
                    install the MetaMask browser addon, connect to the Sepolia testnet and add some
                    test Ether to your account. You can obtain free test Ether at{" "}
                    <a target="_blank" href="https://sepoliafaucet.com/">
                        Alchemy Sepolia Faucet
                    </a>
                </p>
            </Message>
            <p>
                This is a simple DAPP (decentralized application) that provides basic event
                managment capabilities on the Ethereum blockchain.
            </p>
            <p>
                The DAPP allows event managers to create events on the ETH Blockchain. Other
                users(participants) can register for those events.
            </p>
            <h3 style={{ marginTop: "1.5em" }}>Project Improvments:</h3>
            <p>This project is a simple (and incomplete) POC and not at all production ready!</p>
            <p>
                <b>Here is a list of some improvments:</b>
            </p>
            <p>
                <ul>
                    <li>Add events to the smart contract for each user action.</li>
                    <li>
                        Curently, there are almost no tests in the /test folder => add tests for all
                        smart contract features.
                    </li>
                    <li>
                        The file pages/EventShow.js needs substantial re-work: Split up the page in
                        varrious react components, simplify the state model, add event listeners for
                        various smart contract events...
                    </li>
                </ul>
            </p>
            <h3 style={{ marginTop: "2.5em" }}>
                Screenshot of the event list page - there are different types of events: Active,
                expired and canceled events:
            </h3>
            <img src={eventlist} style={{ marginTop: "0.5em" }} />
            <h3 style={{ marginTop: "2.5em" }}>
                When the user clicks the "Details" button, a preview of the event details is
                displayed in a popup window:
            </h3>
            <img src={eventdetails} style={{ marginTop: "1em" }} />
            <h3 style={{ marginTop: "2.5em" }}>
                When the user clicks the "Register" button, various actions are possible - depending
                if the user is the event owner or an event participant:
            </h3>
            <img src={eventactions} style={{ marginTop: "1em" }} />
            <p>
                <b>Only event owners can:</b>
            </p>
            <ul>
                <li>Modify or cancel their events</li>
                <li>
                    Request the current contract balance (amount in ETH transferred by registered
                    participants)
                </li>
                <li>Request a list of registered participants with their contact details</li>
                <li>
                    Retrieve event fees after a specific period (7 days) once the event is finished
                </li>
            </ul>
            <p>
                <b>Event Participants can:</b>
            </p>
            <ul>
                <li>Register for an event</li>
                <li>Unregister for an event</li>
                <li>
                    Provide a bad rating for an event - if more than 50% of all event participants
                    provide a bad rating within 7 days after the event has ended, those participate
                    can issue a refund of the fees they already paid. The refund is issued whether
                    the event manager agrees or not, because all funds are locked on the blockchain
                    and are managed by the business rules that are defined in the smart contract.
                </li>
                <li>Revoke a previously given bad rating.</li>
            </ul>
            <h3 style={{ marginTop: "2.5em" }}>
                On the "Create Event" tab, a user can create a new event and he automatically
                becomes the owner / manager of that event:
            </h3>
            <img src={eventcreate} style={{ marginTop: "1em" }} />
            <h3 style={{ marginTop: "2.5em" }}>
                MetaMask popup that allows to confirm or cancel a Blockchain transaction:
            </h3>
            <img src={metamask} style={{ marginTop: "1em" }} />
        </Container>
    )
}

export default Home
