import { ethers } from "ethers"
import moment from "moment"
import eventJson from "../Evt.json"
import eventFactoryJson from "../EventFactory.json"

//TODO modify contract address
//const { REACT_APP_CONTRACT_ADDRESS } = process.env
//Local: 0x5FbDB2315678afecb367f032d93F642f64180aa3
//Sepolia: 0x7a8F36e0F99AADA22d0769d8290338712d1E06ef
const REACT_APP_CONTRACT_ADDRESS = "0x7a8F36e0F99AADA22d0769d8290338712d1E06ef"

let provider, signer, contrFactory, contrFactoryAddress, selectedAddress

export const getContractFactory = async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = await provider.getSigner()
        contrFactoryAddress = REACT_APP_CONTRACT_ADDRESS
        contrFactory = new ethers.Contract(contrFactoryAddress, eventFactoryJson.abi, signer)
        return contrFactory
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            })
            if (addressArray.length > 0) {
                selectedAddress = addressArray[0]
                return {
                    address: selectedAddress,
                }
            } else {
                return {
                    address: "",
                    status: "Connect to your web wallet using the top right button.",
                }
            }
        } catch (err) {
            return {
                address: "",
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return {
            address: "",
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            if (addressArray.length > 0) {
                selectedAddress = addressArray[0]
                return {
                    address: selectedAddress,
                    status: "",
                }
            } else {
                return {
                    address: "",
                    status: "Connect to your web wallet using the top right button.",
                }
            }
        } catch (err) {
            return {
                address: "",
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return {
            address: "",
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const getEventAddresses = async () => {
    if (window.ethereum) {
        try {
            if (!contrFactory) await getContractFactory()
            return await contrFactory.getDeployedEvents()
        } catch (err) {
            return []
        }
    } else {
        return []
    }
}

export const getEventContract = async (eventAddress) => {
    if (window.ethereum) {
        try {
            if (!contrFactory) await getContractFactory()
            let eventContr = new ethers.Contract(eventAddress, eventJson.abi, signer)

            return {
                eventContr,
            }
        } catch (err) {
            return {
                eventContr: null,
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return { eventContr: null, status: "Please install a web wallet in your browser." }
    }
}

export const getEventDetails = async (eventAddress) => {
    if (window.ethereum) {
        try {
            let eventContracts = []
            if (!contrFactory) await getContractFactory()
            if (eventAddress) {
                eventContracts[0] = new ethers.Contract(eventAddress, eventJson.abi, signer)
            } else {
                const eventAddresses = await getEventAddresses()
                eventContracts = await Promise.all(
                    Array(parseInt(eventAddresses.length))
                        .fill()
                        .map((_, index) => {
                            return new ethers.Contract(eventAddresses[index], eventJson.abi, signer)
                        })
                )
            }

            const eventDetails = await Promise.all(
                eventContracts.map((contr) => {
                    return contr.getEventDetails()
                })
            )

            return {
                eventDetails,
                //status: "",
            }
        } catch (err) {
            //console.log("Err:", err)
            return {
                eventDetails: [],
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return { eventDetails: [], status: "Please install a web wallet in your browser." }
    }
}

export const createEvent = async (
    title,
    description,
    location,
    fee = 0,
    maxParticip = 10,
    dateTimeUnix
) => {
    if (
        title.trim() === "" ||
        description.trim() === "" ||
        location.trim() === "" ||
        dateTimeUnix < moment(new Date()).unix()
    ) {
        return {
            error: "Please provide all required details!",
        }
    }

    if (window.ethereum) {
        if (!contrFactory) await getContractFactory()
        try {
            let txn = await contrFactory.createEvent(
                title,
                description,
                location,
                fee,
                maxParticip,
                dateTimeUnix
            )
            await txn.wait()

            return {
                status: (
                    <div>
                        <span>A new event has been created, you can check the transaction on </span>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={`https://sepolia.etherscan.io/tx/${txn.hash}`}
                        >
                            Etherscan
                        </a>
                    </div>
                ),
            }
        } catch (error) {
            return {
                error: "Something went wrong - you may not be allowed to perform this action!",
            }
        }
    } else {
        return {
            error: "Please install a web wallet in your browser.",
        }
    }
}
