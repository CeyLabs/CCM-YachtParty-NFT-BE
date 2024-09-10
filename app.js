require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { ethers } = require("ethers");
const axios = require("axios");
const app = express();
const PORT = 3002;

const contractABI = require("./contractABI.js");
// Define the contract address and network configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NETWORK = process.env.NETWORK || "testnet"; // Default to mainnet if not specified

// Define the network URLs for testnet and mainnet using Alchemy
const networkUrls = {
  mainnet: process.env.MAINNET_URL,
  testnet: process.env.TESTNET_URL, // Example for Rinkeby testnet
};

// Initialize the provider based on the network configuration
const provider = new ethers.JsonRpcProvider(networkUrls[NETWORK]);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// Listen for the TokenMinted event
contract.on(
  "TokenMinted",
  async (
    tokenId,
    recipient,
    isPhysicalToken,
    isWhitelisted,
    isDiscounted,
    publicMint,
    mintAsset,
  ) => {
    console.log(`Token Minted: ${tokenId}`);
    console.log(
      tokenId,
      recipient,
      isPhysicalToken,
      isWhitelisted,
      isDiscounted,
      publicMint,
      mintAsset,
    );

    // Prepare the data to be sent to ceylabs.io/ccmhyp
    const dataToSend = {
      tokenId: `${tokenId}`,
      recipient: recipient.toString(),
      isPhysicalToken,
      isWhitelisted,
      isDiscounted,
      publicMint,
      mintAsset: `${mintAsset}`,
    };

    console.log(dataToSend);

    const ceylabsResponse = await axios.post(
      "https://ceylabs.io/ccmhyp/index.php",
      dataToSend,
    );

    console.log(
      "Main parameters sent to ceylabs.io/ccmhyp:",
      ceylabsResponse.data,
    );

    // Generate metadata for the newly minted token
    const metadata = await generateNFTMetadata(
      tokenId,
      "SomeTicketType",
      recipient,
    ); // Adjust the ticket type as needed
    fs.writeFile(
      `./metadata/${tokenId}.json`,
      JSON.stringify(metadata),
      (err) => {
        if (err) {
          console.error(err);
          // Handle error
        } else {
          console.log(`Metadata created for token ${tokenId}`);
        }
      },
    );
  },
);

app.use(express.json());

app.post("/create-metadata", async (req, res) => {
  const { id, ticketType, userAddress } = req.body;

  if (!id || !ticketType || !userAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const metadata = await generateNFTMetadata(id, ticketType, userAddress);
    fs.writeFile(
      `./metadata/${id}.json`,
      JSON.stringify(metadata, null, 4),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error writing file" });
        }
        res
          .status(201)
          .json({ message: "Metadata created successfully", metadata });
      },
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating metadata" });
  }
});

app.get("/metadata/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(`./metadata/${id}.json`, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ message: "Metadata not found" });
    }
    res.status(200).json(JSON.parse(data));
  });
});

async function generateNFTMetadata(tokenId, isPhysicalToken, isDiscounted) {
  try {
    // Fetch the current block height from Mempool.space using Axios
    const response = await axios.get(
      "https://mempool.space/api/blocks/tip/height",
    );
    const blockHeight = response.data;

    const nft = {
      description: `Ceylon Crypto Meetup - Yacht Party 2024 #${tokenId}`,
      external_url: `https://ceylabs.io/`,
      image: `https://ceylabs.io/ccm/image/${tokenId}`,
      name: `Ticket #${tokenId}`,
      attributes: [
        { trait_type: "Event ID", value: "2" },
        { trait_type: "Event Type", value: "IRL" },
        { trait_type: "Location", value: "Mirissa, Sri Lanka" },
        {
          trait_type: "Participation",
          value: isPhysicalToken ? "In Person" : "Virtual",
        },
        { trait_type: "Ticket ID", value: `${tokenId}` },
        { trait_type: "CCM Count", value: isDiscounted ? "2" : "1" }, // Set CCM count based on discounted state
        {
          display_type: "number",
          trait_type: "Block Height",
          value: blockHeight,
        }, // Include the current block height
      ],
    };

    return nft;
  } catch (error) {
    console.error("Error fetching block height:", error);
    throw error; // Or handle the error as needed
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
