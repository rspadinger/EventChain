import { useState } from "react"
import { ethers } from "ethers"
import { Form, Button, Input, Message, TextArea, Container } from "semantic-ui-react"
import moment from "moment"
import DatePicker from "react-datepicker"
import datePickerStyle from "react-datepicker/dist/react-datepicker.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { createEvent } from "../bcTools/bcInteraction.js"

const EventCreate = () => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [fee, setFee] = useState("0")
    const [maxParticip, setMaxParticip] = useState(10)
    const [dateTime, setDateTime] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const onSubmit = async (event) => {
        event.preventDefault()

        toast.info("🦊 Please confirm your transaction in Metamask!")

        setLoading(true)
        setErrorMessage("")
        setStatusMessage("")

        try {
            const dateTimeUnix = moment(dateTime).unix() * 1000
            const { status, error } = await createEvent(
                title,
                description,
                location,
                ethers.utils.parseEther(fee),
                maxParticip,
                dateTimeUnix
            )

            if (error) setErrorMessage(error)
            else if (status) setStatusMessage(status)
        } catch (err) {
            setErrorMessage(err.message)
        }

        setLoading(false)
    }

    return (
        <div>
            <ToastContainer position="top-center" />
            <Container text style={{ marginTop: "6em" }}>
                <h3>Create a new Event</h3>

                <Form
                    loading={loading}
                    onSubmit={onSubmit}
                    success={!!statusMessage}
                    error={!!errorMessage}
                >
                    <Form.Field>
                        <label htmlFor="title">Event Title</label>
                        <Input
                            id="title"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="description">Event Description</label>
                        <TextArea
                            id="description"
                            placeholder="Event description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="location">Event Location</label>
                        <Input
                            id="location"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="fee">Event Fee</label>
                        <Input
                            id="fee"
                            label="ETH"
                            labelPosition="right"
                            placeholder="0.1"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="maxPart">Max Participants</label>
                        <Input
                            id="maxPart"
                            placeholder="10"
                            value={maxParticip.toString()}
                            onChange={(e) => setMaxParticip(parseInt(e.target.value))}
                        />
                    </Form.Field>

                    <Form.Field>
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

                    <Message error header="There was a problem!" content={errorMessage} />
                    <Message success header="New Event Created!" content={statusMessage} />
                    <Button floated="right" loading={loading} primary>
                        Create Event
                    </Button>
                </Form>
            </Container>
        </div>
    )
}

export default EventCreate
