const { ethers } = require("ethers");

const PERSONNAL_RPC_URL = ""; //TODO
const PRIVATE_KEY_CONTRACT_OWNER = ""; //TODO
const CONTRACT_ADDRESS = ""; //TODO

// Define provider (replace with actual provider, e.g., Infura or Alchemy)
const provider = new ethers.providers.JsonRpcProvider(PERSONNAL_RPC_URL);

// Define wallet and connect it to provider
const wallet = new ethers.Wallet(PRIVATE_KEY_CONTRACT_OWNER, provider);

// Define contract ABI (Application Binary Interface)
const contractABI = [
    "function mintCar(string memory model, string memory color, uint16 yearOfMatriculation, uint256 originalValue) public",
];


// Connect to contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

async function mintCars() {
    const cars = [
        { model: "Tesla Model S", color: "Red", year: 2023, value: 68400 },
        { model: "BMW i4", color: "Blue", year: 2021, value: 57900 },
        { model: "Audi A4", color: "Black", year: 2020, value: 43200 },
        { model: "Mercedes C-Class", color: "White", year: 2022, value: 49600 },
    ];

    for (const car of cars) {
        const tx = await contract.mintCar(
            car.model,
            car.color,
            car.year,
            car.value
        );
        console.log(`Minting ${car.model}... Transaction Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`${car.model} minted successfully!`);
    }
}

mintCars().catch(console.error);
