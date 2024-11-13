# Web interface for Assignment 3 TTM4195 (Bilboyd Car Rental Web Interface)

## Project Overview

This is a decentralized web application built for managing car rentals using Ethereum smart contracts. The application interacts with a deployed smart contract on the blockchain, where each car is represented by an NFT. Users can lease cars, and the administrator (car owner) can manage the inventory. The site uses Vite as a development environment and the ethers and viem libraries to connect to the Ethereum testnet blockchain.

## Project Structure

- `index.html` - Client interface where users can view available cars and initiate leases.
- `admin.html` - Administrator panel for the car owner to create new cars and manage the car inventory.
- `script.js` - Core JavaScript file containing functions for interacting with the Ethereum smart contract.
- `styles.css` - Stylesheet for the layout and styling of both the client and admin interfaces.
- `contractABI.json`- Storing the contract ABI to be imported into script.js

## Pages and Functionality

### Customer Page (index.html)

Upon loading the main page, clients can:

- Connect Wallet: Connect their Ethereum wallet to interact with the blockchain.
- Load Car List: Display a list of cars for rental, retrieved from the blockchain.
- Lease a Car: Fill out a form to lease a selected car, providing details such as: Car ID, Driver’s experience in years, Mileage cap for the rental, Contract duration in months

Once submitted, the lease form initiates a transaction to the smart contract, enabling users to lease the car by paying a down payment and the first month’s rental fee.

### Admin Page (admin.html)

Accessible through a link in the header of the main page, the admin page allows the car owner to:

- Connect Wallet: Connect to the blockchain as the owner to access administrative functionalities.
- Create a New Car: Add new cars to the inventory by filling out a form specifying: Car model, Color, Year of matriculation, Original value
- Load Car List: Display a list of cars for rental, retrieved from the blockchain.
- Accept Lease: Approve pending lease requests, transferring ownership of the car NFT to the lessee and releasing the funds to the administrator’s wallet.
- Load Owners : Display the list of cars with their owner address

## Development Setup

Install Dependencies: Ensure vite, ethers, and viem are installed by running:

`npm install vite ethers viem`

Run Local Server: Use Vite’s development server for a local preview:

`npx vite`
