// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract carForRent is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _carIDCounter;

    struct Car {
        address currentlessee;
        string model;
        string color;
        uint16 yearOfMatriculation;
        uint256 originalValue;
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
            originalValue: originalValue
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

}