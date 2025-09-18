// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @dev A smart contract to manage a single, milestone-based freelance agreement
 * between a client, a freelancer, and an arbiter. Funds are held in escrow and
 * released programmatically as milestones are approved.
 */
contract Escrow is ReentrancyGuard {
    // --- State Variables ---

    IERC20 public immutable token; // The ERC20 token for payments (e.g., USDC)
    address public immutable client;
    address public immutable freelancer;
    address public immutable arbiter;

    enum AgreementStatus { CREATED, FUNDED, IN_PROGRESS, DISPUTED, COMPLETED, CANCELED }
    AgreementStatus public currentStatus;

    enum MilestoneStatus { PENDING, SUBMITTED, APPROVED }
    struct Milestone {
        uint256 payoutAmount;
        string detailsHash; // IPFS hash of milestone requirements
        string workHash;    // IPFS hash of submitted work
        MilestoneStatus state;
    }

    Milestone[] public milestones;
    uint256 public totalAmount; // Total value of the contract

    // --- Events ---

    event AgreementFunded(uint256 amount);
    event WorkSubmitted(uint256 indexed milestoneId, string workHash);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 amount);
    event DisputeRaised(uint256 indexed milestoneId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed milestoneId, address indexed winner, uint256 amount);

    // --- Modifiers ---

    modifier onlyClient() { require(msg.sender == client, "ESCROW: Caller is not the client"); _; }
    modifier onlyFreelancer() { require(msg.sender == freelancer, "ESCROW: Caller is not the freelancer"); _; }
    modifier onlyArbiter() { require(msg.sender == arbiter, "ESCROW: Caller is not the arbiter"); _; }
    modifier inState(AgreementStatus _status) { require(currentStatus == _status, "ESCROW: Invalid agreement state"); _; }

    // --- Functions ---

    constructor(
        address _client,
        address _freelancer,
        address _arbiter,
        address _tokenAddress,
        uint256[] memory _payouts,
        string[] memory _detailsHashes
    ) {
        require(_client != address(0) && _freelancer != address(0), "ESCROW: Invalid participant address");
        require(_payouts.length == _detailsHashes.length, "ESCROW: Input array lengths must match");
        
        client = _client;
        freelancer = _freelancer;
        arbiter = _arbiter;
        token = IERC20(_tokenAddress);
        currentStatus = AgreementStatus.CREATED;

        for (uint i = 0; i < _payouts.length; i++) {
            require(_payouts[i] > 0, "ESCROW: Payout must be greater than zero");
            milestones.push(Milestone({
                payoutAmount: _payouts[i],
                detailsHash: _detailsHashes[i],
                workHash: "",
                state: MilestoneStatus.PENDING
            }));
            totalAmount += _payouts[i];
        }
    }

    /**
     * @dev Called by the client to fund the total amount of the agreement.
     * The client must have already approved this contract to spend the totalAmount of tokens.
     */
    function fundEscrow() external onlyClient inState(AgreementStatus.CREATED) nonReentrant {
        uint256 currentAllowance = token.allowance(client, address(this));
        require(currentAllowance >= totalAmount, "ESCROW: Check token approval amount");

        bool success = token.transferFrom(client, address(this), totalAmount);
        require(success, "ESCROW: Token transfer failed");

        currentStatus = AgreementStatus.FUNDED;
        emit AgreementFunded(totalAmount);
    }

    /**
     * @dev Called by the freelancer to submit their work for a specific milestone.
     */
    function submitWork(uint256 _milestoneId, string memory _workHash) external onlyFreelancer {
        require(currentStatus == AgreementStatus.FUNDED || currentStatus == AgreementStatus.IN_PROGRESS, "ESCROW: Agreement not active");
        require(_milestoneId < milestones.length, "ESCROW: Invalid milestone ID");
        require(milestones[_milestoneId].state == MilestoneStatus.PENDING, "ESCROW: Work already submitted");

        milestones[_milestoneId].state = MilestoneStatus.SUBMITTED;
        milestones[_milestoneId].workHash = _workHash;
        emit WorkSubmitted(_milestoneId, _workHash);
    }

    /**
     * @dev Called by the client to approve a milestone and release payment.
     */
    function approveMilestone(uint256 _milestoneId) external onlyClient nonReentrant {
        require(currentStatus == AgreementStatus.FUNDED || currentStatus == AgreementStatus.IN_PROGRESS, "ESCROW: Agreement not active");
        require(_milestoneId < milestones.length, "ESCROW: Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.state == MilestoneStatus.SUBMITTED, "ESCROW: Work not submitted or already approved");

        milestone.state = MilestoneStatus.APPROVED;
        
        if (currentStatus == AgreementStatus.FUNDED) {
            currentStatus = AgreementStatus.IN_PROGRESS;
        }
        
        emit MilestoneApproved(_milestoneId, milestone.payoutAmount);
        token.transfer(freelancer, milestone.payoutAmount);

        _checkCompletion();
    }

    /**
     * @dev Allows either party to raise a dispute, locking the contract until the arbiter intervenes.
     */
    function raiseDispute(uint256 _milestoneId) external {
        require(msg.sender == client || msg.sender == freelancer, "ESCROW: Not a party to the agreement");
        require(currentStatus != AgreementStatus.DISPUTED, "ESCROW: Dispute already raised");

        currentStatus = AgreementStatus.DISPUTED;
        emit DisputeRaised(_milestoneId, msg.sender);
    }

    /**
     * @dev Called by the arbiter to resolve a dispute and release funds for a single milestone.
     */
    function resolveDispute(uint256 _milestoneId, address _winner) external onlyArbiter inState(AgreementStatus.DISPUTED) nonReentrant {
        require(_winner == client || _winner == freelancer, "ESCROW: Winner must be client or freelancer");
        require(_milestoneId < milestones.length, "ESCROW: Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.state != MilestoneStatus.APPROVED, "ESCROW: Milestone already approved and paid");

        // Mark as approved to prevent further actions on it
        milestone.state = MilestoneStatus.APPROVED;
        
        currentStatus = AgreementStatus.IN_PROGRESS;

        emit DisputeResolved(_milestoneId, _winner, milestone.payoutAmount);
        token.transfer(_winner, milestone.payoutAmount);

        _checkCompletion();
    }

    /**
     * @dev Internal function to check if all milestones are approved and complete the agreement.
     */
    function _checkCompletion() private {
        for(uint i = 0; i < milestones.length; i++) {
            if(milestones[i].state != MilestoneStatus.APPROVED) {
                return; // Not all are approved yet
            }
        }
        currentStatus = AgreementStatus.COMPLETED;
    }
}
