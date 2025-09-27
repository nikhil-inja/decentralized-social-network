// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowSimple (Single Milestone)
 * @dev Simplified escrow contract with single milestone for faster development
 */
contract EscrowSimple is ReentrancyGuard {
    // --- State Variables ---

    IERC20 public immutable token;
    address public immutable client;
    address public immutable freelancer;
    address public immutable arbiter;

    enum AgreementStatus { CREATED, FUNDED, IN_PROGRESS, COMPLETED, DISPUTED }
    AgreementStatus public currentStatus;

    enum WorkStatus { PENDING, SUBMITTED, APPROVED }
    WorkStatus public workStatus;

    uint256 public totalAmount;
    string public projectDescription;
    string public workSubmission; // URL or description of completed work

    // --- Events ---

    event AgreementFunded(uint256 amount);
    event WorkSubmitted(string workSubmission);
    event WorkApproved(uint256 amount);
    event DisputeRaised(address indexed raisedBy);
    event DisputeResolved(address indexed winner, uint256 amount);

    // --- Modifiers ---

    modifier onlyClient() { 
        require(msg.sender == client, "ESCROW: Caller is not the client"); 
        _; 
    }
    
    modifier onlyFreelancer() { 
        require(msg.sender == freelancer, "ESCROW: Caller is not the freelancer"); 
        _; 
    }
    
    modifier onlyArbiter() { 
        require(msg.sender == arbiter, "ESCROW: Caller is not the arbiter"); 
        _; 
    }
    
    modifier inState(AgreementStatus _status) { 
        require(currentStatus == _status, "ESCROW: Invalid agreement state"); 
        _; 
    }

    // --- Functions ---

    constructor(
        address _client,
        address _freelancer,
        address _arbiter,
        address _tokenAddress,
        uint256 _amount,
        string memory _projectDescription
    ) {
        require(_client != address(0) && _freelancer != address(0), "ESCROW: Invalid participant address");
        require(_amount > 0, "ESCROW: Amount must be greater than zero");
        
        client = _client;
        freelancer = _freelancer;
        arbiter = _arbiter;
        token = IERC20(_tokenAddress);
        totalAmount = _amount;
        projectDescription = _projectDescription;
        currentStatus = AgreementStatus.CREATED;
        workStatus = WorkStatus.PENDING;
    }

    function fundEscrow() external onlyClient inState(AgreementStatus.CREATED) nonReentrant {
        require(token.allowance(client, address(this)) >= totalAmount, "ESCROW: Check token approval amount");
        token.transferFrom(client, address(this), totalAmount);
        currentStatus = AgreementStatus.FUNDED;
        emit AgreementFunded(totalAmount);
    }

    function submitWork(string memory _workSubmission) external onlyFreelancer {
        require(
            currentStatus == AgreementStatus.FUNDED || currentStatus == AgreementStatus.IN_PROGRESS, 
            "ESCROW: Agreement not active"
        );
        require(workStatus == WorkStatus.PENDING, "ESCROW: Work already submitted");
        
        workStatus = WorkStatus.SUBMITTED;
        workSubmission = _workSubmission;
        
        if (currentStatus == AgreementStatus.FUNDED) {
            currentStatus = AgreementStatus.IN_PROGRESS;
        }
        
        emit WorkSubmitted(_workSubmission);
    }

    function approveWork() external onlyClient nonReentrant {
        require(workStatus == WorkStatus.SUBMITTED, "ESCROW: Work not submitted or already approved");
        
        workStatus = WorkStatus.APPROVED;
        currentStatus = AgreementStatus.COMPLETED;
        
        token.transfer(freelancer, totalAmount);
        emit WorkApproved(totalAmount);
    }
    
    function raiseDispute() external {
        require(msg.sender == client || msg.sender == freelancer, "ESCROW: Not a party to the agreement");
        require(currentStatus != AgreementStatus.DISPUTED, "ESCROW: Dispute already raised");
        require(currentStatus != AgreementStatus.COMPLETED, "ESCROW: Cannot dispute completed agreement");
        
        currentStatus = AgreementStatus.DISPUTED;
        emit DisputeRaised(msg.sender);
    }

    function resolveDispute(address _winner) external onlyArbiter inState(AgreementStatus.DISPUTED) nonReentrant {
        require(_winner == client || _winner == freelancer, "ESCROW: Winner must be client or freelancer");
        
        currentStatus = AgreementStatus.COMPLETED;
        token.transfer(_winner, totalAmount);
        emit DisputeResolved(_winner, totalAmount);
    }

    // --- View Functions ---

    function getProjectDetails() external view returns (
        address _client,
        address _freelancer,
        address _arbiter,
        uint256 _totalAmount,
        string memory _projectDescription,
        AgreementStatus _currentStatus,
        WorkStatus _workStatus,
        string memory _workSubmission
    ) {
        return (
            client,
            freelancer,
            arbiter,
            totalAmount,
            projectDescription,
            currentStatus,
            workStatus,
            workSubmission
        );
    }
}
