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

    // State variables
    mapping(uint256 => Comment) public comments;
    mapping(address => uint256[]) public userComments;
    mapping(uint256 => uint256[]) public postComments;
    
    uint256 public nextCommentId = 1;
    address public owner;
    
    // Events
    event CommentCreated(uint256 indexed commentId, address indexed author, uint256 indexed postId, string content);
    event CommentUpdated(uint256 indexed commentId, address indexed author, string content);
    event CommentDeleted(uint256 indexed commentId, address indexed author);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthor(uint256 commentId) {
        require(comments[commentId].author == msg.sender, "Not the author");
        _;
    }
    
    modifier commentExists(uint256 commentId) {
        require(comments[commentId].id != 0, "Comment does not exist");
        _;
    }
    
    modifier notDeleted(uint256 commentId) {
        require(!comments[commentId].isDeleted, "Comment is deleted");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Create a new comment
    function createComment(
        uint256 _postId,
        string memory _content
    ) public returns (uint256) {
        uint256 commentId = nextCommentId++;
        
        comments[commentId] = Comment({
            id: commentId,
            author: msg.sender,
            content: _content,
            postId: _postId,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isDeleted: false
        });
        
        userComments[msg.sender].push(commentId);
        postComments[_postId].push(commentId);
        
        emit CommentCreated(commentId, msg.sender, _postId, _content);
        return commentId;
    }
    
    // Update comment content
    function updateComment(
        uint256 _commentId,
        string memory _content
    ) public commentExists(_commentId) onlyAuthor(_commentId) notDeleted(_commentId) {
        comments[_commentId].content = _content;
        comments[_commentId].updatedAt = block.timestamp;
        
        emit CommentUpdated(_commentId, msg.sender, _content);
    }
    
    // Soft delete a comment
    function deleteComment(uint256 _commentId) public commentExists(_commentId) onlyAuthor(_commentId) {
        comments[_commentId].isDeleted = true;
        comments[_commentId].updatedAt = block.timestamp;
        
        emit CommentDeleted(_commentId, msg.sender);
    }
    
    // View functions
    function getComment(uint256 _commentId) public view commentExists(_commentId) returns (Comment memory) {
        return comments[_commentId];
    }
    
    function getUserComments(address _user) public view returns (uint256[] memory) {
        return userComments[_user];
    }
    
    function getPostComments(uint256 _postId) public view returns (uint256[] memory) {
        return postComments[_postId];
    }
    
    function getTotalComments() public view returns (uint256) {
        return nextCommentId - 1;
    }
    
    function isCommentDeleted(uint256 _commentId) public view commentExists(_commentId) returns (bool) {
        return comments[_commentId].isDeleted;
    }
    
    // Get comments for a post with pagination
    function getPostCommentsPaginated(
        uint256 _postId,
        uint256 _offset,
        uint256 _limit
    ) public view returns (uint256[] memory) {
        uint256[] memory allComments = postComments[_postId];
        uint256 length = allComments.length;
        
        if (_offset >= length) {
            return new uint256[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > length) {
            end = length;
        }
        
        uint256[] memory result = new uint256[](end - _offset);
        for (uint i = _offset; i < end; i++) {
            result[i - _offset] = allComments[i];
        }
        
        return result;
    }
}   