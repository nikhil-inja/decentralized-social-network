// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArbiterRegistry
 * @dev Manages a list of approved arbiters for the escrow platform.
 * Only the platform owner can add or remove arbiters, but the list is public.
 */
contract ArbiterRegistry is Ownable {
    struct Arbiter {
        string name;
        string profileHash; // IPFS hash of detailed credentials
        bool isActive;
    }

    mapping(address => Arbiter) public arbiters;
    address[] public arbiterList;

    event ArbiterAdded(address indexed arbiterAddress, string name);
    event ArbiterRemoved(address indexed arbiterAddress);

    // The deployer of the contract is set as the owner
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Adds a new arbiter to the registry. Only callable by the platform owner.
     */
    function addArbiter(address _arbiterAddress, string memory _name, string memory _profileHash) external onlyOwner {
        require(!arbiters[_arbiterAddress].isActive, "Arbiter already exists.");
        
        arbiters[_arbiterAddress] = Arbiter({
            name: _name,
            profileHash: _profileHash,
            isActive: true
        });
        
        arbiterList.push(_arbiterAddress);
        emit ArbiterAdded(_arbiterAddress, _name);
    }

    /**
     * @dev Deactivates an arbiter, preventing them from being chosen for new contracts.
     */
    function removeArbiter(address _arbiterAddress) external onlyOwner {
        require(arbiters[_arbiterAddress].isActive, "Arbiter does not exist or is already inactive.");
        arbiters[_arbiterAddress].isActive = false;
        // Note: We don't remove from the array to preserve history. Frontend will filter.
        emit ArbiterRemoved(_arbiterAddress);
    }

    function isArbiterActive(address _arbiterAddress) external view returns (bool) {
        return arbiters[_arbiterAddress].isActive;
    }
}

