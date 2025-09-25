// frontend/components/ArbiterList.js
'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import {
  ARBITER_REGISTRY_ADDRESS,
  ArbiterRegistryABI,
} from '../contracts/config';

const ArbiterList = ({ onArbiterSelected }) => {
  const [arbiters, setArbiters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const fetchArbiters = async () => {
      if (!isMounted) return;
      
      console.log("ArbiterList: Starting fetch...");
      console.log("ArbiterList: Using ARBITER_REGISTRY_ADDRESS:", ARBITER_REGISTRY_ADDRESS);
      
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed.");
        }

        console.log("ArbiterList: Checking MetaMask connection...");
        
        // Try to get provider directly without chain ID check first
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log("ArbiterList: Provider created successfully");
        
        // Test basic connectivity first
        console.log("ArbiterList: Testing basic connectivity...");
        
        // Add timeout for all operations
        const timeout = (ms) => new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
        );
        
        try {
          const blockNumber = await Promise.race([
            provider.getBlockNumber(),
            timeout(5000)
          ]);
          console.log("ArbiterList: Current block number:", blockNumber);
        } catch (error) {
          console.error("ArbiterList: Connectivity test failed:", error);
          throw new Error("Cannot connect to blockchain. Please check MetaMask is connected to Localhost 8545.");
        }
        
        const registryContract = new ethers.Contract(
          ARBITER_REGISTRY_ADDRESS,
          ArbiterRegistryABI,
          provider
        );
        console.log("ArbiterList: Contract instance created for address:", ARBITER_REGISTRY_ADDRESS);

        // Get arbiters by iterating through the arbiterList array
        const arbiterAddresses = [];
        let i = 0;
        try {
          while (i < 10) { // Safety limit to prevent infinite loop
            console.log(`ArbiterList: Fetching arbiter at index ${i}...`);
            const address = await registryContract.arbiterList(i);
            console.log(`ArbiterList: Found arbiter at index ${i}:`, address);
            arbiterAddresses.push(address);
            i++;
          }
        } catch (error) {
          console.log(`ArbiterList: Reached end of array at index ${i}, error:`, error.message);
          // End of array reached - this is expected
        }
        console.log("ArbiterList: Fetched arbiter addresses:", arbiterAddresses);

        if (arbiterAddresses.length === 0) {
            console.log("ArbiterList: No arbiters found in the registry.");
            setArbiters([]);
            setIsLoading(false);
            return;
        }
        
        const arbiterDetailsPromises = arbiterAddresses.map(address => 
          registryContract.arbiters(address)
        );
        const arbitersWithDetails = await Promise.all(arbiterDetailsPromises);
        console.log("ArbiterList: Fetched arbiter details:", arbitersWithDetails);
        
        const activeArbiters = arbiterAddresses
          .map((address, index) => ({
            address,
            name: arbitersWithDetails[index].name,
            isActive: arbitersWithDetails[index].isActive,
          }))
          .filter(arbiter => arbiter.isActive);
        
        console.log("ArbiterList: Filtered active arbiters:", activeArbiters);
        setArbiters(activeArbiters);

      } catch (error) {
        console.error("ArbiterList: Failed to fetch arbiters:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArbiters();
    
    return () => {
      isMounted = false; // Cleanup function
    };
  }, []); // Empty dependency array to run only once

  if (isLoading) {
    return <p className="text-gray-500">Loading available arbiters...</p>;
  }
  
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <label htmlFor="arbiter-select" className="block text-sm font-medium text-gray-700 mb-1">
        Select an Arbiter
      </label>
      <select
        id="arbiter-select"
        className="block w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => onArbiterSelected(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          {arbiters.length === 0 ? "No active arbiters found" : "-- Choose a trusted arbiter --"}
        </option>
        {arbiters.map(arbiter => (
          <option key={arbiter.address} value={arbiter.address}>
            {arbiter.name} ({arbiter.address.substring(0, 6)}...)
          </option>
        ))}
      </select>
    </div>
  );
};

export default ArbiterList;