// frontend/hooks/useDealDetails.js
'use client';
import { ethers } from 'ethers';
import { useReadContracts } from 'wagmi';
import { EscrowABI } from '../contracts/config';

export const useDealDetails = (address) => {
  const escrowContract = {
    address: address,
    abi: EscrowABI,
  };

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      { ...escrowContract, functionName: 'client' },
      { ...escrowContract, functionName: 'freelancer' },
      { ...escrowContract, functionName: 'arbiter' },
      { ...escrowContract, functionName: 'totalAmount' },
      { ...escrowContract, functionName: 'currentStatus' },
      { ...escrowContract, functionName: 'milestones', args: [0] }, // Fetch first milestone
      // You can add more milestone fetches here if needed, or do it in a separate call
    ],
  });

  const dealDetails = data ? {
    client: data[0].result,
    freelancer: data[1].result,
    arbiter: data[2].result,
    totalAmount: data[3].result ? ethers.formatEther(data[3].result) : '0',
    status: data[4].result !== undefined ? Number(data[4].result) : -1,
    // Note: This only fetches the first milestone. A more robust implementation would fetch all of them.
    milestones: data[5].result ? [data[5].result] : [], 
  } : null;

  return { deal: dealDetails, isLoading, isError };
};