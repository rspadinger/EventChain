const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

//TODO Add tests for all features provided by the event contract

describe("EventChain contract", function () {
    async function deployContractFixture() {
        const [deployer, user] = await ethers.getSigners()

        const EventFactory = await ethers.getContractFactory("EventFactory", deployer)
        const EventFactoryContract = await EventFactory.deploy()

        return { EventFactoryContract, deployer, user }
    }

    describe("Create Events", function () {
        it("Should create a new Event contract", async function () {
            const { EventFactoryContract, deployer } = await loadFixture(deployContractFixture)

            await EventFactoryContract.createEvent(
                "Test Event",
                "Learn how to write Solidity smart contracts...",
                "Paris",
                ethers.utils.parseEther("0.1"),
                50,
                Date.now() + 1000 * 60 * 2
            )

            const deployedEvents = await EventFactoryContract.getDeployedEvents()
            expect(deployedEvents.length).to.eq(1)
        })

        it("Should emit the EventCreated event on Event creation", async function () {
            const { EventFactoryContract, deployer } = await loadFixture(deployContractFixture)

            await expect(
                EventFactoryContract.createEvent(
                    "Test Event",
                    "Learn how to write Solidity smart contracts...",
                    "Paris",
                    ethers.utils.parseEther("0.1"),
                    50,
                    Date.now() + 1000 * 60 * 2
                )
            )
                .to.emit(EventFactoryContract, "EventCreated")
                .withArgs(deployer.address, anyValue, "Test Event")
        })
    })
})
