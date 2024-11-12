// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// A4Q2 means "Added for Q2"

contract carForRent is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _carIDCounter;

    struct Car {
        address currentlessee;
        string model;
        string color;
        uint16 yearOfMatriculation;
        uint256 originalValue;
        uint256 mileage; // (A4Q2)
    }

    // Mapping each carID to car struct containing all cars
    mapping(uint256 => Car) public cars;

    constructor() ERC721("carForRent", "CAR") {}

    /**
     * @dev Mint a new car NFT
     * @notice Initially, no lessee is assigned.
     * @param model The model of the car
     * @param color The color of the car
     * @param yearOfMatriculation The year the car was manufactured
     * @param originalValue The original value of the car
     */
    function mintCar(
        string memory model,
        string memory color,
        uint16 yearOfMatriculation,
        uint256 originalValue
    ) public onlyOwner {
        // Get the ID of the new car
        _carIDCounter.increment();
        uint256 carID = _carIDCounter.current();
        // Mint the NFT representing the car
        _mint(msg.sender, carID);
        // Store car details in the mapping
        cars[carID] = Car({
            currentLessee: address(0),  // No lessee initially
            model: model,
            color: color,
            yearOfMatriculation: yearOfMatriculation,
            originalValue: originalValue,
            mileage: 0  // (A4Q2) Initial mileage is set to 0 
        });
    }
    
    /**
     * @dev Retrieve details of a car by its carID.
     * @param carID The unique ID of the car
     * @return car The car struct containing all details
     */
    function getCarDetails(uint256 carID) public view returns (Car memory) {
        // TODO: régler le problème avec '_exists'
        //require(_exists(carID), "Car does not exist");
        return cars[carID];
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
        uint256 monthlyBase = car.originalValue * 0.04; // Base cost: 4% of vehicle value per month
        uint256 eduction_experience = 10; // Discount in € per year of experience, up to a maximum of 10 years
        // Calculation
        uint256 durationInMonth = max(contractDuration/30, 1);
        uint256 experienceDiscount = min(driverExperience, 10);
        monthlyQuota = (monthlyBase - experienceDiscount) * durationInMonth;
        monthlyQuota = max(monthlyQuota, monthlyBase);
        // Return value
        return monthlyQuota;
    }

    // Internal helper functions for max and min
    function max(uint256 a, uint256 b) external pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) external pure returns (uint256) {
        return a <= b ? a : b;
    }

}