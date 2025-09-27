// frontend/hooks/useDealDetailsSimple.js
'use client';
import { useReadContract } from 'wagmi';
import { ethers } from 'ethers';

// Simple ABI for the EscrowSimple contract
const EscrowSimpleABI = [
  {
    "inputs": [],
    "name": "getProjectDetails",
    "outputs": [
      {"internalType": "address", "name": "_client", "type": "address"},
      {"internalType": "address", "name": "_freelancer", "type": "address"},
      {"internalType": "address", "name": "_arbiter", "type": "address"},
      {"internalType": "uint256", "name": "_totalAmount", "type": "uint256"},
      {"internalType": "string", "name": "_projectDescription", "type": "string"},
      {"internalType": "uint8", "name": "_currentStatus", "type": "uint8"},
      {"internalType": "uint8", "name": "_workStatus", "type": "uint8"},
      {"internalType": "string", "name": "_workSubmission", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {"internalType": "contract IERC20", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "client",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freelancer",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAmount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentStatus",
    "outputs": [
      {"internalType": "uint8", "name": "", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fundEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_workSubmission", "type": "string"}],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "approveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_winner", "type": "address"}],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const useDealDetailsSimple = (address) => {
  
  // Don't make contract calls if no address
  const skipCall = !address || address === '';
  
  const { data, isLoading, isError, error } = useReadContract({
    address: address || '0x0000000000000000000000000000000000000000',
    abi: EscrowSimpleABI,
    functionName: 'getProjectDetails',
    query: {
      enabled: !skipCall,
    }
  });

  // Get token address separately
  const { data: tokenAddress, isLoading: tokenLoading, isError: tokenError } = useReadContract({
    address: address || '0x0000000000000000000000000000000000000000',
    abi: EscrowSimpleABI,
    functionName: 'token',
    query: {
      enabled: !skipCall,
    }
  });

  
  // Wait for both data and tokenAddress to be loaded
  const bothLoading = isLoading || tokenLoading;
  const bothError = isError || tokenError;
  

  const dealDetails = data && tokenAddress && !skipCall ? {
    client: data[0],
    freelancer: data[1],
    arbiter: data[2],
    totalAmount: data[3] ? ethers.formatEther(data[3]) : '0', // Formatted for display
    totalAmountWei: data[3] || 0n, // Raw BigInt for transactions
    projectDescription: data[4],
    status: Number(data[5]), // AgreementStatus enum
    workStatus: Number(data[6]), // WorkStatus enum  
    workSubmission: data[7] || '',
    tokenAddress: tokenAddress // Add token address
  } : null;

  return { 
    deal: dealDetails, 
    isLoading: skipCall ? false : bothLoading,
    isError: skipCall ? false : bothError 
  };
};

export { EscrowSimpleABI };
