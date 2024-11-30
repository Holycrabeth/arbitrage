const { ethers } = require("hardhat")

// Local getAmountOut function based on Uniswap V2 logic
function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn.mul(997)
    const numerator = amountInWithFee.mul(reserveOut)
    const denominator = reserveIn.mul(1000).add(amountInWithFee)
    return numerator.div(denominator)
}

async function main() {
    // Define contract addresses and ABIs
    const uniPoolAddress = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852"
    const sushiPoolAddress = "0x06da0fd433C1A5d7a4faa01111c044910A184553"
    const poolABI = [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    ]

    // Connect to contracts
    const uniPool = new ethers.Contract(
        uniPoolAddress,
        poolABI,
        ethers.provider,
    )
    const sushiPool = new ethers.Contract(
        sushiPoolAddress,
        poolABI,
        ethers.provider,
    )

    // Fetch reserves
    const [ureserve0, ureserve1] = await uniPool.getReserves()
    const [sreserve0, sreserve1] = await sushiPool.getReserves()

    // Start with 1 ETH
    const amountInETH = ethers.utils.parseEther("1")

    // Locally calculate amount out for ETH -> USDT (Uniswap) and USDT -> ETH (Sushiswap)
    const uAmountOutUSDT = getAmountOut(amountInETH, ureserve0, ureserve1)
    const sAmountOutETH = getAmountOut(uAmountOutUSDT, sreserve1, sreserve0)

    console.log(
        `Local Calculation - Arbitrage Scenario sell on uni buy on sushi: Start with 1 ETH, get ${ethers.utils.formatEther(
            sAmountOutETH,
        )} ETH back.`,
    )
    // Locally calculate amount out for ETH -> USDT (sushiswap) and USDT -> ETH (uniswap)
    const sAmountOutUSDT = getAmountOut(amountInETH, sreserve0, sreserve1)
    const uAmountOutETH = getAmountOut(sAmountOutUSDT, ureserve1, ureserve0)

    console.log(
        `Local Calculation - Arbitrage Scenario sell on sushi buy on uni: Start with 1 ETH, get ${ethers.utils.formatEther(
            uAmountOutETH,
        )} ETH back.`,
    )

    // Start with 1000 USDT
    const amountInUSDT = ethers.utils.parseUnits("1000", 6) // 1000 USDT

    // Locally calculate amount out for USDT -> ETH (Uniswap) and ETH -> USDT (Sushiswap)
    const uAmountOutETH2 = getAmountOut(amountInUSDT, ureserve1, ureserve0)
    const sAmountOutUSDT2 = getAmountOut(uAmountOutETH2, sreserve0, sreserve1)

    console.log(
        `Local Calculation - Arbitrage Scenario sell on uni but on sushi : Start with 1000 USDT, get ${ethers.utils.formatUnits(
            sAmountOutUSDT2.toString(),
            6,
        )} USDT back.`,
    )
    // Locally calculate amount out for USDT -> ETH (Uniswap) and ETH -> USDT (Sushiswap)
    const sAmountOutETH2 = getAmountOut(amountInUSDT, sreserve1, sreserve0)
    const uAmountOutUSDT2 = getAmountOut(sAmountOutETH2, ureserve0, ureserve1)

    console.log(
        `Local Calculation - Arbitrage Scenario sell on sushi buy on uni : Start with 1000 USDT, get ${ethers.utils.formatUnits(
            uAmountOutUSDT2.toString(),
            6,
        )} USDT back.`,
    )
}

main().catch((error) => {
    console.error("Error in main execution:", error)
    process.exit(1)
})
