# Ceylon Crypto Meetup NFT Metadata Generator

This project is a simple Node.js application that generates metadata for Ceylon Crypto Meetup NFTs. The metadata includes details about the event, ticket type, and other relevant information. It also fetches the current block height from Mempool.space and includes it in the metadata.

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Contract Interaction](#contract-interaction)
5. [API Endpoints](#api-endpoints)
6. [License](#license)

## Requirements

- Node.js (version 14 or higher)
- An Ethereum network (mainnet or testnet)
- Alchemy API key (for connecting to the Ethereum network)
- Contract ABI (Application Binary Interface)

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/ceylon-crypto-meetup-nft-metadata-generator.git

Edit
Full Screen
Copy code

2. Navigate to the project directory:
   cd ceylon-crypto-meetup-nft-metadata-generator

Edit
Full Screen
Copy code

3. Install the dependencies:
   npm install

Edit
Full Screen
Copy code

4. Create a `.env` file in the project root directory and add the following variables:
   NETWORK=<your_network> ALCHEMY_API_KEY=<your_alchemy_api_key>

Edit
Full Screen
Copy code

Replace `<your_network>` with the desired Ethereum network (mainnet or testnet) and `<your_alchemy_api_key>` with your Alchemy API key.

## Usage

To start the server, run the following command:
npm start

Edit
Full Screen
Copy code

The server will start on `http://localhost:3002`.

## Contract Interaction

The application interacts with a smart contract deployed on the Ethereum network. The contract address and ABI are defined in the `generateNFTMetadata` function.

## API Endpoints

The application exposes two API endpoints:

1. `/create-metadata`: A POST endpoint for creating NFT metadata. It accepts a JSON payload with the following fields:

- `id`: The unique ticket ID
- `ticketType`: The type of ticket (e.g., 'General Admission', 'VIP')
- `userAddress`: The Ethereum address of the ticket holder

The endpoint returns a JSON response with the generated metadata.

2. `/metadata/:id`: A GET endpoint for fetching existing NFT metadata. It accepts a ticket ID as a URL parameter and returns the corresponding metadata as a JSON response.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
