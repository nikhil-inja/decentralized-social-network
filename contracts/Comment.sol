// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Comment (Refactored)
 * @dev Manages comments on posts. This version is gas-efficient by storing
 * comment content on IPFS and includes advanced view functions for frontend convenience.
 */
contract Comment {
    // --- State Variables ---

    struct CommentData {
        uint256 commentId;
        uint256 postId;         // The ID of the post this comment belongs to.
        address author;         // Renamed from 'commenter' for consistency.
        string contentHash;     // CRITICAL: We store a hash of the content, not the content itself.
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;          // Renamed from 'isDeleted' for consistency with Post.sol
    }

    // The primary storage for all comments.
    CommentData[] public comments;

    // Mappings for efficient lookups, a great feature from the provided contract.
    mapping(address => uint256[]) public userComments;
    mapping(uint256 => uint256[]) public postComments;


    // --- Events ---

    event CommentCreated(uint256 indexed postId, uint256 indexed commentId, address indexed author);
    event CommentUpdated(uint256 indexed commentId);
    event CommentDeleted(uint256 indexed commentId);


    // --- Modifiers ---

    modifier commentExists(uint256 _commentId) {
        require(_commentId < comments.length, "Comment does not exist.");
        _;
    }

    modifier onlyAuthor(uint256 _commentId) {
        require(comments[_commentId].author == msg.sender, "You are not the author of this comment.");
        _;
    }


    // --- Functions ---

    /**
     * @dev Creates a new comment for a specific post.
     * @param _postId The ID of the post to comment on.
     * @param _contentHash The IPFS hash of the comment content.
     */
    function createComment(uint256 _postId, string memory _contentHash) public {
        uint256 commentId = comments.length;

        comments.push(CommentData({
            commentId: commentId,
            postId: _postId,
            author: msg.sender,
            contentHash: _contentHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        }));

        // Link the new comment to both the user and the post.
        userComments[msg.sender].push(commentId);
        postComments[_postId].push(commentId);

        emit CommentCreated(_postId, commentId, msg.sender);
    }

    /**
     * @dev Allows the original author to update their comment.
     * @param _commentId The ID of the comment to update.
     * @param _newContentHash The new IPFS hash for the updated content.
     */
    function updateComment(uint256 _commentId, string memory _newContentHash) public commentExists(_commentId) onlyAuthor(_commentId) {
        CommentData storage commentToUpdate = comments[_commentId];
        require(commentToUpdate.isActive, "Comment is not active.");

        commentToUpdate.contentHash = _newContentHash;
        commentToUpdate.updatedAt = block.timestamp;

        emit CommentUpdated(_commentId);
    }

    /**
     * @dev Allows the original author to soft-delete their comment.
     */
    function deleteComment(uint256 _commentId) public commentExists(_commentId) onlyAuthor(_commentId) {
        comments[_commentId].isActive = false;
        comments[_commentId].updatedAt = block.timestamp;

        emit CommentDeleted(_commentId);
    }

    // --- View Functions ---

    /**
     * @dev Gets all comment IDs for a specific post. A great feature for the frontend.
     */
    function getCommentsByPost(uint256 _postId) public view returns (uint256[] memory) {
        return postComments[_postId];
    }

    /**
     * @dev Gets all comment IDs for a specific user.
     */
    function getCommentsByUser(address _user) public view returns (uint256[] memory) {
        return userComments[_user];
    }
}

