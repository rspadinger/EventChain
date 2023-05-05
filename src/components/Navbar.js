import { useEffect, useState } from "react"
import { Menu, Container, Image, Button } from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import logo from "../images/EventChain.png"
import { connectWallet } from "../bcTools/bcInteraction.js"

const Navbar = ({ setWallet, walletAddress }) => {
    const navigate = useNavigate()
    const [activeMenuItem, setActiveMenuItem] = useState("")
    const [status, setStatus] = useState("")

    const connectWalletPressed = async () => {
        if (walletAddress.length === 0) {
            const { address, status } = await connectWallet()
            setStatus(status)
            setWallet(address)
            if (status) toast.error(status)
        }
    }

    const handleItemClick = (e, menu) => {
        setActiveMenuItem(menu.name)
        //TODO simplify => use NavLink in Navbar below
        switch (menu.name) {
            case "home": {
                navigate("/")
                break
            }
            case "eventList": {
                navigate("/eventlist")
                break
            }
            case "createEvent": {
                navigate("/eventcreate")
                break
            }
            default: {
                navigate("/")
                break
            }
        }
    }

    return (
        <>
            <ToastContainer position="top-center" />
            <Menu inverted fixed="top">
                <Container>
                    <Menu.Item name="home" as="a" header onClick={handleItemClick}>
                        <Image src={logo} style={{ marginRight: "0em" }} />
                    </Menu.Item>
                    <Menu.Item
                        name="home"
                        header
                        active={activeMenuItem === "home"}
                        onClick={handleItemClick}
                    >
                        Home
                    </Menu.Item>

                    <Menu.Item
                        name="eventList"
                        header
                        active={activeMenuItem === "eventList"}
                        onClick={handleItemClick}
                    >
                        Event List
                    </Menu.Item>

                    <Menu.Item
                        name="createEvent"
                        header
                        active={activeMenuItem === "createEvent"}
                        onClick={handleItemClick}
                    >
                        Create Event
                    </Menu.Item>
                </Container>
                <div className="btnConnectContainer">
                    <Button className="" primary onClick={connectWalletPressed}>
                        {walletAddress.length > 0 ? (
                            "Connected: " +
                            String(walletAddress).substring(0, 6) +
                            "..." +
                            String(walletAddress).substring(38)
                        ) : (
                            <span>Connect Wallet</span>
                        )}
                    </Button>
                </div>
            </Menu>
        </>
    )
}

export default Navbar
