// Importing Hardhat's ethers
const { ethers } = require("hardhat");

async function main() {
    const provider = ethers.provider;  // Using Hardhat's default provider
    const signers = await ethers.getSigners();  // Get the list of accounts from Hardhat
    
    const token0 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH
    const token1 = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
    const uniRouterAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
    const sushiRouterAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
    const PATH = [token0, token1];
    const TX_FEE = 0.003;  // Transaction fee percentage

    const routerAbi = [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    ];

    const uniRouter = new ethers.Contract(uniRouterAddress, routerAbi, signers[0]);
    const sushiRouter = new ethers.Contract(sushiRouterAddress, routerAbi, signers[0]);
    const amountIn = ethers.utils.parseEther('1');

    const amountsOutUni = await uniRouter.getAmountsOut(amountIn, PATH);
    const amountsOutSushi = await sushiRouter.getAmountsOut(amountIn, PATH);

    const uniPrice = amountsOutUni[1];
    const sushiPrice = amountsOutSushi[1];

    const effectiveUniPrice = uniPrice.add(uniPrice.mul(TX_FEE));
    const effectiveSushiPrice = sushiPrice.add(sushiPrice.mul(TX_FEE));

    if (uniPrice.gt(sushiPrice)) {
        const spread = effectiveUniPrice.sub(effectiveSushiPrice);
        console.log('Uni to Sushi spread:', spread.toString());
        if (spread.gt(0)) {
            console.log('Sell on Uni, buy on Sushi');
        } else {
            console.log('No arbitrage opportunity');
        }
    } else if (sushiPrice.gt(uniPrice)) {
        const spread = effectiveSushiPrice.sub(effectiveUniPrice);
        console.log('Sushi to Uni spread:', spread.toString());
        if (spread.gt(0)) {
            console.log('Sell on Sushi, buy on Uni');
        } else {
            console.log('No arbitrage opportunity');
        }
    } else {
        console.log('No arbitrage opportunity');
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
