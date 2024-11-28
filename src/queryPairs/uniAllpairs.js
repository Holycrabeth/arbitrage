// Import ethers from Hardhat package
const { ethers } = require("hardhat")

async function main() {
    // Connect to the network (Change the network in hardhat.config.js if necessary)
    const [deployer] = await ethers.getSigners()

    // Log the deployer address
    console.log("Using account:", deployer.address)

    // Uniswap V2 Factory Contract Address and ABI
    const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    const FactoryABI = [
        "function allPairsLength() view returns (uint)",
        "function allPairs(uint256) view returns (address)",
    ]

    // Create a contract instance
    const factoryContract = new ethers.Contract(
        factoryAddress,
        FactoryABI,
        deployer,
    )

    // Fetch the total number of pairs
    const totalPairs = await factoryContract.allPairsLength()
    console.log(`Total pairs: ${totalPairs}`)

    // Loop through each index and fetch the pair address
    for (let i = 0; i < totalPairs; i++) {
        const pairAddress = await factoryContract.allPairs(i)
        console.log(`Pair index ${i}: Address - ${pairAddress}`)
    }
}

// Call the main function and catch any errors
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
