pragma solidity ^0.8.28;

contract Post{
    struct PostData {
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

    // State variables
    mapping(uint256 => PostData) public posts;
    mapping(address => uint256[]) public userPosts;
    
    uint256 public nextPostId = 1;
    address public owner;
    
    // Events
    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event PostUpdated(uint256 indexed postId, address indexed author, string content);
    event PostDeleted(uint256 indexed postId, address indexed author);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthor(uint256 postId) {
        require(posts[postId].author == msg.sender, "Not the author");
        _;
    }
    
    modifier postExists(uint256 postId) {
        require(posts[postId].id != 0, "Post does not exist");
        _;
    }
    
    modifier isActive(uint256 postId) {
        require(posts[postId].isActive, "Post is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Create a new post
    function createPost(
        string memory _content,
        string[] memory _imageHashes
    ) public returns (uint256) {
        uint256 postId = nextPostId++;
        
        posts[postId] = PostData({
            id: postId,
            author: msg.sender,
            content: _content,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            imageHashes: _imageHashes,
            commentCount: 0,
            isActive: true,
            commentIds: new uint256[](0)
        });
        
        userPosts[msg.sender].push(postId);
        
        emit PostCreated(postId, msg.sender, _content);
        return postId;
    }
    
    // Update post content
    function updatePost(
        uint256 _postId,
        string memory _content,
        string[] memory _imageHashes
    ) public postExists(_postId) onlyAuthor(_postId) isActive(_postId) {
        posts[_postId].content = _content;
        posts[_postId].imageHashes = _imageHashes;
        posts[_postId].updatedAt = block.timestamp;
        
        emit PostUpdated(_postId, msg.sender, _content);
    }
    
    // Soft delete a post
    function deletePost(uint256 _postId) public postExists(_postId) onlyAuthor(_postId) {
        posts[_postId].isActive = false;
        posts[_postId].updatedAt = block.timestamp;
        
        emit PostDeleted(_postId, msg.sender);
    }
    
    // Add comment to post
    function addComment(uint256 _postId, uint256 _commentId) public postExists(_postId) isActive(_postId) {
        posts[_postId].commentIds.push(_commentId);
        posts[_postId].commentCount++;
        
        emit CommentAdded(_postId, _commentId);
    }
    
    // View functions
    function getPost(uint256 _postId) public view postExists(_postId) returns (PostData memory) {
        return posts[_postId];
    }
    
    function getUserPosts(address _user) public view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    function getPostCommentIds(uint256 _postId) public view postExists(_postId) returns (uint256[] memory) {
        return posts[_postId].commentIds;
    }
    
    function getTotalPosts() public view returns (uint256) {
        return nextPostId - 1;
    }
    
    function isPostActive(uint256 _postId) public view postExists(_postId) returns (bool) {
        return posts[_postId].isActive;
    }
}   