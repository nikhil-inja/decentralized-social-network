// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EscrowSimple.sol";
import "./ArbiterRegistry.sol";

/**
 * @title EscrowFactory (Simplified)
 * @dev A factory contract to create and track new single-arbiter Escrow agreements.
 */
contract EscrowFactory {
    ArbiterRegistry public immutable arbiterRegistry;
    address[] public escrowContracts;

    event EscrowCreated(
        address indexed escrowAddress,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount
    );

    constructor(address _arbiterRegistryAddress) {
        require(_arbiterRegistryAddress != address(0), "FACTORY: Invalid registry address.");
        arbiterRegistry = ArbiterRegistry(_arbiterRegistryAddress);
    }

    /**
     * @dev Creates and deploys a new Escrow contract. The caller of this function becomes the client.
     */
    function createEscrow(
        address _freelancer,
        address _arbiter,
        address _tokenAddress,
        uint256 _amount,
        string memory _projectDescription
    ) external {
        // The single most important security check: ensure the chosen arbiter is active in the registry.
        require(arbiterRegistry.isArbiterActive(_arbiter), "FACTORY: Invalid or inactive arbiter.");
        
        // Deploy a new simplified Escrow contract
        EscrowSimple newEscrow = new EscrowSimple(
            msg.sender, // The client is the one who calls this function
            _freelancer,
            _arbiter,
            _tokenAddress,
            _amount,
            _projectDescription
        );

        // Store the address of the newly created contract and announce it.
        escrowContracts.push(address(newEscrow));
        emit EscrowCreated(address(newEscrow), msg.sender, _freelancer, _amount);
    }

    /**
     * @dev Returns a list of all escrow contracts created by this factory.
     */
    function getEscrowContracts() external view returns (address[] memory) {
        return escrowContracts;
    }

    /**
     * @dev Returns escrow contracts where the user is either client or freelancer.
     * @param user The address to search for
     * @return userEscrows Array of escrow contract addresses for the user
     */
    function getUserEscrows(address user) external view returns (address[] memory) {
        address[] memory tempEscrows = new address[](escrowContracts.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < escrowContracts.length; i++) {
            EscrowSimple escrow = EscrowSimple(escrowContracts[i]);
            if (escrow.client() == user || escrow.freelancer() == user) {
                tempEscrows[count] = escrowContracts[i];
                count++;
            }
        }
        
        // Create correctly sized array
        address[] memory userEscrows = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            userEscrows[i] = tempEscrows[i];
        }
        
        return userEscrows;
    }

    /**
     * @dev Returns the total number of escrow contracts created.
     */
    function getEscrowCount() external view returns (uint256) {
        return escrowContracts.length;
    }
}

