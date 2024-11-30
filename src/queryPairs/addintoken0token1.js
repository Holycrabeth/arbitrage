const { ethers } = require("hardhat")
const fs = require("fs")
const csv = require("csv-parser")
const createCsvWriter = require("csv-writer").createObjectCsvWriter

async function main() {
    const provider = ethers.provider // Correctly access the provider

    // Pair ABI
    const pairABI = [
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
    ]

    // CSV Setup
    const csvWriter = createCsvWriter({
        path: "updated_uniswap_pairs.csv",
        header: [
            { id: "index", title: "INDEX" },
            { id: "address", title: "ADDRESS" },
            { id: "token0", title: "TOKEN0" },
            { id: "token1", title: "TOKEN1" },
        ],
    })

    const results = []
    fs.createReadStream("uniswap_pairs.csv")
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            const output = []
            for (const data of results) {
                const tokenData = await fetchTokenData(data, pairABI, provider) // Passing provider
                if (tokenData) {
                    console.log(
                        `Token addresses for pool ${data.ADDRESS}: Token0 = ${tokenData.token0}, Token1 = ${tokenData.token1}`,
                    )
                    output.push(tokenData)
                }
            }
            await csvWriter.writeRecords(output)
            console.log("CSV file has been updated with token addresses.")
        })
}

async function fetchTokenData(data, pairABI, provider) {
    try {
        const pairContract = new ethers.Contract(
            data.ADDRESS,
            pairABI,
            provider,
        )
        const token0Address = await pairContract.token0()
        const token1Address = await pairContract.token1()
        console.log(
            `Fetched Token0 (${token0Address}) and Token1 (${token1Address}) for pool address ${data.ADDRESS}`,
        )
        return {
            index: data.INDEX,
            address: data.ADDRESS,
            token0: token0Address,
            token1: token1Address,
        }
    } catch (error) {
        console.error(
            `Failed to fetch token data for address ${data.ADDRESS}: ${error}`,
        )
        return null
    }
}

main().catch((error) => {
    console.error("Error in main execution:", error)
    process.exit(1)
})
