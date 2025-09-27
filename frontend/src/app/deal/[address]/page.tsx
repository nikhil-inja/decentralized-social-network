// frontend/app/deal/[address]/page.tsx
'use client';
import { useState, useEffect, use } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';
import { useDealDetailsSimple, EscrowSimpleABI } from '../../../../hooks/useDealDetailsSimple';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SocialTokenABI } from '../../../../contracts/config';

// Status mapping for EscrowSimple: CREATED, FUNDED, IN_PROGRESS, COMPLETED, DISPUTED
const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { text: 'Created: Awaiting Funds', color: 'bg-gray-200 text-gray-800' };
      case 1: return { text: 'Funded: Ready to Start', color: 'bg-blue-200 text-blue-800' };
      case 2: return { text: 'In Progress', color: 'bg-indigo-200 text-indigo-800' };
      case 3: return { text: 'Completed', color: 'bg-green-200 text-green-800' };
      case 4: return { text: 'Disputed', color: 'bg-red-200 text-red-800' };
      default: return { text: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    }
};

export default function DealDetailsPage({ params }: { params: Promise<{ address: string }> }) {
  // Use the new React 19 'use' hook to handle the Promise directly
  const resolvedParams = use(params);
  const dealAddress = resolvedParams.address;
  
  
  // Client-side hydration check - MUST be first useState
  const [mounted, setMounted] = useState(false);
  
  // ALL OTHER HOOKS MUST BE DECLARED AT THE TOP - NO CONDITIONAL HOOKS
  const { address: userAddress, isConnected } = useAccount();
  const { deal, isLoading, isError } = useDealDetailsSimple(dealAddress || ''); // Pass empty string if no address
  

  
  // State for funding process (always declare these)
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStep, setFundingStep] = useState<'approve' | 'fund' | 'complete'>('approve');
  const [txHash, setTxHash] = useState<string>('');
  
  // State for work submission (always declare these)
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [workDescription, setWorkDescription] = useState<string>('');
  const [showWorkForm, setShowWorkForm] = useState(false);
  
  // State for work approval (always declare these)
  const [isApprovingWork, setIsApprovingWork] = useState(false);

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Wagmi hooks for contract interactions (always declare these)
  const { writeContract: writeToken, data: tokenTxHash, isPending: isTokenPending } = useWriteContract();
  const { writeContract: writeEscrow, data: escrowTxHash, isPending: isEscrowPending } = useWriteContract();
  const { writeContract: submitWorkContract, data: workTxHash, isPending: isWorkPending } = useWriteContract();
  const { writeContract: approveWorkContract, data: approveWorkTxHash, isPending: isApproveWorkPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });
  
  // Restore funding state after reload (only on client side)
  useEffect(() => {
    if (!dealAddress || !mounted) return;
    
    const savedState = sessionStorage.getItem('fundingState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.dealAddress === dealAddress) {
          setIsFunding(true);
          setFundingStep(state.step);
        }
      } catch (e) {
        sessionStorage.removeItem('fundingState');
      }
    }
  }, [dealAddress, mounted]);
  
  // Watch for transaction confirmations
  useEffect(() => {
    if (isConfirmed && txHash) {
      if (fundingStep === 'approve') {
        // Approval confirmed, ready to fund
        setTimeout(() => {
          setFundingStep('fund');
          setTxHash('');
        }, 2000);
      } else if (fundingStep === 'fund') {
        // Funding confirmed, complete!
        setFundingStep('complete');
        if (mounted) {
          sessionStorage.removeItem('fundingState');
        }
        
        setTimeout(() => {
          setIsFunding(false);
          alert('✅ Escrow funded successfully! Refreshing page...');
          window.location.reload();
        }, 2000);
      }
    }
  }, [isConfirmed, txHash, fundingStep, isConfirming, mounted]);
  
  // Watch for transaction hashes from Wagmi hooks
  useEffect(() => {
    if (tokenTxHash && fundingStep === 'approve') {
      setTxHash(tokenTxHash);
    }
  }, [tokenTxHash, fundingStep]);
  
  useEffect(() => {
    if (escrowTxHash && fundingStep === 'fund') {
      setTxHash(escrowTxHash);
    }
  }, [escrowTxHash, fundingStep]);
  
  // Add timeout fallback for stuck transactions
  useEffect(() => {
    if (txHash && !isConfirmed && !isConfirming) {
      const timeout = setTimeout(() => {
        if (fundingStep === 'approve') {
          setFundingStep('fund');
          setTxHash('');
        }
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [txHash, isConfirmed, isConfirming, fundingStep]);
  
  // Watch for work submission transaction hash
  useEffect(() => {
    if (workTxHash && isSubmittingWork) {
      setTxHash(workTxHash);
      
      setTimeout(() => {
        setIsSubmittingWork(false);
        setShowWorkForm(false);
        setWorkDescription('');
        alert('✅ Work submitted successfully!');
        window.location.reload();
      }, 3000);
    }
  }, [workTxHash, isSubmittingWork]);

  // Watch for work approval transaction hash
  useEffect(() => {
    if (approveWorkTxHash && isApprovingWork) {
      setTxHash(approveWorkTxHash);
      
      setTimeout(() => {
        setIsApprovingWork(false);
        alert('✅ Work approved successfully! Payment has been sent to the freelancer.');
        window.location.reload();
      }, 3000);
    }
  }, [approveWorkTxHash, isApprovingWork]);

  
  // Don't render until we have the address and component is mounted (hydrated)
  if (!dealAddress || !mounted) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (isLoading) return <div className="text-center p-10">Loading deal details...</div>;
  if (isError || !deal) return <div className="text-center p-10 text-red-500">Error loading deal.</div>;

  const { text: statusText, color: statusColor } = getStatusInfo(deal.status);
  const userRole = userAddress === deal.client ? 'Client' : userAddress === deal.freelancer ? 'Freelancer' : userAddress === deal.arbiter ? 'Arbiter' : 'Observer';

  // Fund Escrow Functions
  const handleFundEscrow = async () => {
    if (!deal) return;
    
    setIsFunding(true);
    setFundingStep('approve');
    
    try {
      const totalAmountWei = deal.totalAmountWei;
      
      if (!totalAmountWei || totalAmountWei === BigInt(0)) {
        alert('Invalid deal amount. Please refresh the page and try again.');
        setIsFunding(false);
        return;
      }
      
      // Store transaction state in sessionStorage to survive reloads
      if (mounted) {
        sessionStorage.setItem('fundingState', JSON.stringify({
          step: 'approve',
          dealAddress,
          amount: deal.totalAmount
        }));
      }
      
      await writeToken({
        address: deal.tokenAddress as `0x${string}`,
        abi: SocialTokenABI,
        functionName: 'approve',
        args: [dealAddress as `0x${string}`, totalAmountWei],
      });
      
      
    } catch (error) {
      console.error('Error during approval:', error);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fundingState');
      }
      setIsFunding(false);
      
      // Better error handling
      if (error instanceof Error) {
        alert(`Approval failed: ${error.message}`);
      } else {
        alert('Approval failed. Please try again.');
      }
    }
  };
  
  const handleActualFunding = async () => {
    try {
      if (mounted && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(deal.tokenAddress as string, SocialTokenABI, provider);
        const escrowContract = new ethers.Contract(dealAddress, EscrowSimpleABI, provider);
        
        try {
          const balance = await tokenContract.balanceOf(userAddress);
          const allowance = await tokenContract.allowance(userAddress, dealAddress);
          const escrowStatus = await escrowContract.currentStatus();
          const totalAmount = await escrowContract.totalAmount();
          
          
          if (balance < totalAmount) {
            alert(`Insufficient token balance! You have ${ethers.formatEther(balance)} but need ${ethers.formatEther(totalAmount)}`);
            setIsFunding(false);
            return;
          }
          
          if (allowance < totalAmount) {
            alert(`Insufficient approval! Approved: ${ethers.formatEther(allowance)}, Need: ${ethers.formatEther(totalAmount)}`);
            setIsFunding(false);
            return;
          }
          
          if (escrowStatus !== BigInt(0)) {
            alert(`Escrow is not in CREATED state. Current status: ${escrowStatus}`);
            setIsFunding(false);
            return;
          }
          
        } catch (debugError) {
          // Continue with funding despite debug check failure
        }
      }
      
      await writeEscrow({
        address: dealAddress as `0x${string}`,
        abi: EscrowSimpleABI,
        functionName: 'fundEscrow',
        args: [], // No args needed for fundEscrow
      });
      
      
    } catch (error) {
      console.error('Error funding escrow:', error);
      
      if (mounted) {
        sessionStorage.removeItem('fundingState');
      }
      setIsFunding(false);
      
      if (error instanceof Error) {
        // Show more detailed error information
        const errorMsg = error.message.includes('Internal JSON-RPC error') 
          ? `Funding failed: ${error.message}. Check console for details.`
          : `Funding failed: ${error.message}`;
        alert(errorMsg);
      } else {
        alert('Funding failed. Please try again.');
      }
    }
  };

  // Handle work submission
  const handleSubmitWork = async () => {
    if (!workDescription.trim()) {
      alert('Please provide work description or link');
      return;
    }

    try {
      setIsSubmittingWork(true);

      await submitWorkContract({
        address: dealAddress as `0x${string}`,
        abi: EscrowSimpleABI,
        functionName: 'submitWork',
        args: [workDescription],
      });

      
    } catch (error) {
      console.error('Error submitting work:', error);
      setIsSubmittingWork(false);
      
      if (error instanceof Error) {
        alert(`Work submission failed: ${error.message}`);
      } else {
        alert('Work submission failed. Please try again.');
      }
    }
  };

  // Handle work approval
  const handleApproveWork = async () => {
    if (!deal) return;

    try {
      setIsApprovingWork(true);

      await approveWorkContract({
        address: dealAddress as `0x${string}`,
        abi: EscrowSimpleABI,
        functionName: 'approveWork',
        args: [], // No args needed for approveWork
      });

      
    } catch (error) {
      console.error('Error approving work:', error);
      setIsApprovingWork(false);
      
      if (error instanceof Error) {
        alert(`Work approval failed: ${error.message}`);
      } else {
        alert('Work approval failed. Please try again.');
      }
    }
  };





  // --- ACTION BUTTONS ---
  const renderActionPanel = () => {
    // Client's action: Fund the deal
    if (userRole === 'Client' && deal.status === 0) {
      return (
        <div className="space-y-2">
          {fundingStep === 'fund' && isFunding ? (
            <button 
              onClick={handleActualFunding}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Complete Funding (Step 2/2)
            </button>
          ) : (
            <button 
              onClick={handleFundEscrow}
              disabled={isFunding && fundingStep !== 'fund'}
              className={`w-full font-bold py-3 px-4 rounded-lg ${
                isFunding && fundingStep !== 'fund'
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isFunding ? (
                fundingStep === 'approve' ? 'Step 1: Approving Tokens...' :
                fundingStep === 'complete' ? '✅ Funding Complete!' :
                `Fund Escrow (${deal.totalAmount} Tokens)`
              ) : (
                `Fund Escrow (${deal.totalAmount} Tokens)`
              )}
            </button>
          )}
          {isFunding && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                {fundingStep === 'approve' && !isConfirming && 'Please approve the token spending in MetaMask'}
                {fundingStep === 'approve' && isConfirming && '⏳ Waiting for approval confirmation...'}
                {fundingStep === 'fund' && !isConfirming && 'Approval confirmed! Click button above to fund the escrow'}
                {fundingStep === 'fund' && isConfirming && '⏳ Waiting for funding confirmation...'}
                {fundingStep === 'complete' && 'Transaction complete! Page will refresh shortly'}
              </p>
              
              {/* Debug info and manual skip */}
              {(isConfirming || txHash) && (
                <div className="text-xs text-gray-500 text-center space-y-1">
                  {txHash && <p>TX Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>}
                  <p>Confirming: {isConfirming ? 'Yes' : 'No'} | Confirmed: {isConfirmed ? 'Yes' : 'No'}</p>
                  
                  {isConfirming && (
                    <button 
                      onClick={() => {
                        if (fundingStep === 'approve') {
                          setFundingStep('fund');
                          setTxHash('');
                        } else if (fundingStep === 'fund') {
                          setFundingStep('complete');
                          setTimeout(() => {
                            setIsFunding(false);
                            alert('✅ Manually completed! Refreshing...');
                            window.location.reload();
                          }, 1000);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Skip waiting (if transaction confirmed in MetaMask)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Freelancer's view: Waiting for client to fund
    if (userRole === 'Freelancer' && deal.status === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">⏳ Waiting for client to fund the escrow</p>
          <p className="text-yellow-600 text-sm mt-1">You'll be notified when the client funds the deal and you can start working.</p>
        </div>
      );
    }
    
    // Freelancer's action: Submit work
    if (userRole === 'Freelancer' && deal.status >= 1) {
      // Check if work hasn't been submitted yet (workStatus === 0)
      const canSubmitWork = deal.workStatus === 0;
      
      if (canSubmitWork) {
        return (
          <div className="space-y-4">
            {!showWorkForm ? (
              <button 
                onClick={() => setShowWorkForm(true)}
                disabled={isSubmittingWork}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmittingWork ? 'Submitting Work...' : 'Submit Work'}
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">Submit Your Completed Work</h3>

                {/* Work Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Description / Link to Deliverable:
                  </label>
                  <textarea
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Describe your completed work or provide a link to deliverables..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    onClick={handleSubmitWork}
                    disabled={isSubmittingWork || !workDescription.trim()}
                    className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isSubmittingWork ? 'Submitting...' : 'Submit Work'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowWorkForm(false);
                      setWorkDescription('');
                    }}
                    disabled={isSubmittingWork}
                    className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="text-center text-gray-600 py-4">
            <p>Work has been submitted. Waiting for client approval.</p>
          </div>
        );
      }
    }
    // Client's action: Approve work
    if (userRole === 'Client' && deal.workStatus === 1) {
        return (
          <div className="space-y-4">
            <button 
              onClick={handleApproveWork}
              disabled={isApprovingWork}
              className={`w-full font-bold py-3 px-4 rounded-lg ${
                isApprovingWork
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isApprovingWork ? 'Approving Work...' : `Approve Work & Pay ${deal.totalAmount} Tokens`}
            </button>
            
            {isApprovingWork && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ⏳ Processing approval and payment to freelancer...
                </p>
                {approveWorkTxHash && (
                  <p className="text-xs text-gray-500 mt-1">
                    TX: {approveWorkTxHash.slice(0, 10)}...{approveWorkTxHash.slice(-8)}
                  </p>
                )}
              </div>
            )}
            
            {/* Show work submission details for review */}
            {deal.workSubmission && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">📝 Submitted Work to Review:</h4>
                <p className="text-blue-700 text-sm break-words">{deal.workSubmission}</p>
              </div>
            )}
          </div>
        );
    }
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

        {/* Work Submission Display */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💼 Work Progress</h3>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-700">Project Work</h4>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deal.workStatus === 0 ? 'text-yellow-600 bg-yellow-50' :
                  deal.workStatus === 1 ? 'text-blue-600 bg-blue-50' :
                  deal.workStatus === 2 ? 'text-green-600 bg-green-50' :
                  'text-gray-600 bg-gray-50'
                }`}>
                  {deal.workStatus === 0 ? '⏳ Pending' :
                   deal.workStatus === 1 ? '📝 Submitted' :
                   deal.workStatus === 2 ? '✅ Approved' :
                   '❓ Unknown'}
                </span>
                <span className="text-green-600 font-bold">{deal.totalAmount} Tokens</span>
              </div>
            </div>
            <p className="text-gray-600">{deal.projectDescription}</p>
            
            {/* Show work submission if work is submitted */}
            {deal.workStatus === 1 && deal.workSubmission && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Submitted Work:</p>
                <p className="text-sm text-blue-700 break-words">{deal.workSubmission}</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}