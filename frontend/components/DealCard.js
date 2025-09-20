// frontend/components/DealCard.js
'use client';
import Link from 'next/link';

// A helper function to get status text and color
const getStatusInfo = (status) => {
  switch (status) {
    case 0: return { text: 'Created', color: 'bg-gray-200 text-gray-800' };
    case 1: return { text: 'Funded', color: 'bg-blue-200 text-blue-800' };
    case 2: return { text: 'In Progress', color: 'bg-indigo-200 text-indigo-800' };
    case 3: return { text: 'Disputed', color: 'bg-red-200 text-red-800' };
    case 4: return { text: 'Completed', color: 'bg-green-200 text-green-800' };
    case 5: return { text: 'Canceled', color: 'bg-gray-500 text-white' };
    default: return { text: 'Unknown', color: 'bg-gray-200 text-gray-800' };
  }
};

const DealCard = ({ deal }) => {
  const { text: statusText, color: statusColor } = getStatusInfo(deal.status);
  
  // Truncate the address for better display
  const truncateAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const otherPartyAddress = deal.role === 'Client' ? deal.freelancer : deal.client;
  const otherPartyRole = deal.role === 'Client' ? 'Freelancer' : 'Client';

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
              {statusText}
            </span>
            <span className="ml-4 text-sm font-medium text-gray-500">
              Role: {deal.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {otherPartyRole}: {truncateAddress(otherPartyAddress)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">{deal.totalAmount} Tokens</p>
          <p className="text-xs text-gray-400">Total Value</p>
        </div>
      </div>
      <div className="mt-6 text-right">
        {/* This Link will eventually navigate to the detailed view for this specific deal */}
        <Link href={`/deal/${deal.address}`} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
          View Deal
        </Link>
      </div>
    </div>
  );
};

export default DealCard;