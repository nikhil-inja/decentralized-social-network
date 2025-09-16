pragma solidity ^0.8.28;

contract Comment{
    struct Comment {
        // Core identification
        uint256 id;                    // Unique comment ID
        address author;                // Commenter's Ethereum address
        string content;                // Comment content
        
        // Relationships
        uint256 postId;                // ID of the post being commented on
        
        // Timestamps
        uint256 createdAt;             // Block timestamp when created
        uint256 updatedAt;             // Block timestamp when last updated
        
        // Social interactions
        //uint256 likeCount;             // Number of likes
        
        // State management
        bool isDeleted;                // Soft delete flag
    }
}   