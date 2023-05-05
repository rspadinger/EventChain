let contractFactory, txn, txnReceipt

// Contract on Sepolia: 0x7a8F36e0F99AADA22d0769d8290338712d1E06ef

async function main() {
    const factory = await ethers.getContractFactory("EventFactory")
    const myContract = await factory.deploy()

    await myContract.deployed()

    console.log("Event Factory contract deployed to:", myContract.address)

    contractFactory = await ethers.getContractAt("EventFactory", myContract.address)

    //await createEvents()
}

async function createEvents() {
    //active event 1 year
    //console.log("eee:", contractFactory)
    txn = await contractFactory.createEvent(
        "Solidity Workshop",
        "Learn how to write Solidity smart contracts...",
        "Paris",
        ethers.utils.parseEther("0.1"),
        50,
        Date.now() + 1000 * 60 * 60 * 24 * 365
    )
    txnReceipt = await txn.wait()
    console.log("Event contract deployed to:", txnReceipt.events[0].args["eventAddress"])

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
    console.log("Event contract deployed to:", txnReceipt.events[0].args["eventAddress"])

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
    console.log("Event contract deployed to:", txnReceipt.events[0].args["eventAddress"])

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
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
