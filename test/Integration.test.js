import { expect } from "chai";
import { network } from "hardhat";

// This test suite verifies that the Post, Comment, and SocialToken contracts work together as expected.
describe("Post and Comment Integration (Refactored)", function () {
  let postContract;
  let commentContract;
  let socialToken;
  let owner;
  let user1;
  let user2;
  let ethers;

  // This hook runs before each test, deploying a fresh set of contracts every time.
  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, user1, user2] = await ethers.getSigners();
    
    // 1. Deploy the SocialToken (dependency)
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    socialToken = await SocialTokenFactory.deploy();

    // 2. Deploy the Post contract, providing the SocialToken's address to its constructor
    const PostFactory = await ethers.getContractFactory("Post");
    postContract = await PostFactory.deploy(await socialToken.getAddress());

    // 3. Deploy the Comment contract
    const CommentFactory = await ethers.getContractFactory("Comment");
    commentContract = await CommentFactory.deploy();
  });

  describe("Full User Workflow", function () {
    it("Should allow a user to create a post, receive a comment, and get a tip", async function () {
      // --- SETUP: Mint tokens to user2 for tipping ---
      const mintAmount = ethers.parseUnits("500", 18);
      await socialToken.connect(owner).mint(user2.address, mintAmount);

      // --- STEP 1: user1 creates a new post ---
      const postContentHash = "QmPostHash_IntegrationTest";
      await expect(postContract.connect(user1).createPost(postContentHash))
        .to.emit(postContract, "PostCreated")
        .withArgs(0, user1.address, postContentHash); // First post will have ID 0

      // Verify post data
      const post = await postContract.posts(0);
      expect(post.author).to.equal(user1.address);
      expect(post.isActive).to.be.true;

      // --- STEP 2: user2 comments on the post ---
      const commentContentHash = "QmCommentHash_IntegrationTest";
      await expect(commentContract.connect(user2).createComment(0, commentContentHash)) // Comment on post ID 0
        .to.emit(commentContract, "CommentCreated")
        .withArgs(0, 0, user2.address); // postId, commentId, author

      // Verify comment data
      const comment = await commentContract.comments(0);
      expect(comment.postId).to.equal(0);
      expect(comment.author).to.equal(user2.address);

      // Verify comment is linked to the post in the Comment contract's mapping
      const postComments = await commentContract.getCommentsByPost(0);
      expect(postComments.length).to.equal(1);
      expect(postComments[0]).to.equal(0); // The commentId

      // --- STEP 3: user2 tips user1's post ---
      const tipAmount = ethers.parseUnits("75", 18);

      // The tipper (user2) must first approve the Post contract to spend their tokens
      await socialToken.connect(user2).approve(await postContract.getAddress(), tipAmount);

      // Now, user2 can tip the post
      await expect(postContract.connect(user2).tipPost(0, tipAmount))
        .to.emit(postContract, "PostTipped")
        .withArgs(0, user2.address, tipAmount);

      // --- STEP 4: Verify the results of the tip ---
      // Check user balances
      const user1Balance = await socialToken.balanceOf(user1.address);
      const user2Balance = await socialToken.balanceOf(user2.address);
      expect(user1Balance).to.equal(tipAmount);
      expect(user2Balance).to.equal(ethers.parseUnits("425", 18)); // 500 - 75

      // Check the post's tipJar
      const tippedPost = await postContract.posts(0);
      expect(tippedPost.tipJar).to.equal(tipAmount);
    });
  });

  describe("Access Control and Deletion", function () {
     beforeEach(async function () {
      // user1 creates post 0
      await postContract.connect(user1).createPost("QmPostToDelete");
      // user2 comments on post 0 with comment 0
      await commentContract.connect(user2).createComment(0, "QmCommentToDelete");
    });
    
    it("Should prevent a user from deleting another user's post", async function () {
      await expect(
        postContract.connect(user2).deletePost(0)
      ).to.be.revertedWith("You are not the author of this post.");
    });

    it("Should prevent a user from deleting another user's comment", async function () {
      await expect(
        commentContract.connect(user1).deleteComment(0)
      ).to.be.revertedWith("You are not the author of this comment.");
    });

    it("Should allow authors to correctly delete their own content", async function () {
      // user2 deletes their comment
      await expect(commentContract.connect(user2).deleteComment(0))
        .to.emit(commentContract, "CommentDeleted").withArgs(0);
      
      const deletedComment = await commentContract.comments(0);
      expect(deletedComment.isActive).to.be.false;

      // user1 deletes their post
      await expect(postContract.connect(user1).deletePost(0))
        .to.emit(postContract, "PostDeleted").withArgs(0);

      const deletedPost = await postContract.posts(0);
      expect(deletedPost.isActive).to.be.false;
    });
  });
});
