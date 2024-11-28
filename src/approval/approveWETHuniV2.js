// Import ethers from Hardhat package
const { ethers } = require("hardhat")

async function main() {
    // Your deployed arbitrage contract address
    const arbitrageContractAddress =
        "0xd41b2809885cB3fEF509bb9Fbf0cf190f00167BF"

    // Uniswap V2 Router address (change this to the appropriate address for your network!)
    const uniswapRouterAddressRaw = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    const uniswapRouterAddress = ethers.utils.getAddress(
        uniswapRouterAddressRaw,
    )

    // WETH address for the network your contracts are deployed on
    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

    // The amount of WETH to approve for the Uniswap router
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

    // Call approveToken to set up the allowance for Uniswap V2 Router
    console.log(`Approving Uniswap V2 Router to access WETH...`)
    const tx = await arbitrageContract.approveToken(
        wethAddress,
        uniswapRouterAddress,
        amountToApprove,
    )
    console.log(`Transaction sent. Transaction Hash: ${tx.hash}`)

    // Wait for the transaction to be mined
    await tx.wait()
    console.log(
        "Uniswap V2 Router is now approved to spend WETH on behalf of the arbitrage contract.",
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
