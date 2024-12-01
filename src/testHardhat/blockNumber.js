// Import the ethers library from Hardhat's environment
const { ethers } = require("hardhat");

async function main() {
  // Fetch the current block number using ethers.js provided by Hardhat
  const blockNumber = await ethers.provider.getBlockNumber();
  
  // Log the current block number to the console
  console.log("Current Block Number:", blockNumber);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
