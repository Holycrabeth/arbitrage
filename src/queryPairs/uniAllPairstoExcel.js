const { ethers } = require("hardhat");
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvAppend = require('csv-writer').createObjectCsvWriter;

async function main() {
    const factoryAddress = '0xC0AeE478e3658e2610c5F7A4A2E1777cE9e4f2Ac';
    const FactoryABI = [
        "function allPairsLength() view returns (uint)",
        "function allPairs(uint256) view returns (address)"
    ];
    const factoryContract = new ethers.Contract(factoryAddress, FactoryABI, ethers.provider);

    // Fetch the total number of pairs
    const totalPairs = await factoryContract.allPairsLength();

    // Check for the existing file and determine the last index written
    const existingData = fs.readFileSync('uniswap_pairs.csv', 'utf8');
    const rows = existingData.split('\n').length - 1; // Subtract one for the header
    let startIndex = Math.max(2601, rows); // Continue from 2601 or where it last stopped

    // Setting up CSV writer to append data
    const csvAppender = csvAppend({
        path: 'uniswap_pairs.csv',
        header: [
            {id: 'index', title: 'INDEX'},
            {id: 'address', title: 'ADDRESS'}
        ],
        append: true  // This ensures we append to the file rather than overwrite it
    });

    const records = [];

    for (let i = startIndex; i < totalPairs; i++) {
        try {
            const pairAddress = await factoryContract.allPairs(i).call();
            records.push({ index: i, address: pairAddress });
            if (records.length % 1000 === 0 || i === totalPairs - 1) {
                await csvAppender.writeRecords(records);
                records.length = 0; // Clear array after writing
                console.log(`Written up to index ${i}`);
            }
        } catch (error) {
            console.error(`Error at index ${i}:`, error);
            break;  // Stop on error or consider handling it differently
        }
    }

    console.log("All pair addresses have been written to CSV.");
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
