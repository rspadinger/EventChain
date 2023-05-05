const {
    REACT_APP_PRIVATE_KEY,
    REACT_APP_PRIVATE_KEY2,
    REACT_APP_CONTRACT_ADDRESS,
    REACT_APP_CONTRACT_ADDRESS_LOCAL,
} = process.env

let contractFactory, signer, signer2, txn, txnReceipt

async function main() {
    const provider = ethers.provider
    const currentNetwork = await provider.getNetwork()
    let contractFactoryAddress = REACT_APP_CONTRACT_ADDRESS_LOCAL

    if (currentNetwork.chainId.toString().includes(1337)) {
        console.log("We are using a local network!")
        ;[signer, signer2] = await ethers.getSigners()
    } else {
        console.log("We are using a remote network!")
        contractFactoryAddress = REACT_APP_CONTRACT_ADDRESS
        signer = new ethers.Wallet(REACT_APP_PRIVATE_KEY, provider)
        signer2 = new ethers.Wallet(REACT_APP_PRIVATE_KEY2, provider)
    }

    contractFactory = await ethers.getContractAt("EventFactory", contractFactoryAddress)

    createEvents()

    // listen to events
    // filter = contractFactory.filters.EventCreated(null, null, null)
    // contractFactory.on(filter, (creator, eventAddress, title, event) => {
    //     console.log(
    //         "Emitted event arguments (Contract): ",
    //         creator,
    //         eventAddress,
    //         title,
    //         " --- Access via event.args[i]: ",
    //         event.args[1]
    //     )
    // })
}

async function createEvents() {
    // //active event now => test user rating
    // txn = await contractFactory.createEvent(
    //     "Test Rating",
    //     "Learn how to write Solidity smart contracts...",
    //     "Paris",
    //     ethers.utils.parseEther("0.1"),
    //     50,
    //     Date.now() + 1000 * 60 * 2
    // )
    // txnReceipt = await txn.wait()

    // //register user
    // let eventContractAddress = txnReceipt.events[0].args["eventAddress"]
    // let eventContract = await ethers.getContractAt("Evt", eventContractAddress)
    // txn = await eventContract.connect(signer2).registerForEvent("RS", "rs@gmail.com", "1111111", {
    //     value: ethers.utils.parseEther("0.1"),
    // })
    // txnReceipt = await txn.wait()

    // //active event 1 year
    txn = await contractFactory.createEvent(
        "Solidity Workshop",
        "Learn how to write Solidity smart contracts...",
        "Paris",
        ethers.utils.parseEther("0.1"),
        50,
        Date.now() + 1000 * 60 * 60 * 24 * 365
    )
    txnReceipt = await txn.wait()

    //active event 1 year
    txn = await contractFactory.createEvent(
        "Blockchain Seminar",
        "The seminar id focusing on the latest research and ideas in the blockchain space.",
        "London",
        ethers.utils.parseEther("0.2"),
        15,
        Date.now() + 1000 * 60 * 60 * 24 * 365
    )
    txnReceipt = await txn.wait()

    //expired event
    txn = await contractFactory.createEvent(
        "Ethereum Conference",
        "This is the largest annual European Ethereum event focused on technology and community. Four intense days of conferences, networking and learning.",
        "Vienna",
        ethers.utils.parseEther("0.01"),
        500,
        Date.now() - 1000 * 60 * 60 * 24
    )
    txnReceipt = await txn.wait()

    // let eventContractAddress = txnReceipt.events[0].args["eventAddress"]
    // console.log("Event contract address: ", eventContractAddress)

    //let eventContract = await ethers.getContractAt("Evt", eventContractAddress)

    // display the event title
    //console.log("Event Title: ", await eventContract.title())

    // get deployed events
    //const eventAddresses = await contractFactory.getDeployedEvents()
    //console.log(eventAddresses)
}

main()
