pragma solidity ^0.8.28;

contract Post{
    struct Post {
        // Core identification
        uint256 id;                    // Unique post ID
        address author;                // Author's Ethereum address
        string content;                // Post content
        
        // Timestamps
        uint256 createdAt;             // Block timestamp when created
        uint256 updatedAt;             // Block timestamp when last updated
        
        // Content metadata
        string[] imageHashes;          // IPFS hashes for images
        //string[] videoHashes;          // IPFS hashes for videos
        
        // Social interactions
        // uint256 likeCount;             // Number of likes (gas efficient)
        uint256 commentCount;          // Number of comments
        
        // State management
        bool isActive;                // Soft delete flag
        
        // Relationships
        uint256[] commentIds;          // Array of comment IDs
        //address[] likes;       // Array of like addresses
    }
}   