import {createWalletClient, custom, parseEther, createPublicClient, http} from "https://esm.sh/viem";
import {sepolia} from "https://esm.sh/viem/chains";

//contract infos
const contractAddress = '0x895C676B80b03AA4D3f9d01fa11F16a024630b5b';
let contractABI = null; // ABI to be loaded asynchronously

//temporary
//writting manualy the numbers of cars currently created : 
let nbCars = 3;

//load ABI from JSON file
async function loadABI() {
    try {
        const response = await fetch('contractABI.json');
        contractABI = await response.json();
        console.log("ABI loaded successfully");
    } catch (error) {
        console.error("Error loading ABI:", error);
    }
}

// calling the loadABI function at the start of the script
await loadABI(); // use `await` here to be sure the ABI is loaded before contract interactions

//global variable for the wallet 
let walletClient = null; //object type viem WalletClient (constructor "createWalletClient")
let userAccount = null; //will the the main adress of a wallet

//public client creation for read-only (view or pure functions)
const publicClient = createPublicClient({
	chain: sepolia,
	transport: http()
})

// function to connect user wallet (using viem library)
async function connectWallet() {
    if (window.ethereum) {
        try {
            // creating object clientwallet connected to sepolia via metamask
            walletClient = createWalletClient({
                chain: sepolia,
                transport: custom(window.ethereum), //using metamask as transport
            });

            //getting account address
            const accounts = await walletClient.request({
                method: 'eth_requestAccounts',
            });

			userAccount = accounts[0]; // storing the main client address in userAccount variable

			alert("Wallet succesfully connected : " + accounts[0]);

			//printing wallet address on page
            const walletAddressElement = document.getElementById('walletAddress');
            walletAddressElement.textContent = `Wallet connected: ${accounts[0]}`;

        } catch (error) {
            console.error("Connexion error :", error);
            alert("Connexion error, check you are on the Sepolia network");
        }
    } else {
        alert("Please install a webbroser waller to use the Dapp");
    }
}

// function to add a new car
async function submitCarForm(event) {
    event.preventDefault(); //prevent page refreshing

	if (!walletClient) {
        alert("Please connect your wallet first!");
        return;
    }

	try {
		//gathering form filling variables
		const model = document.getElementById('model').value;
		const color = document.getElementById('color').value;
		const yearOfMatriculation = parseInt(document.getElementById('year').value);
		const originalValue = parseFloat(document.getElementById('value').value);

        // parseEther take the decimal ETH value from the form and convert it into the wei value
        const valueInWei = parseEther(originalValue.toString());

        // args prep before calling fct createCar from SC
        const args = [model, color, yearOfMatriculation, valueInWei];

        // sending transaction by calling fct createCar from SC
        const txHash = await walletClient.writeContract({
            address: contractAddress,
            abi: contractABI,
            functionName: "createCar",
            args,
			account: userAccount, //will only work if the owner wallet is connected as createCar is onlyOwner
        });

        alert(`Transaction sent! Hash: ${txHash}`);
    } catch (error) {
        console.error("Error adding car:", error);
        alert("Failed to add car. Please try again.");
    }
}

/* function to load the car list
ATTENTION : elle ne fonctionne qu'avec des id consécutif
TODO : 
- prendre en compte la suppression des véhicules (utiliser une fonciton du SC qui retourne la liste des véhicules)
- nombre de véhicule défini statiquement pour le moment (ajouter une fonciton dans le smart contract ? (juste en retournant le comtpeur local au smart contract))
*/
async function loadCars() {
    if (!walletClient) {
        alert("Please connect your wallet first!");
        return;
    }

    try {
        let carID = 1; //first car has id : 1 and after we increment
        let carDetails;
        const carListElement = document.getElementById('carList');
        carListElement.innerHTML = ""; // reinitialize car list

        // loading cars with consecutive ids from 1 to nbCars
        while (carID <= nbCars) {
            try {
                // calling the getCarsDetails from SC to get each car details
                carDetails = await publicClient.readContract({ //using the publicClient because its a view fct
                    address: contractAddress,
                    abi: contractABI,
                    functionName: "getCarDetails",
                    args: [carID],
                });

                // HTML element creating and adding to the printing list
                const carItem = document.createElement("div");
                carItem.innerHTML = `
                    <p><strong>Car ID:</strong> ${carID}</p>
                    <p><strong>Model:</strong> ${carDetails.model}</p>
                    <p><strong>Color:</strong> ${carDetails.color}</p>
                    <p><strong>Year of Matriculation:</strong> ${carDetails.yearOfMatriculation}</p>
                    <p><strong>Original Value:</strong> ${parseInt(carDetails.originalValue) / 1e18} ETH (ou ${parseInt(carDetails.originalValue)} en wei (value * 10e-18ETH)</p>
                    <p><strong>Mileage:</strong> ${carDetails.mileage}</p>
                    <hr>
                `;
                carListElement.appendChild(carItem);
                carID++;

            } catch (error) {
				console.error("Error try catch loading cars:", error);
                break;
            }
        }
    } catch (error) {
        console.error("Error loading cars:", error);
        alert("Failed to load cars. Please try again.");
    }
}

