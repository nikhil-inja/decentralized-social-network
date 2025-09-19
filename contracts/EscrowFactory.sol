// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Escrow.sol";
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
        uint256[] memory _payouts,
        string[] memory _detailsHashes
    ) external {
        // The single most important security check: ensure the chosen arbiter is active in the registry.
        require(arbiterRegistry.isArbiterActive(_arbiter), "FACTORY: Invalid or inactive arbiter.");
        
        // Deploy a new Escrow contract with the specified parameters for the single-arbiter model.
        Escrow newEscrow = new Escrow(
            msg.sender, // The client is the one who calls this function
            _freelancer,
            _arbiter,
            _tokenAddress,
            _payouts,
            _detailsHashes
        );

        // Store the address of the newly created contract and announce it.
        escrowContracts.push(address(newEscrow));
        emit EscrowCreated(address(newEscrow), msg.sender, _freelancer, newEscrow.totalAmount());
    }

    /**
     * @dev Returns a list of all escrow contracts created by this factory.
     */
    function getEscrowContracts() external view returns (address[] memory) {
        return escrowContracts;
    }
}

