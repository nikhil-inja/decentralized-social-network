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

  useEffect(() => {
    const fetchArbiters = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const registryContract = new ethers.Contract(
          ARBITER_REGISTRY_ADDRESS,
          ArbiterRegistryABI,
          provider
        );

        const arbiterAddresses = await registryContract.arbiterList();
        
        // Fetch details for each arbiter in parallel
        const arbiterDetailsPromises = arbiterAddresses.map(address => 
          registryContract.arbiters(address)
        );
        const arbitersWithDetails = await Promise.all(arbiterDetailsPromises);

        // Combine addresses with their details and filter for active ones
        const activeArbiters = arbiterAddresses
          .map((address, index) => ({
            address,
            name: arbitersWithDetails[index].name,
            isActive: arbitersWithDetails[index].isActive,
          }))
          .filter(arbiter => arbiter.isActive);
        
        setArbiters(activeArbiters);
      } catch (error) {
        console.error("Failed to fetch arbiters:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArbiters();
  }, []);

  if (isLoading) {
    return <p className="text-gray-500">Loading available arbiters...</p>;
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
          -- Choose a trusted arbiter --
        </option>
        {arbiters.map(arbiter => (
          <option key={arbiter.address} value={arbiter.address}>
            {arbiter.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ArbiterList;