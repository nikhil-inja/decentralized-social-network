// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the standard ERC20 interface to allow this contract to interact with our token.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Post (Refactored)
 * @dev This version combines the best features of both designs: the modular, gas-efficient
 * architecture of our plan with the enhanced features (updating, user post mapping)
 * from your partner's contribution. It manages the creation, updating, and tipping of posts.
 */
contract Post {
    // --- State Variables ---

    IERC20 public socialToken; // The interface to interact with our SocialToken contract.

    struct PostData {
        uint256 postId;
        address author;
        string contentHash;     // CRITICAL: We store a hash of the content, not the content itself.
        uint256 createdAt;      // Renamed from 'timestamp' for clarity.
        uint256 updatedAt;      // NEW: A great feature from your partner's contract.
        uint256 tipJar;         // Total SocialToken this post has received.
        bool isActive;
    }

    // The primary storage for all posts.
    PostData[] public posts;

    // NEW: An efficient mapping to look up all posts by a user. A great feature.
    mapping(address => uint256[]) public userPosts;

    // --- Events ---

    event PostCreated(uint256 indexed postId, address indexed author, string contentHash);
    event PostUpdated(uint256 indexed postId, string newContentHash); // NEW
    event PostDeleted(uint256 indexed postId);
    event PostTipped(uint256 indexed postId, address indexed tipper, uint256 amount);


    // --- Modifiers ---
    // Using modifiers makes our functions cleaner and safer, a great pattern from your partner's code.

    modifier postExists(uint256 _postId) {
        require(_postId < posts.length, "Post does not exist.");
        _;
    }

    modifier onlyAuthor(uint256 _postId) {
        require(posts[_postId].author == msg.sender, "You are not the author of this post.");
        _;
    }

    modifier isActive(uint256 _postId) {
        require(posts[_postId].isActive, "Post is not active.");
        _;
    }

    // --- Functions ---

    /**
     * @dev The constructor sets the address of the deployed SocialToken contract.
     */
    constructor(address _tokenAddress) {
        socialToken = IERC20(_tokenAddress);
    }

    /**
     * @dev Creates a new post.
     * @param _contentHash The IPFS hash of the post content.
     */
    function createPost(string memory _contentHash) public {
        uint256 postId = posts.length;
        posts.push(PostData({
            postId: postId,
            author: msg.sender,
            contentHash: _contentHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            tipJar: 0,
            isActive: true
        }));

        // Add the new postId to the list of posts for that user.
        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _contentHash);
    }

    /**
     * @dev NEW: Allows the original author to update their post.
     * @param _postId The ID of the post to update.
     * @param _newContentHash The new IPFS hash for the updated content.
     */
    function updatePost(uint256 _postId, string memory _newContentHash) public postExists(_postId) onlyAuthor(_postId) isActive(_postId) {
        PostData storage post = posts[_postId];
        post.contentHash = _newContentHash;
        post.updatedAt = block.timestamp;
        emit PostUpdated(_postId, _newContentHash);
    }

    /**
     * @dev Allows a user to tip a post with SocialToken.
     * The user must have first called `approve()` on the SocialToken contract.
     */
    function tipPost(uint256 _postId, uint256 _amount) public postExists(_postId) isActive(_postId) {
        require(_amount > 0, "Tip amount must be greater than zero.");

        PostData storage post = posts[_postId];

        // This contract calls the token contract to transfer the approved amount.
        bool success = socialToken.transferFrom(msg.sender, post.author, _amount);
        require(success, "Token transfer failed. Check your approval.");

        post.tipJar += _amount;
        emit PostTipped(_postId, msg.sender, _amount);
    }

    /**
     * @dev Allows the original author to soft-delete their post.
     */
    function deletePost(uint256 _postId) public postExists(_postId) onlyAuthor(_postId) {
        posts[_postId].isActive = false;
        posts[_postId].updatedAt = block.timestamp;
        emit PostDeleted(_postId);
    }


    // --- View Functions ---

    /**
     * @dev Gets the total number of posts, useful for frontend logic.
     */
    function postCount() public view returns (uint256) {
        return posts.length;
    }

    /**
     * @dev NEW: Gets all post IDs for a specific user.
     */
    function getPostsByUser(address _user) public view returns (uint256[] memory) {
        return userPosts[_user];
    }
}

