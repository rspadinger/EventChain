import { useEffect, useState } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getCurrentWalletConnected } from "./bcTools/bcInteraction.js"

import Home from "./pages/Home"
import EventList from "./pages/EventList"
import EventCreate from "./pages/EventCreate"
import EventShow from "./pages/EventShow"
import NotFound from "./pages/NotFound"
import SharedLayout from "./pages/SharedLayout"

import "./App.css"

function App() {
    const [walletAddress, setWallet] = useState("")
    const [eventContr, setEventContr] = useState()

    useEffect(() => {
        async function init() {
            const { address, status } = await getCurrentWalletConnected()
            setWallet(address)
            addWalletListener()
            if (status) toast.info(status)
            if (address) {
                if (window.ethereum.networkVersion != 11155111) {
                    toast.info(`🦊 Please select the Sepolia test network to use this Dapp!`)
                }
            }
        }
        init()
    }, [])

    const addWalletListener = () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0])
                    toast.info(`Your account address changed to: ${accounts[0]}`)
                } else {
                    setWallet("")
                    toast.info("🦊 Connect to Metamask using the top right button.")
                }
            })

            window.ethereum.on("chainChanged", (networkId) => {
                if (networkId != 11155111) {
                    toast.info(`🦊 Please select the Sepolia test network to use this Dapp!`)
                }
            })
        } else {
            let stat = (
                <p>
                    {" "}
                    🦊{" Please install "}
                    <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
                        Metamask
                    </a>
                </p>
            )
            toast.info(stat)
        }
    }

    return (
        <HashRouter>
            <ToastContainer position="top-center" />
            <Routes>
                <Route
                    path="/"
                    element={<SharedLayout setWallet={setWallet} walletAddress={walletAddress} />}
                >
                    <Route index element={<Home />} />
                    <Route path="eventlist" element={<EventList />} />
                    <Route path="eventcreate" element={<EventCreate />} />
                    <Route path="eventshow/:eventAddress" element={<EventShow />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App
