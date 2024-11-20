
# TTM4195 - Car Leasing Smart Contract

This repository contains a Solidity-based smart contract for a car leasing system, developed as part of the TTM4195 course assignment. The project demonstrates the use of NFTs (Non-Fungible Tokens) and smart contract functionalities to simulate a secure and efficient car leasing system.

## Project Overview

The smart contract introduces a car leasing platform where vehicles are represented as NFTs, enabling transparent and decentralized leasing agreements. The system ensures secure transactions between customers and the dealership, while also handling scenarios like lease termination and extensions.

### Key Features

1. **NFT Representation of Cars**
   - Each car available for lease is represented as an NFT containing:
     - Model
     - Color
     - Year of matriculation
     - Original value

2. **Dynamic Lease Calculation**
   - The monthly lease amount is calculated based on:
     - Original car value
     - Current car mileage
     - Driver’s experience (years with a driving license)
     - Mileage cap
     - Contract duration

3. **Fair Exchange Mechanism**
   - Secure down payment transfer and confirmation through smart contract locking/unlocking mechanisms.

4. **Insolvency Protection**
   - Functionalities to safeguard against non-payment by lessees.

5. **Flexible Lease Termination**
   - Lessees can:
     - Terminate the lease
     - Extend the lease for another year
     - Sign a new lease for a different vehicle

## Tools and Prerequisites

- **Ethereum Wallet:** Use [MetaMask](https://metamask.io/) for managing testnet transactions (Goerli/Sepolia).
- **Remix IDE:** Online platform for testing, debugging, and deploying smart contracts. Access it [here](https://remix.ethereum.org/).

## Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/PPOINAS/TTM4195.git
   cd TTM4195
   ```

2. Open the `carForRent.sol` file in [Remix IDE](https://remix.ethereum.org/).

3. Deploy the smart contract on the testnet:
   - Choose the appropriate Solidity compiler version (v0.8.26 recommended).
   - Connect to your MetaMask wallet using the Remix interface.

4. Interact with the contract using Remix’s UI:
   - Mint NFTs for cars.
   - Calculate monthly lease amounts.
   - Simulate leasing agreements and termination scenarios.

## Assignment Context

This smart contract was developed for the **TTM4195 Smart Contracts in Solidity** course assignment, focusing on practical implementation of blockchain-based solutions. 

### Grading Criteria:
- **Code Quality (13 points):** Well-structured and commented Solidity code.
- **Presentation (7 points):** Explanation and live demonstration of the smart contract.
