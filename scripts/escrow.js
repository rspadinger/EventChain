const { REACT_APP_PRIVATE_KEY, REACT_APP_CONTRFACTORY_ADDRESS } = process.env

let provider, depositor, arbiter, beneficiary, txn, txnReceipt

async function main() {
    provider = ethers.provider
    contract = await ethers.getContractAt("EscrowFactory", REACT_APP_CONTRFACTORY_ADDRESS)
    ;[depositor, arbiter, beneficiary] = await ethers.getSigners()

    // create new escrow
    txn = await contract.createEscrow(depositor.address, arbiter.address, beneficiary.address, {
        value: ethers.utils.parseEther("5"),
    })
    txnReceipt = await txn.wait()

    let escrowAddr = await contract.getDeployedEscrows()
    let contrAddr

    for (const addr of escrowAddr) {
        contrAddr = addr
        console.log("*********************************")
        console.log("Deployed escrow address: ", addr)
        console.log("---------------------------------")
        let escrow = await contract.escrowContracts(escrowAddr[0])
        console.log("Depositor addreses: ", escrow.depositor)
        console.log("Arbiter addreses: ", escrow.arbiter)
        console.log("Beneficiary addreses: ", escrow.beneficiary)
        console.log("Amount: ", ethers.utils.formatEther(escrow.amount))
        console.log("Is approved: ", escrow.isApproved)
        console.log(" ")
    }

    let contractEscrow = await ethers.getContractAt("Escrow", contrAddr)
    let depos = await contractEscrow.depositor()
    console.log("Deposit: ", depos)

    // await contractEscrow.connect(arbiter).approve()
    // let appr = await contractEscrow.isApproved()
    // console.log("Approved: ", appr)
}

main()
