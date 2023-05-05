import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useParams } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import moment from "moment"
import DatePicker from "react-datepicker"
import datePickerStyle from "react-datepicker/dist/react-datepicker.css"

import {
    getEventContract,
    getEventDetails,
    getCurrentWalletConnected,
} from "../bcTools/bcInteraction.js"

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
    Container,
} from "semantic-ui-react"

//TODO simplify this page & break it up into various components - state also needs to be simplified
const EventShow = () => {
    const [walletAddress, setWallet] = useState("")
    const [loading, setLoading] = useState(false)
    const [eventContr, setEventContr] = useState()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [fee, setFee] = useState(0.1)
    const [maxParticip, setMaxParticip] = useState(10)
    const [dateTime, setDateTime] = useState()
    const [manager, setManager] = useState("")
    const [eventCanceled, setEventCanceled] = useState(false)
    const [regParticipantCount, setRegParticipantCount] = useState(0)
    const [badRatingCount, setBadRatingCount] = useState(0)
    const [loadingModify, setLoadingModify] = useState(false)
    const [loadingCancel, setLoadingCancel] = useState(false)
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [loadingRetrieve, setLoadingRetrieve] = useState(false)
    const [loadingRegister, setLoadingRegister] = useState(false)
    const [loadingUnregister, setLoadingUnregister] = useState(false)
    const [loadingRate, setLoadingRate] = useState(false)
    const [loadingUnrate, setLoadingUnrate] = useState(false)
    const [loadingRefund, setLoadingRefund] = useState(false)
    const [loadingParticipList, setLoadingParticipList] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [balance, setBalance] = useState(0)
    const [participList, setParticipList] = useState("")
    const [registerModalOpen, setRegisterModalOpen] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [unregisterModalOpen, setUnregisterModalOpen] = useState(false)
    const [rateBadModalOpen, setRateBadModalOpen] = useState(false)
    const [balanceModalOpen, setBalanceModalOpen] = useState(false)
    const [participListModalOpen, setParticipListModalOpen] = useState(false)
    const [participName, setParticipName] = useState("")
    const [participEmail, setParticipEmail] = useState("")
    const [participTel, setParticipTel] = useState("")
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [userAddress, setUserAddress] = useState("")
    const [isOwner, setIsOwner] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [gaveBadRating, setGaveBadRating] = useState(false)
    const [allowModify, setAllowModify] = useState(false)
    const [allowCancel, setAllowCancel] = useState(false)
    const [allowBalance, setAllowBalance] = useState(false)
    const [allowRetrieve, setAllowRetrieve] = useState(false)
    const [allowRegister, setAllowRegister] = useState(false)
    const [allowUnregister, setAllowUnregister] = useState(false)
    const [allowRate, setAllowRate] = useState(false)
    const [allowUnrate, setAllowUnrate] = useState(false)
    const [allowRefund, setAllowRefund] = useState(false)
    const [allowParticipList, setAllowParticipList] = useState(false)
    const [userInfo, setUserInfo] = useState("")

    const { eventAddress } = useParams()
    let interval

    useEffect(() => {
        async function init() {
            //get event details
            setLoading(true)

            addWalletListener()
            getEventData()

            setLoading(false)

            //interval = setInterval(getEventData, 5000)
        }
        init()
        // return () => {
        //     clearInterval(interval)
        // }
    }, [])

    const addWalletListener = () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0])
                    getEventData()
                } else {
                    setWallet("")
                }
            })
        }
    }

    const getEventData = async () => {
        const { eventContr, status } = await getEventContract(eventAddress)
        if (status) {
            toast.error(status)
            return
        }
        setEventContr(eventContr)

        const { address: walletAddress } = await getCurrentWalletConnected()
        setWallet(walletAddress)

        const { eventDetails } = await getEventDetails(eventAddress)
        const eventDetail = eventDetails[0]

        const title = eventDetail[0]
        setTitle(title)
        const description = eventDetail[1]
        setDescription(description)
        const location = eventDetail[2]
        setLocation(location)
        const fee = ethers.utils.formatEther(eventDetail[3].toString())
        setFee(fee)
        const maxParticip = eventDetail[4]
        setMaxParticip(maxParticip)
        const dateTime = parseInt(eventDetail[5])
        setDateTime(dateTime)
        const manager = eventDetail[6]
        setManager(manager)
        const eventCanceled = eventDetail[8]
        setEventCanceled(eventCanceled)
        const regParticipantCount = eventDetail[9]
        setRegParticipantCount(regParticipantCount)
        const badRatingCount = eventDetail[10]
        setBadRatingCount(badRatingCount)

        //TODO this needs to be improved => add an event for each user action to the smart contract =>
        // listen to those events and update the UI accordingly

        //additional props
        const isOwner = manager.toUpperCase() == walletAddress.toUpperCase() ? true : false
        const maxParticipReached = regParticipantCount >= maxParticip ? true : false
        const particip = await eventContr.participants(walletAddress)

        const isReg = particip[4]
        setIsRegistered(isReg)

        const badRate = await eventContr.badRating(walletAddress)
        setGaveBadRating(badRate)

        setUserAddress(walletAddress)
        setAllowParticipList(isOwner ? true : false)

        setAllowModify(
            moment().add(1, "days").unix() * 1000 < dateTime &&
                isOwner &&
                !maxParticipReached &&
                !eventCanceled
                ? true
                : false
        )

        setAllowCancel(
            moment().add(1, "days") < dateTime && isOwner && !eventCanceled ? true : false
        )
        setAllowBalance(isOwner ? true : false)
        setAllowRetrieve(moment() > moment(dateTime).add(7, "days") && isOwner ? true : false)
        setAllowRegister(
            moment().add(1, "hours") < dateTime && !isOwner && !maxParticipReached && !isReg
                ? true
                : false
        )
        setAllowUnregister(moment().add(6, "hours") < dateTime && !isOwner && isReg ? true : false)
        setAllowRate(
            moment() > moment(dateTime).add(2, "hours") &&
                moment() < moment(dateTime).add(7, "days") &&
                !isOwner &&
                isReg &&
                !badRate
                ? true
                : false
        )
        setAllowUnrate(
            moment() > moment(dateTime).add(2, "hours") &&
                moment() < moment(dateTime).add(7, "days") &&
                !isOwner &&
                isReg &&
                badRate
                ? true
                : false
        )
        setAllowRefund(
            badRate.badRatingCount > badRate.regParticipantCount / 2 && !isOwner && isReg && badRate
                ? true
                : false
        )

        let uinfo = "Your address: " + walletAddress
        if (isReg && !isOwner) uinfo += " - You are alreday registered for this event"
        if (!isReg && !isOwner) uinfo += " - You are not yet registered for this event"
        if (isReg && !isOwner && badRate) uinfo += " - You provided a bad rating for this event"

        setUserInfo(uinfo)
    }

    const onModifyButtonClick = async () => {
        setLoadingModify(true)
        setErrorMessage("")
        const dateTimeUnix = moment(dateTime).unix() * 1000

        try {
            let txn = await eventContr.modifyEvent(
                title,
                description,
                location,
                ethers.utils.parseEther(fee),
                maxParticip,
                dateTimeUnix
            )
            await txn.wait()

            setShowSuccessMessage(true)
            setSuccessMessage("The event details have been modified!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem modifying the event details!")
        }
        setLoadingModify(false)
    }

    const onCancelButtonClick = () => {
        setCancelModalOpen(true)
    }
    const onCancelModalClose = () => {
        setCancelModalOpen(false)
    }
    const onCancelModalClickNo = () => {
        setCancelModalOpen(false)
    }

    const onCancelModalClickYes = async () => {
        setCancelModalOpen(false)
        setLoadingCancel(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.cancelEvent()
            await txn.wait()

            setEventCanceled(true)

            setShowSuccessMessage(true)
            setSuccessMessage("This event has been canceled!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem canceling this event!")
        }
        setLoadingCancel(false)
    }

    const onBalanceButtonClick = async () => {
        setLoadingBalance(true)
        setErrorMessage("")
        let balance = 0

        try {
            balance = ethers.utils.formatEther(await eventContr.contractBalance())
            setBalanceModalOpen(true)
            setBalance(balance)
        } catch (err) {
            setErrorMessage("The contract balance can only be retrieved by the contract owner.")
        }
        setLoadingBalance(false)
    }

    const onBalanceModalClose = () => {
        setBalanceModalOpen(false)
    }

    const onParticipListButtonClick = async () => {
        setLoadingParticipList(true)
        setErrorMessage("")
        let pList = ""

        try {
            const regParticipants = await eventContr.getListOfRegisteredParticipants()

            const participList = await Promise.all(
                Array(parseInt(regParticipants.length))
                    .fill()
                    .map((element, index) => {
                        return eventContr.participants(regParticipants[index])
                    })
            )

            if (participList.length == 0) pList = "Nobody has registered yet for this event."

            for (var i = 0; i < participList.length; i++) {
                pList +=
                    "Name: " +
                    participList[i][1] +
                    " - Email: " +
                    participList[i][2] +
                    " - Tel: " +
                    participList[i][3] +
                    "\n"
            }

            let partList = pList.split("\n").map((item, i) => <p key={i}>{item}</p>)
            setParticipList(partList)
            setParticipListModalOpen(true)
        } catch (err) {
            setErrorMessage("There was a problem showing the list of registered participants.")
        }
        setLoadingParticipList(false)
    }

    const onParticipListModalClose = () => {
        setParticipListModalOpen(false)
    }

    const onRetrieveButtonClick = async () => {
        setLoadingRetrieve(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.retrieveEventFees()
            await txn.wait()

            setShowSuccessMessage(true)
            setSuccessMessage("Your funds have been retrieved!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem retrieving your funds - please try again later!")
        }
        setLoadingRetrieve(false)
    }

    const onRegisterButtonClick = () => {
        setRegisterModalOpen(true)
    }

    const onRegisterModalClose = () => {
        setRegisterModalOpen(false)
        setParticipName("")
        setParticipEmail("")
        setParticipTel("")
    }

    const onRegisterModalClickCancel = () => {
        onRegisterModalClose()
    }

    const onRegisterModalClick = async () => {
        setRegisterModalOpen(false)
        setLoadingRegister(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.registerForEvent(participName, participEmail, participTel, {
                value: ethers.utils.parseEther(fee),
            })
            await txn.wait()

            let newCount = regParticipantCount + 1
            setRegParticipantCount(newCount)
            setAllowRegister(false)
            setAllowUnregister(true)

            setShowSuccessMessage(true)
            setSuccessMessage("Thank you very much, you have been registered for this event!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem registering you for this event!")
        }
        setLoadingRegister(false)
        setParticipName("")
        setParticipEmail("")
        setParticipTel("")
    }

    const onUnregisterButtonClick = () => {
        setUnregisterModalOpen(true)
    }

    const onUnregisterModalClose = () => {
        setUnregisterModalOpen(false)
    }

    const onUnregisterModalClickNo = () => {
        setUnregisterModalOpen(false)
    }

    const onUnregisterModalClickYes = async () => {
        setUnregisterModalOpen(false)
        setLoadingUnregister(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.unregisterFromEvent()
            await txn.wait()

            let newCount = regParticipantCount - 1
            setRegParticipantCount(newCount)
            setAllowRegister(true)
            setAllowUnregister(false)

            setShowSuccessMessage(true)
            setSuccessMessage("You have been unregistered for this event!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem unregistering you from this event!")
        }
        setLoadingUnregister(false)
    }

    const onRateButtonClick = async () => {
        setRateBadModalOpen(true)
    }

    const onRateBadModalClose = () => {
        setRateBadModalOpen(false)
    }

    const onRateBadModalClickNo = () => {
        setRateBadModalOpen(false)
    }

    const onRateBadModalClickYes = async () => {
        setRateBadModalOpen(false)
        setLoadingRate(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.rateEventAsBad()
            await txn.wait()

            setBadRatingCount(badRatingCount++)

            setShowSuccessMessage(true)
            setSuccessMessage("Your rating has been applied!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem applying your rating - please try again later!")
        }
        setLoadingRate(false)
    }

    const onUnrateButtonClick = async () => {
        setLoadingUnrate(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.reverseBadRating()
            await txn.wait()

            setBadRatingCount(badRatingCount--)

            setShowSuccessMessage(true)
            setSuccessMessage("Your rating has been reversed!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem reversing your rating!")
        }
        setLoadingUnrate(false)
    }

    const onRefundButtonClick = async () => {
        setLoadingRefund(true)
        setErrorMessage("")

        try {
            let txn = await eventContr.recoverPaidFees()
            await txn.wait()

            setShowSuccessMessage(true)
            setSuccessMessage("Your fees have been refunded!")

            setTimeout(() => {
                setShowSuccessMessage(false)
                setSuccessMessage("")
            }, 10000)
        } catch (err) {
            setErrorMessage("There was a problem refunding your paid fees - please try again late")
        }
        setLoadingRefund(false)
    }

    return (
        <Container text style={{ marginTop: "6em", flex: "1" }}>
            <h3>Event Details</h3>

            <Form error={!!errorMessage} success={showSuccessMessage}>
                <Form.Field>
                    <label htmlFor="title">Event Title</label>
                    <Input
                        id="title"
                        placeholder="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </Form.Field>

                <Form.Field>
                    <label htmlFor="description">Event Description</label>
                    <TextArea
                        id="description"
                        placeholder="Event description..."
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </Form.Field>

                <Form.Field>
                    <label htmlFor="location">Event Location</label>
                    <Input
                        id="location"
                        placeholder="Location"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
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
                            onChange={(date) => setDateTime(date)}
                            showTimeSelect
                            dateFormat="Pp"
                        />
                    </Form.Field>

                    <Form.Field width="5">
                        <label htmlFor="fee">Event Fee</label>
                        <Input
                            id="fee"
                            label="ETH"
                            labelPosition="right"
                            placeholder="0.1"
                            value={fee}
                            onChange={(event) => setFee(event.target.value)}
                        />
                    </Form.Field>

                    <Form.Field width="4">
                        <label htmlFor="maxPart">Max Participants</label>
                        <Input
                            id="maxPart"
                            placeholder="10"
                            value={maxParticip}
                            onChange={(event) => setMaxParticip(event.target.value)}
                        />
                    </Form.Field>
                </Form.Group>

                <Message
                    error
                    icon="warning"
                    header="There was a problem!"
                    attached="bottom"
                    negative
                    content={errorMessage}
                />
                <Message success header={successMessage} />
            </Form>

            <Divider horizontal section>
                User Actions
            </Divider>

            <Message hidden={true} color="teal" size="mini" content={userInfo} />

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
                                            loading={loadingModify}
                                            onClick={onModifyButtonClick}
                                            primary
                                        >
                                            Modify Event
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Button
                                            disabled={!allowCancel}
                                            loading={loadingCancel}
                                            onClick={onCancelButtonClick}
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
                                            loading={loadingBalance}
                                            onClick={onBalanceButtonClick}
                                            primary
                                        >
                                            Contract Balance
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Button
                                            disabled={!allowParticipList}
                                            loading={loadingParticipList}
                                            onClick={onParticipListButtonClick}
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
                                            loading={loadingRetrieve}
                                            onClick={onRetrieveButtonClick}
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
                                            loading={loadingRegister}
                                            onClick={onRegisterButtonClick}
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
                                                    loading={loadingUnregister}
                                                    onClick={onUnregisterButtonClick}
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
                                            loading={loadingRate}
                                            onClick={onRateButtonClick}
                                            negative
                                        >
                                            Rate Event as Bad
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Button
                                            disabled={!allowUnrate}
                                            loading={loadingUnrate}
                                            onClick={onUnrateButtonClick}
                                            primary
                                        >
                                            Delete Bad Rating
                                        </Button>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns={1} stretched>
                                    <Grid.Column>
                                        <Button
                                            onClick={onRefundButtonClick}
                                            loading={loadingRefund}
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
            <Modal open={cancelModalOpen} onClose={onCancelModalClose} closeIcon size="small">
                <Header icon="calendar times" content="Cancel Event" />
                <Modal.Content>
                    <p>Are you sure you want to cancel this event?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color="green" onClick={onCancelModalClickNo}>
                        <Icon name="remove" /> No
                    </Button>
                    <Button basic color="red" onClick={onCancelModalClickYes}>
                        <Icon name="checkmark" /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>

            {/* Modal for Unregister from Event */}
            <Modal
                open={unregisterModalOpen}
                onClose={onUnregisterModalClose}
                closeIcon
                size="small"
            >
                <Header icon="times rectangle outline" content="Unregister from Event" />
                <Modal.Content>
                    <p>Are you sure you want to unregister from this event?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color="green" onClick={onUnregisterModalClickNo}>
                        <Icon name="remove" /> No
                    </Button>
                    <Button basic color="red" onClick={onUnregisterModalClickYes}>
                        <Icon name="checkmark" /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>

            {/* Modal for Bad Rating */}
            <Modal open={rateBadModalOpen} onClose={onRateBadModalClose} closeIcon size="small">
                <Header icon="thumbs outline down" content="Provide a Bad Rating" />
                <Modal.Content>
                    <p>Are you sure you want to provide a bad rating for this event?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color="green" onClick={onRateBadModalClickNo}>
                        <Icon name="remove" /> No
                    </Button>
                    <Button basic color="red" onClick={onRateBadModalClickYes}>
                        <Icon name="checkmark" /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>

            {/* Modal for Contract Balance */}
            <Modal open={balanceModalOpen} onClose={onBalanceModalClose} closeIcon size="small">
                <Header icon="money" content={"Contract Balance: " + balance + " ETH"} />
            </Modal>

            {/* Modal for Participants List */}
            <Modal
                open={participListModalOpen}
                onClose={onParticipListModalClose}
                closeIcon
                size="small"
            >
                <Header icon="list" content="List of registered participants" />
                <Modal.Content>
                    <Modal.Description>{participList}</Modal.Description>
                </Modal.Content>
            </Modal>

            {/* Modal for Register Event */}
            <Modal open={registerModalOpen} onClose={onRegisterModalClose} closeIcon size="small">
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
                                onChange={(event) => setParticipName(event.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="email">Your Email Address</label>
                            <Input
                                id="email"
                                placeholder="Email"
                                value={participEmail}
                                onChange={(event) => setParticipEmail(event.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="tel">Your Telephone Number</label>
                            <Input
                                id="tel"
                                placeholder="Telephone"
                                value={participTel}
                                onChange={(event) => setParticipTel(event.target.value)}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color="green" onClick={onRegisterModalClick}>
                        <Icon name="checkmark" /> Register
                    </Button>
                    <Button basic color="red" onClick={onRegisterModalClickCancel}>
                        <Icon name="cancel" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </Container>
    )
}

export default EventShow
