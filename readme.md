# Decentralized Event Booking Application

## Dependencies

Install the following tools:

-   Node.js & NPM: https://nodejs.org
-   Hardhat: https://hardhat.org/hardhat-runner/docs/getting-started
-   Metamask: https://metamask.io/download/

Optionally, create an account on the following sites:

-   Alchemy (third party node provider): https://auth.alchemyapi.io/signup

## Step 1. Clone the project

`git clone https://github.com/rspadinger/EventChain.git`

## Step 2. Install dependencies

```
`$ cd project_folder` => (replace project_folder with the name of the folder where the downloaded project files are located: ?:\?\...\NFT-DAPP )
`$ npm install`
```

## Step 3. Start a local blockchain

Either start Ganache or the local blockchain provided by Hardhat.

To run a local Hardhat node, open a command window, select a directory where Hardhat is installed (cd myHardhatFolder...) and run the command:

`$ npx hardhat node`

## Step 4. Create a .env file

Every project requires a .env file with various environment variables (not all of them are required for every project).
The environment variables are the same for a React project and a project that contains a simple script file.
However, in a React project, the name of the environment variable requires the following prefix: REACT_APP (see below)

**Here are the required environment variables for a React app:**

REACT_APP_ALCHEMY_API_KEY=REPLACE_WITH_YOUR_API_KEY
REACT_APP_ALCHEMY_API_URL="https://eth-sepolia.g.alchemy.com/v2/..."
REACT_APP_PRIVATE_KEY="YOUR PRIVATE KEY FROM A METAMASK ACCOUNT"
REACT_APP_PRIVATE_KEY2="YOUR PRIVATE KEY FROM A SECOND METAMASK ACCOUNT"
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_CONTRACT_ADDRESS = ADDRESS_OF_CONTRACT_DEPLOYED_TO_SEPOLIA
REACT_APP_CONTRACT_ADDRESS_LOCAL = ADDRESS_OF_CONTRACT_DEPLOYED_TO_HARDHAT_OR_GANACHE

## Step 5. Deploy the Smart Contract

The deployment script is located at: scripts/deploy.js

-   To deploy the SC to a local blockchain, open a command window and type: `$npx hardhat run scripts/deploy.js`
-   To deploy the SC to a remote blockchain (for example: sepolia), open a command window and type: npx hardhat run `$scripts/deploy.js --network sepolia`

## Step 6. Run the Script or Application

To run the React web application, open a command windom, navigate to the project folder and type:

`$ npm start`

The applicattion should open in your browser at: http://localhost:3000

To execute the script file, open a command windom, navigate to the project folder and type:

`$ npx hardhat run scripts/mint-nft.js`

## Step 7. Project Improvments

This project is a simple (and incomplete) POC and not at all production ready.

**Here is a list of some improvments:**

-   Add events to the smart contract for each user action
-   Curently, there are almost no tests in the /test folder => add tests for all smart contract features
-   The file pages/EventShow.js needs substantial re-work: Split up the page in varrious react components, simplify the state model, add event listeners for various smart contract events...

## Smart Contract on the Sepolia Test Network:

Here is the link to the smart contract on the Sepolia test network: [https://sepolia.etherscan.io/address/0x7a8F36e0F99AADA22d0769d8290338712d1E06ef#code](https://sepolia.etherscan.io/address/0x7a8F36e0F99AADA22d0769d8290338712d1E06ef#code)

## Visit the Live Version of the Application Hosted on Github

[EventChain Dapp](https://rspadinger.github.io/EventChain/)

## Using the Applivation

If you would like to create events or register for existing events, you need to install the MetaMask browser addon, connect to the Sepolia testnet and add some test Ether to your account. You can obtain free test Ether at [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

This is a simple DAPP (decentralized application) that provides basic event management capabilities on the Ethereum blockchain.

The DAPP allows event managers to create events on the ETH Blockchain. Other users(participants) can register for those events.

**Screenshot of the event list page - there are different types of events: Active, expired and canceled events:**

![Screenshot of EventList](https://rspadinger.github.io/EventChain/EventList.png)

**When the user clicks the "Details" button, a preview of the event details is displayed in a popup window:**

![Screenshot of Event Details](https://rspadinger.github.io/EventChain/EventDetail.png)

**When the user clicks the "Register" button, various actions are possible - depending if the user is the event owner or an event participant:**

![Screenshot of Event Actions](https://rspadinger.github.io/EventChain/EventActionOwner.png)

**Only event owners can:**

-   Modify or cancel their events
-   Request the current contract balance (amount in ETH transferred by registered participants)
-   Request a list of registered participants with their contact details
-   Retrieve event fees after a specific period (7 days) once the event is finished

**Event Participants can:**

-   Register for an event
-   Unregister for an event
-   Provide a bad rating for an event - if more than 50% of all event participants provide a bad rating within 7 days after the event has ended, those participate can issue a refund of the fees they already paid. The refund is issued whether the event manager agrees or not, because all funds are locked on the blockchain and are managed by the business rules that are defined in the smart contract.
-   Revoke a previously given bad rating.

**On the "Create Event" tab, a user can create a new event and he automatically becomes the owner / manager of that event:**

![Screenshot of Event Create](https://rspadinger.github.io/EventChain/EventCreate.png)
