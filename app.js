require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { ethers } = require('ethers');
const axios = require('axios');const app = express();
const PORT = 3002;

// Define the contract address and network configuration
const CONTRACT_ADDRESS = '0x576410Dc6EcB0Ab0546D58f5D450fA43825Fc1b2';
const NETWORK = process.env.NETWORK || 'testnet'; // Default to mainnet if not specified

// Define the network URLs for testnet and mainnet using Alchemy
const networkUrls = {
    mainnet: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_API_KEY',
    testnet: 'https://eth-sepolia.g.alchemy.com/v2/JMn6DW8NwXFnlHIdquy9AFzlq8PTB-Xn' // Example for Rinkeby testnet
};
console.log(ethers); // Should log the ethers object
console.log(ethers.providers); // Should log the providers object
console.log(networkUrls[NETWORK]); // Should log the network URL

// Initialize the provider based on the network configuration
const provider = new ethers.JsonRpcProvider(networkUrls[NETWORK]);

app.use(express.json());

app.post('/create-metadata', async (req, res) => {
    const { id, ticketType, userAddress } = req.body;

    if (!id || !ticketType || !userAddress) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const metadata = await generateNFTMetadata(id, ticketType, userAddress);
        fs.writeFile(`./metadata/${id}.json`, JSON.stringify(metadata), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error writing file' });
            }
            res.status(201).json({ message: 'Metadata created successfully', metadata });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating metadata' });
    }
});

app.get('/metadata/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(`./metadata/${id}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: 'Metadata not found' });
        }
        res.status(200).json(JSON.parse(data));
    });
});


async function generateNFTMetadata(id, ticketType, userAddress) {
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "isAddressWhitelisted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "isAddressDiscounted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    ; // Your contract ABI here
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    try {
        const isWhitelisted = await contract.isAddressWhitelisted(userAddress);
        const isDiscounted = await contract.isAddressDiscounted(userAddress);

        // Fetch the current block height from Mempool.space using Axios
        const response = await axios.get('https://mempool.space/api/blocks/tip/height');
        const blockHeight = response.data;

        const nft = {
            description: `Ceylon Crypto Meetup - Yacht Party 2024: where Sri Lanka's crypto community meets, innovates, and celebrates amidst the anticipation of the 2024 halving event`,
            external_url: `https://ceylabs.io/`,
            image: `https://api.pudgypenguins.io/lil/image/${id}`,
            name: `Ticket #${id}`,
            attributes: [
                { trait_type: 'Event ID', value: '2' },
                { trait_type: 'Event Type', value: 'IRL' },
                { trait_type: 'Location', value: 'Somewhere in the sea on a yacht' },
                { trait_type: 'Participation', value: 'In-Person' },
                { trait_type: 'Ticket ID', value: `${id}` },
                { trait_type: 'Ticket Type', value: `${ticketType}` },
                { trait_type: 'CCM Count', value: isDiscounted ? '2' : '1' }, // Set CCM count based on discounted state
                { trait_type: 'Block Height', value: blockHeight } // Include the current block height
            ]
        };

        return nft;
    } catch (error) {
        console.error("Error interacting with the contract or fetching block height:", error);
        throw error; // Or handle the error as needed
    }
}
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});