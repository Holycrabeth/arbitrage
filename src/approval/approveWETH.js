// Import ethers from Hardhat package
const { ethers } = require("hardhat")

async function main() {
    // WETH contract address (for example on Ethereum mainnet, replace with your network's WETH address)
    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

    // Your arbitrage contract address
    const arbitrageContractAddress =
        "0xd41b2809885cB3fEF509bb9Fbf0cf190f00167BF"

    // The amount of WETH to approve
    // `ethers.constants.MaxUint256` can be used to approve effectively an infinite amount,
    // allowing the arbitrage contract to operate without needing re-approval unless revoked
    const amountToApprove = ethers.constants.MaxUint256

    // The ABI for WETH's `approve` function
    const abi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
    ]

    // Create a signer instance from the first account
    const [signer] = await ethers.getSigners()

    // Create a new instance of the contract attached to the signer
    const wethContract = new ethers.Contract(wethAddress, abi, signer)

    // Call approve to set up the allowance
    const tx = await wethContract.approve(
        arbitrageContractAddress,
        amountToApprove,
    )
    console.log(`Approval transaction sent. Transaction Hash: ${tx.hash}`)

    // Wait for the transaction to be mined
    await tx.wait()
    console.log(
        "The arbitrage contract is now approved to spend WETH of the signer.",
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
