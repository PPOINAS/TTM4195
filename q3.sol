// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


/** Documentation for the developers
 *
 * - 'onlyOwner' means that only the owner of the contrat can 
 *   call this function ;
 * - Storing the metadata on JSON outside the blockchain can drastically 
 *   reduce the gas used ;
 * - The current car lessee is represented by the current owner of the NFT ;
 */


contract carForRent is ERC721, Ownable {
    constructor(address initialOwner) ERC721("carForRent", "CAR") Ownable(initialOwner) {}

    using Counters for Counters.Counter;
    Counters.Counter private _carIDCounter;

    struct Car {
        string model;
        string color;
        uint16 yearOfMatriculation;
        uint256 originalValue;
        uint256 mileage; // (A4Q2)
    }

    // Mapping each carID to car struct containing all cars
    mapping(uint256 => Car) public _cars;

    /**
     * @dev Create a new car by minting an NFT
     * @notice Initially, no lessee is assigned. It is going to be the compagny.
     * @param model The model of the car
     * @param color The color of the car
     * @param yearOfMatriculation The year the car was manufactured
     * @param originalValue The original value of the car
     */
    function createCar(
        string memory model,
        string memory color,
        uint16 yearOfMatriculation,
        uint256 originalValue
    ) public onlyOwner returns (uint256) {
        // Get the ID of the new car
        _carIDCounter.increment();
        uint256 carID = _carIDCounter.current();
        // Mint the NFT representing the car
        _mint(msg.sender, carID); // With 'onlyOwner': 'msg.sender' can only be the compagny
        // Store car details in the mapping
        _cars[carID] = Car({
            color: color,
            model: model,
            yearOfMatriculation: yearOfMatriculation,
            originalValue: originalValue,
            mileage: 0 // Initial mileage is set to 0 
        });
        // Return the ID of the car (the NFT)
        return carID;
    }

    /**
    * @dev Remove a car by burning the NFT
    */
    function burn(uint256 carID) public onlyOwner {
        require(ownerOf(carID) == msg.sender, "ERROR: The car must not currently be rented, at the time of removal");
        //require(_exists(carID), "Car does not exist"); // TODO: régler le problème avec '_exists'
        delete _cars[carID];
        _burn(carID);
    }
    
    /**
     * @dev Retrieve details of a car by its carID.
     * @param carID The unique ID of the car
     * @return car The car struct containing all details
     */
    function getCarDetails(uint256 carID) public view returns (Car memory) {
        //require(_exists(carID), "Car does not exist"); // TODO: régler le problème avec '_exists'
        return _cars[carID];
    }

    /**
     * @dev Calculate the monthly quota for renting the car.
     * @param carID The unique ID of the car
     * @param driverExperience Years of possession of a driving license
     * @param mileageCap The mileage cap (fixed values)
     * @param contractDuration The duration of the contract (fixed values)
     * @return monthlyQuota The calculated monthly quota
     */
    function calculateMonthlyQuota(
        uint256 carID,
        uint256 driverExperience,
        uint256 mileageCap,
        uint256 contractDuration
    ) public view returns (uint256 monthlyQuota) {
        // Retrieve the car in the mapping
        Car memory car = getCarDetails(carID);
        // Useful constants for calculation
        uint256 monthlyBase = (car.originalValue * 4)/100; // Base cost: 4% of vehicle value per month
        // Apply discount based on driver experience
        // Each year of experience above 5 year provides a 0.5% discount, capped at 3%
        uint256 experienceDiscount = driverExperience >= 5 ? ((driverExperience - 5) * 5 / 1000) : 0;
        if (experienceDiscount > 3) experienceDiscount = 3; // Cap at 3%
        uint256 discount = (monthlyBase * experienceDiscount) / 100;
        // Adjust cost based on mileage cap
        // For example, if mileageCap is low, apply a small reduction, if high, increase
        uint256 mileageAdjustment;
        if (mileageCap <= 1000) {
            mileageAdjustment = (monthlyBase * 95) / 100; // 5% reduction for low mileage
        } else if (mileageCap <= 2000) {
            mileageAdjustment = monthlyBase; // No change for moderate mileage
        } else {
            mileageAdjustment = (monthlyBase * 110) / 100; // 10% increase for high mileage
        }
        // Adjust cost based on contract duration
        // Longer contracts get a discount, e.g., 5% for 12+ months
        uint256 durationDiscount;
        if (contractDuration >= 12) {
            durationDiscount = (monthlyBase * 5) / 100; // 5% discount for 12+ months
        } else {
            durationDiscount = 0; // No discount for shorter contracts
        }
        // Calculate the final monthly quota
        monthlyQuota = monthlyBase - discount + mileageAdjustment - durationDiscount;
        // Return value
        return monthlyQuota;
    }
}