//function to initiate a new lease demand
//TODO : ajouter une vérificaition pour savoir si la voiture est déjà louée ?? ou alors ne plus la faire apparaitre dans la liste ? 
//TODO : modifier la fonciton du SC initiateLease pour enlever l'argument nécessitant la owner address ? 
async function submitLeaseForm(event) {
    event.preventDefault(); //prevent the browser from refreshing the page

	//gathering form filling variables
    const carId = document.getElementById('carId').value;
    const driverExperience = document.getElementById('driverExperience').value;
    const mileageCap = document.getElementById('mileageCap').value;
    const contractDuration = document.getElementById('contractDuration').value;

    try {
		//getting the car details from the asked car (using publicClient because it's a view fct)
        const carDetails = await publicClient.readContract({
            client: walletClient,
            address: contractAddress,
            abi: contractABI,
            functionName: "getCarDetails",
            args: [carId],
        });

		//calling the calculateMonthlyQuota from the SC using publicClient cause it's a pure fct
        const monthlyPayment = await publicClient.readContract({
            client: walletClient,
            address: contractAddress,
            abi: contractABI,
            functionName: "calculateMonthlyQuota",
            args: [
                carDetails.originalValue,
                driverExperience,
                mileageCap,
                contractDuration,
            ],
        });

		//calculate the payments to made
        const downPayment = BigInt(3) * monthlyPayment;
        const totalPayment = monthlyPayment + downPayment;
		console.log('downPayment', downPayment);
		console.log('totalPayment', totalPayment);

		//calling the initiateLease from SC identified as the walletClient 
        await walletClient.writeContract({
            client: walletClient,
            address: contractAddress,
            abi: contractABI,
            functionName: "initiateLease",
            args: [
                carId,
                driverExperience,
                mileageCap,
                contractDuration,
                "0xb6cC46F765079B2e0Ae2CB66f6cdE62B3d0A309c" //contract owner address
            ],
            account: userAccount,
            value: totalPayment, // transaction montant
        });

        alert(`Lease initiated! Car ID: ${carId}`);
    } catch (error) {
        console.error("Error initiating lease:", error);
        alert("Failed to initiate lease. Please try again.");
    }
}

// function to confirmLease
async function submitConfirmLeaseForm(event) {
    event.preventDefault(); //prevent the browser from refreshing the page

	//gathering variable for filled form
    const carId = document.getElementById('confirmCarId').value;

    try {
        // confirmLease from SC function call (identified as walletClient because you need to be identified as the owner)
        await walletClient.writeContract({
            client: walletClient,
            address: contractAddress,
            abi: contractABI,
            functionName: "confirmLease",
            args: [carId],
            account: userAccount, // need to be BilBoyd wallet and main address to confirm rental (onlyOwner fct)
        });

        alert(`Lease confirmed for Car ID: ${carId}`);
    } catch (error) {
        console.error("Error confirming lease:", error);
        alert("Failed to confirm lease. Please try again.");
    }
}

//printing car owners and status
async function loadCarsWithOwners() {
    if (!walletClient) {
        alert("Please connect your wallet first!");
        return;
    }

    try {
        let carID = 1;
        const carListElement = document.getElementById('carOwners');
        carListElement.innerHTML = ""; // réinitialise la liste des voitures

        // loop for checking all the cars from the Bilboyd company
        while (carID <= nbCars) {
            try {
                // calling ownerOf herited from ERC721 from our SC to know the NFT owner
                const owner = await publicClient.readContract({ //using publicClient because ownerOf is a view fct
                    address: contractAddress,
                    abi: contractABI,
                    functionName: "ownerOf",
                    args: [carID],
                });

                // HTML element creation to print the list of cars and there owners
                const carItem = document.createElement("div");
                carItem.innerHTML = `
                    <p><strong>Car ID:</strong> ${carID}</p>
                    <p><strong>Owner Address:</strong> ${owner}</p>
                    <hr>
                `;
                carListElement.appendChild(carItem);
                carID++;

            } catch (error) {
                console.error(`Error loading car with ID ${carID}:`, error);
                break;
            }
        }
    } catch (error) {
        console.error("Error loading cars with owners:", error);
        alert("Failed to load cars with owners. Please try again.");
    }
}


// exporting functions names to be globally visibles (permit calls from the HTML files)
window.connectWallet = connectWallet;
window.submitCarForm = submitCarForm;
window.loadCars = loadCars;
window.submitLeaseForm = submitLeaseForm;
window.submitConfirmLeaseForm = submitConfirmLeaseForm;
window.loadCarsWithOwners = loadCarsWithOwners;
