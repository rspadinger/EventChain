import { ethers } from "ethers"
import { getEventDetails } from "../bcTools/bcInteraction.js"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { nanoid } from "nanoid"
import _ from "lodash"
import moment from "moment"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
    Segment,
    Button,
    Form,
    Radio,
    Divider,
    Modal,
    Header,
    Icon,
    Container,
} from "semantic-ui-react"

const EventList = () => {
    const [loading, setLoading] = useState(false)
    const [activeRadio, setActiveRadio] = useState("1")
    const [modalOpen, setModalOpen] = useState(false)
    const [eventDetails, setEventDetails] = useState([])
    const [activeEv, setActiveEv] = useState([])
    const [canceledEv, setCanceledEv] = useState([])
    const [expiredEv, setExpiredEv] = useState([])

    useEffect(() => {
        async function init() {
            //get all event details
            setLoading(true)
            const { eventDetails } = await getEventDetails()

            const orderedEvents = _.orderBy(eventDetails, [5], ["asc"])
            const currentDateTime = parseInt(Date.now() / 1000)

            const activeEvents = orderedEvents.filter(
                (ev) => parseInt(ev[5]) / 1000 > currentDateTime && ev[8] == false
            )
            const canceledEvents = orderedEvents.filter((ev) => ev[8] == true)
            const expiredEvents = orderedEvents.filter(
                (ev) => parseInt(ev[5]) / 1000 <= currentDateTime && ev[8] == false
            )

            setActiveEv(activeEvents)
            setCanceledEv(canceledEvents)
            setExpiredEv(expiredEvents)

            setLoading(false)

            //TODO add additional event listeners: EventCreated, EventModified..
        }
        init()
    }, [])

    function renderEvents() {
        let activeEvents, expiredEvents, canceledEvents
        let headerColor = "teal"
        activeEvents = []

        if (activeRadio === "1" || activeRadio === "2") {
            activeEvents = activeEv.map((myEvent) => {
                return getEventBlock(myEvent, headerColor, false)
            })
        }

        if (activeRadio === "1" || activeRadio === "3") {
            expiredEvents = expiredEv.map((myEvent) => {
                headerColor = "grey"
                return getEventBlock(myEvent, headerColor, false)
            })
            if (expiredEvents.length > 0) {
                expiredEvents.unshift(
                    <Divider key={nanoid()} section horizontal>
                        Expired Events
                    </Divider>
                )
            }
        }

        if (activeRadio === "1" || activeRadio === "4") {
            canceledEvents = canceledEv.map((myEvent) => {
                headerColor = "orange"
                return getEventBlock(myEvent, headerColor, true)
            })
            if (canceledEvents.length > 0) {
                canceledEvents.unshift(
                    <Divider key={nanoid()} section horizontal>
                        Canceled Events
                    </Divider>
                )
            }
        }

        const allEvents = activeEvents.concat(expiredEvents, canceledEvents)
        return allEvents
    }

    function getEventBlock(myEvent, headerColor, disabled) {
        const ethAmount = ethers.utils.formatEther(myEvent[3])
        return (
            <Segment.Group size="mini" key={nanoid()}>
                <Segment inverted color={headerColor} style={styles.mediumBoldTextStyle}>
                    {myEvent[0]}
                </Segment>
                <Segment style={styles.mediumTextStyle}>Where: {myEvent[2]}</Segment>
                <Segment.Group horizontal>
                    <Segment style={styles.mediumTextStyle}>
                        When: {moment.unix(myEvent[5] / 1000).format("MMMM Do YYYY, h:mm a")}
                    </Segment>
                    <Segment style={styles.mediumTextStyle}>
                        Fee: {ethAmount} ETH
                        <Link to={`/eventshow/${myEvent[7]}`}>
                            <Button
                                positive
                                icon
                                labelPosition="left"
                                size="small"
                                disabled={disabled}
                                floated="right"
                                primary
                            >
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
                            onClick={() => onDetailsButtonClick(myEvent)}
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
        )
    }

    const handleChange = (e, radio) => {
        setActiveRadio(radio.value)
    }

    const onModalClose = () => {
        setModalOpen(false)
    }

    const onDetailsButtonClick = (myEvent) => {
        setModalOpen(true)
        setEventDetails(myEvent)
    }

    const getAmountInEther = (wei) => {
        if (typeof wei != "undefined") return ethers.utils.formatEther(wei)
    }

    const getEventStatus = (dateTime, canceled) => {
        //1: active ; 2: canceled ; 3: expired
        const currentDateTime = parseInt(Date.now())

        if (canceled == true) return "Canceled"
        else if (dateTime > currentDateTime && canceled == false) return "Active"
        else if (dateTime <= currentDateTime && canceled == false) return "Expired"
    }

    return (
        <div>
            <ToastContainer position="top-center" />
            {/* style={{ marginTop: "6em", flex: "1" }}  */}
            <Container text style={{ marginTop: "6em" }}>
                <h3>List of Events:</h3>

                <Form loading={loading}>
                    <Form.Group inline>
                        <label>Display: </label>
                        <Form.Field
                            control={Radio}
                            label="All Events"
                            value="1"
                            checked={activeRadio === "1"}
                            onChange={handleChange}
                        />
                        <Form.Field
                            control={Radio}
                            label="Active Events"
                            value="2"
                            checked={activeRadio === "2"}
                            onChange={handleChange}
                        />
                        <Form.Field
                            control={Radio}
                            label="Expired Events"
                            value="3"
                            checked={activeRadio === "3"}
                            onChange={handleChange}
                        />
                        <Form.Field
                            control={Radio}
                            label="Canceled Events"
                            value="4"
                            checked={activeRadio === "4"}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>

                {renderEvents()}

                <Modal open={modalOpen} onClose={onModalClose} closeIcon size="small">
                    <Header icon="list" content="Event Details" />
                    <Modal.Content>
                        <p>
                            <b>Title: </b>
                            {eventDetails[0]}
                        </p>
                        <p>
                            <b>Description: </b>
                            {eventDetails[1]}
                        </p>
                        <p>
                            <b>Location: </b>
                            {eventDetails[2]}
                        </p>

                        <p>
                            <b>Date & Time: </b>
                            {moment.unix(eventDetails[5] / 1000).format("MMMM Do YYYY, h:mm a")}
                        </p>
                        <p>
                            <b>Fee: </b>
                            {getAmountInEther(eventDetails[3])} Ether
                        </p>
                        <p>
                            <b>Maximum number of participants: </b>
                            {eventDetails[4]}
                        </p>

                        <p>
                            <b>Already registered participants: </b>
                            {eventDetails[9]}
                        </p>
                        <p>
                            <b>Event Status: </b>
                            {getEventStatus(eventDetails[5], eventDetails[8])}
                        </p>
                    </Modal.Content>
                </Modal>
            </Container>
        </div>
    )
}

const styles = {
    errorTextStyle: {
        fontSize: 20,
        alignSelf: "center",
        color: "red",
    },
    verySmallTextStyle: {
        fontSize: 12,
    },
    mediumTextStyle: {
        fontSize: 14,
    },
    mediumBoldTextStyle: {
        fontSize: 16,
        fontWeight: "bold",
    },
}

export default EventList
