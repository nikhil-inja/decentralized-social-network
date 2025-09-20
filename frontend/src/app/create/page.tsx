// frontend/app/create/page.tsx
'use client';
import { useState } from 'react';
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
  const [milestones, setMilestones] = useState([{ description: '', amount: '' }]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '' }]);
  };

  const handleMilestoneChange = (index: number, field: keyof typeof milestones[0], value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }

    // Prepare arguments for the smart contract
    const payouts = milestones.map(m => ethers.parseEther(m.amount)); // Assuming ETH/18 decimals
    const descriptions = milestones.map(m => m.description);

    writeContract({
      address: ESCROW_FACTORY_ADDRESS,
      abi: EscrowFactoryABI as any,
      functionName: 'createEscrow',
      args: [freelancerAddress, selectedArbiter, tokenAddress, payouts, descriptions],
    });
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

        {/* Step 2: Milestones */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Milestones</h2>
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder={`Milestone ${index + 1} Description`}
                value={milestone.description}
                onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={milestone.amount}
                onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                className="w-32 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          ))}
          <button type="button" onClick={handleAddMilestone} className="text-sm text-blue-600 hover:underline">
            + Add Another Milestone
          </button>
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