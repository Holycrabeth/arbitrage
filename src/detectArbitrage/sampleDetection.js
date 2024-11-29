const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/abc');
const token0 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH
const token1 = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
const uniRouterAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
const sushiRouterAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
const PATH = [token0, token1];
const TX_FEE = 0.003;  // Approximate transaction fee as a percentage

const routerAbi = [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
];

const uniRouter = new ethers.Contract(uniRouterAddress, routerAbi, provider);
const sushiRouter = new ethers.Contract(sushiRouterAddress, routerAbi, provider);
const amountIn = ethers.utils.parseEther('1');

async function checkArbitrage() {
  const amountsOutUni = await uniRouter.getAmountsOut(amountIn, PATH);
  const amountsOutSushi = await sushiRouter.getAmountsOut(amountIn, PATH);

  const uniPrice = amountsOutUni[1];
  const sushiPrice = amountsOutSushi[1];

  // Effective price after considering transaction fees
  const effectiveUniPrice = uniPrice.add(uniPrice.mul(TX_FEE));
  const effectiveSushiPrice = sushiPrice.add(sushiPrice.mul(TX_FEE));

  // Calculate the spread between Uniswap and Sushiswap
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

checkArbitrage();
