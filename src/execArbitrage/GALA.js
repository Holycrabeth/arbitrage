// Import ethers from Hardhat package
const { ethers } = require("hardhat")

async function main() {
    // Arbitrage contract address
    const arbitrageContractAddress =
        "0xd41b2809885cB3fEF509bb9Fbf0cf190f00167BF"

    // SushiSwap Router address (change as per your network)
    const sushiswapRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"

    // GALA token address
    const galaTokenAddress = "0x15D4c048F83bd7e37d49eA4C83a07267Ec4203dA"

    // The amount of GALA tokens to approve for the SushiSwap router
    const amountToApprove = ethers.constants.MaxUint256

    // ABI for the arbitrage contract's approveToken function
    const arbitrageContractAbi = [
        "function approveToken(address token, address spender, uint256 amount) external",
    ]

    // Create a signer instance from the first account
    const [signer] = await ethers.getSigners()

    // Create a new instance of the contract attached to the signer
    const arbitrageContract = new ethers.Contract(
        arbitrageContractAddress,
        arbitrageContractAbi,
        signer,
    )

    // Call approveToken to set up the allowance for SushiSwap Router
    console.log(`Approving SushiSwap Router to access GALA tokens...`)
    const tx = await arbitrageContract.approveToken(
        galaTokenAddress,
        sushiswapRouterAddress,
        amountToApprove,
    )
    console.log(`Transaction sent. Transaction Hash: ${tx.hash}`)

    // Wait for the transaction to be mined
    await tx.wait()
    console.log(
        "SushiSwap Router is now approved to spend GALA on behalf of the arbitrage contract.",
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
