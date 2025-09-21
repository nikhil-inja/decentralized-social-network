// frontend/app/page.tsx
'use client';
import Link from 'next/link'; // Import the Link component
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useMyDeals } from '../../hooks/useMyDeals';
import DealCard from '../../components/DealCard';

export default function Home() {
  const { isConnected } = useAccount();
  const { deals, isLoading } = useMyDeals();

  return (
    <div>
      <header className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">Decentralized Escrow</h1>
        <ConnectButton />
      </header>
      
      <main className="max-w-4xl mx-auto p-6">
        {/* --- ADD THIS SECTION --- */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">My Deals</h2>
          {isConnected && (
            <Link href="/create" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              + Create New Deal
            </Link>
          )}
        </div>
        {/* --- END SECTION --- */}
        
        {!isConnected ? (
          <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">Please connect your wallet to see your deals.</div>
        ) : isLoading ? (
          <div className="text-center text-gray-500 p-8">Loading your deals...</div>
        ) : deals.length === 0 ? (
          <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">You have no active deals. Create one to get started!</div>
        ) : (
          <div>
            {deals.map((deal: any) => (
              <DealCard key={deal.address} deal={deal as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}