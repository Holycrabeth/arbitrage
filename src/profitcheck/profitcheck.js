const { ethers } = require("hardhat")

async function main() {
    // Define contract addresses and ABIs
    const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    const sushiswapRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
    const uniPoolAddress = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852"
    const sushiPoolAddress = "0x06da0fd433C1A5d7a4faa01111c044910A184553"
    const routerABI = [
        "function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut)",
    ]
    const poolABI = [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    ]

    // Connect to contracts
    const uniRouter = new ethers.Contract(
        uniswapRouterAddress,
        routerABI,
        ethers.provider,
    )
    const sushiRouter = new ethers.Contract(
        sushiswapRouterAddress,
        routerABI,
        ethers.provider,
    )
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

    // Scenario 1: Sell 1 ETH on Uniswap and buy back on Sushiswap
    const amountIn = ethers.utils.parseEther("0.01") // 1 ETH
    const uAmountOut = await uniRouter.getAmountOut(
        amountIn,
        ureserve0,
        ureserve1,
    )
    const sAmountOut = await sushiRouter.getAmountOut(
        uAmountOut,
        sreserve1,
        sreserve0,
    )

    // Scenario 2: Sell 1 ETH on Sushiswap and buy back on Uniswap
    const sAmountOutFirst = await sushiRouter.getAmountOut(
        amountIn,
        sreserve0,
        sreserve1,
    )
    const uAmountOutSecond = await uniRouter.getAmountOut(
        sAmountOutFirst,
        ureserve1,
        ureserve0,
    )

    console.log(
        `Arbitrage Scenario 1: Start with 1 ETH, get ${ethers.utils.formatEther(
            sAmountOut,
        )} ETH back.`,
    )
    console.log(
        `Arbitrage Scenario 2: Start with 1 ETH, get ${ethers.utils.formatEther(
            uAmountOutSecond,
        )} ETH back.`,
    )

    if (sAmountOut.gt(amountIn)) {
        console.log(
            "Profitable Arbitrage Opportunity: Sell ETH on Uniswap and buy back on Sushiswap!",
        )
    }
    if (uAmountOutSecond.gt(amountIn)) {
        console.log(
            "Profitable Arbitrage Opportunity: Sell ETH on Sushiswap and buy back on Uniswap!",
        )
    }
    // Start with 1000 USDT
    const amountInUSDT = ethers.utils.parseUnits("500", 6) // Assuming USDT has 6 decimal places

    // Scenario 1: Sell 1000 USDT on Uniswap and buy back ETH
    const uAmountOutETH = await uniRouter.getAmountOut(
        amountInUSDT,
        ureserve1,
        ureserve0,
    )
    const sAmountOutUSDT = await sushiRouter.getAmountOut(
        uAmountOutETH,
        sreserve0,
        sreserve1,
    )

    // Scenario 2: Sell 1000 USDT on Sushiswap and buy back ETH
    const sAmountOutETH = await sushiRouter.getAmountOut(
        amountInUSDT,
        sreserve1,
        sreserve0,
    )
    const uAmountOutUSDT = await uniRouter.getAmountOut(
        sAmountOutETH,
        ureserve0,
        ureserve1,
    )

    console.log(
        `Arbitrage Scenario 1 (Uniswap): Start with 1000 USDT, get ${ethers.utils.parseUnits(
            sAmountOutUSDT.toString(),
            6,
        )} USDT back.`,
    )
    console.log(
        `Arbitrage Scenario 2 (Sushiswap): Start with 1000 USDT, get ${ethers.utils.parseUnits(
            uAmountOutUSDT.toString(),
            6,
        )} USDT back.`,
    )
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
