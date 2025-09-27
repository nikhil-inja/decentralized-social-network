// frontend/app/create/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { useAccount, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { ESCROW_FACTORY_ADDRESS, EscrowFactoryABI } from '../../../contracts/config';
import ArbiterList from '../../../components/ArbiterList'; // Your teammate's component

export default function CreateDealPage() {
  const router = useRouter();
  const { isConnected, address: clientAddress } = useAccount();
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState(''); // e.g., USDC address
  const [selectedArbiter, setSelectedArbiter] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectAmount, setProjectAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }

    // Validation
    if (!freelancerAddress || !ethers.isAddress(freelancerAddress)) {
      alert('Please enter a valid freelancer wallet address.');
      return;
    }

    if (!selectedArbiter) {
      alert('Please select an arbiter.');
      return;
    }

    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      alert('Please enter a valid token contract address.');
      return;
    }

    if (!projectDescription || !projectAmount || parseFloat(projectAmount) <= 0) {
      alert('Please fill in project description and a valid amount.');
      return;
    }

    console.log('Form data:', {
      freelancerAddress,
      selectedArbiter,
      tokenAddress,
      projectDescription,
      projectAmount
    });

    try {
      // Prepare arguments for the simplified smart contract
      const amount = ethers.parseEther(projectAmount);

      // Use simplified interface (single values, not arrays)
      writeContract({
        address: ESCROW_FACTORY_ADDRESS as `0x${string}`,
        abi: EscrowFactoryABI as any,
        functionName: 'createEscrow',
        args: [freelancerAddress, selectedArbiter, tokenAddress, amount, projectDescription], // Single values
      });
    } catch (error) {
      console.error('Error creating escrow:', error);
      alert('Error creating escrow. Check console for details.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet to create a deal.</h1>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Escrow Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Parties */}
        <div>
          <label htmlFor="freelancer" className="block text-sm font-medium text-gray-700">Freelancer's Wallet Address</label>
          <input
            type="text"
            id="freelancer"
            value={freelancerAddress}
            onChange={(e) => setFreelancerAddress(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">Payment Token Address</label>
            <input
                type="text"
                id="token"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 0x... (address of USDC, DAI, etc.)"
                required
            />
        </div>
        
        <ArbiterList onArbiterSelected={setSelectedArbiter} />

        {/* Step 2: Project Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Details</h2>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Project Description</label>
            <textarea
              id="description"
              placeholder="Describe the work to be completed..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={4}
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Total Payment Amount (in tokens)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 100"
              value={projectAmount}
              onChange={(e) => setProjectAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Step 3: Submit */}
        <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
          {isPending ? 'Deploying...' : 'Create & Deploy Escrow'}
        </button>

        {isSuccess && <div className="text-green-600">Deal created successfully! Redirecting...</div>}
        {error && <div className="text-red-600">Error: {error.message}</div>}
      </form>
    </div>
  );
}