// frontend/app/page.tsx
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useMyDeals } from '../../hooks/useMyDeals';
import DealCard from '../../components/DealCard'; // Import the skeleton component

export default function Home() {
  const { isConnected } = useAccount();
  const { deals, isLoading } = useMyDeals();

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '24px' }}>Decentralized Escrow</h1>
        <ConnectButton />
      </header>
      
      <main style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>My Deals</h2>
        
        {!isConnected ? (
          <p>Please connect your wallet to see your deals.</p>
        ) : isLoading ? (
          <p>Loading your deals...</p>
        ) : deals.length === 0 ? (
          <p>You have no active deals. Create one to get started!</p>
        ) : (
          <div>
            {deals.map((deal: any) => (
              <DealCard key={deal.address} deal={deal} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}