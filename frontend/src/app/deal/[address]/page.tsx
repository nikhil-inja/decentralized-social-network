// frontend/app/deal/[address]/page.tsx
'use client';
import { useAccount } from 'wagmi';
import { useDealDetails } from '../../../../hooks/useDealDetails';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// You can move this to a shared file later
const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { text: 'Created: Awaiting Funds', color: 'bg-gray-200 text-gray-800' };
      case 1: return { text: 'Funded: Ready to Start', color: 'bg-blue-200 text-blue-800' };
      case 2: return { text: 'In Progress', color: 'bg-indigo-200 text-indigo-800' };
      case 3: return { text: 'Disputed', color: 'bg-red-200 text-red-800' };
      case 4: return { text: 'Completed', color: 'bg-green-200 text-green-800' };
      default: return { text: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    }
};

export default function DealDetailsPage({ params }: { params: { address: string } }) {
  const { address: dealAddress } = params;
  const { address: userAddress, isConnected } = useAccount();
  const { deal, isLoading, isError } = useDealDetails(dealAddress);

  if (isLoading) return <div className="text-center p-10">Loading deal details...</div>;
  if (isError || !deal) return <div className="text-center p-10 text-red-500">Error loading deal.</div>;

  const { text: statusText, color: statusColor } = getStatusInfo(deal.status);
  const userRole = userAddress === deal.client ? 'Client' : userAddress === deal.freelancer ? 'Freelancer' : userAddress === deal.arbiter ? 'Arbiter' : 'Observer';

  // --- ACTION BUTTONS (Your Core Logic Goes Here) ---
  const renderActionPanel = () => {
    // Client's action: Fund the deal
    if (userRole === 'Client' && deal.status === 0) {
      return <button className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg">Fund Escrow ({deal.totalAmount} Tokens)</button>;
    }
    // Freelancer's action: Submit work for the first milestone
    if (userRole === 'Freelancer' && deal.status >= 1 && deal.milestones[0] && (deal.milestones[0] as any).state === 0) {
      return <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg">Submit Work for Milestone 1</button>;
    }
    // Client's action: Approve work
    if (userRole === 'Client' && deal.milestones[0] && (deal.milestones[0] as any).state === 1) {
        return <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg">Approve Milestone 1</button>;
    }
    // More logic will go here for disputes, other milestones, etc.
    return <p className="text-sm text-gray-500 text-center">No immediate action required by you.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Deal Details</h1>
            <ConnectButton />
        </header>

        {/* Main Deal Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center">
                <span className={`px-4 py-2 text-lg font-semibold rounded-full ${statusColor}`}>
                    {statusText}
                </span>
                <div className="text-right">
                    <p className="text-3xl font-bold">{deal.totalAmount} Tokens</p>
                    <p className="text-gray-500">Total Deal Value</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Contract Address: {dealAddress}</p>
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Next Step</h2>
            {renderActionPanel()}
        </div>

        {/* TODO: Add a component to list all milestones here */}
    </div>
  );
}