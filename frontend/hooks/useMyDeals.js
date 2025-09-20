// frontend/hooks/useMyDeals.js
'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

import {
  ESCROW_FACTORY_ADDRESS,
  EscrowFactoryABI,
  EscrowABI,
} from '../contracts/config';

export const useMyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address: userAddress, isConnected } = useAccount();

  useEffect(() => {
    const fetchDeals = async () => {
      if (!isConnected || !userAddress) {
        setIsLoading(false);
        setDeals([]);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const factoryContract = new ethers.Contract(ESCROW_FACTORY_ADDRESS, EscrowFactoryABI, provider);

        const allDealAddresses = await factoryContract.getEscrowContracts();
        const userDeals = [];

        for (const dealAddress of allDealAddresses) {
          const escrowContract = new ethers.Contract(dealAddress, EscrowABI, provider);
          const client = await escrowContract.client();
          const freelancer = await escrowContract.freelancer();

          if (client === userAddress || freelancer === userAddress) {
            const totalAmount = await escrowContract.totalAmount();
            const currentStatus = await escrowContract.currentStatus();
            
            userDeals.push({
              address: dealAddress,
              client,
              freelancer,
              totalAmount: ethers.formatEther(totalAmount),
              status: Number(currentStatus), // Convert BigInt to Number for easier handling
              role: client === userAddress ? 'Client' : 'Freelancer',
            });
          }
        }
        
        setDeals(userDeals);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [isConnected, userAddress]); // Re-run when the user connects or changes account

  return { deals, isLoading };
};