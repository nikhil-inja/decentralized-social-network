import { expect } from "chai";
import { network } from "hardhat";

describe("Post (Refactored)", function () {
  let socialToken;
  let postContract;
  let owner;
  let author1;
  let tipper1;

  let ethers;

  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, author1, tipper1] = await ethers.getSigners();

    // 1. Deploy the dependency contract: SocialToken
    const SocialTokenFactory = await ethers.getContractFactory("SocialToken");
    socialToken = await SocialTokenFactory.deploy();

    // 2. Deploy the Post contract, providing the token's address to its constructor
    const PostFactory = await ethers.getContractFactory("Post");
    postContract = await PostFactory.deploy(await socialToken.getAddress());
  });

  describe("Post Creation and Updates", function () {
    it("Should allow a user to create a post", async function () {
      const contentHash = "QmContentHash1";
      // The first post ID will be 0
      await expect(postContract.connect(author1).createPost(contentHash))
        .to.emit(postContract, "PostCreated")
        .withArgs(0, author1.address, contentHash);

      const post = await postContract.posts(0);
      expect(post.author).to.equal(author1.address);
      expect(post.contentHash).to.equal(contentHash);
      expect(post.isActive).to.be.true;
    });

    it("Should add the post ID to the user's post list", async function () {
        await postContract.connect(author1).createPost("QmContentHash1"); // Post ID 0
        await postContract.connect(author1).createPost("QmContentHash2"); // Post ID 1
        
        const userPosts = await postContract.getPostsByUser(author1.address);
        expect(userPosts.length).to.equal(2);
        expect(userPosts[0]).to.equal(0);
        expect(userPosts[1]).to.equal(1);
    });

    it("Should allow the author to update their post", async function () {
      await postContract.connect(author1).createPost("QmOriginalHash");
      const newContentHash = "QmNewContentHash";

      await expect(postContract.connect(author1).updatePost(0, newContentHash))
        .to.emit(postContract, "PostUpdated")
        .withArgs(0, newContentHash);

      const updatedPost = await postContract.posts(0);
      expect(updatedPost.contentHash).to.equal(newContentHash);
    });
  });

  describe("Post Deletion", function () {
     beforeEach(async function () {
      await postContract.connect(author1).createPost("QmContentHash1");
    });
    
    it("Should allow the author to delete their post", async function () {
      await expect(postContract.connect(author1).deletePost(0))
        .to.emit(postContract, "PostDeleted")
        .withArgs(0);

      const post = await postContract.posts(0);
      expect(post.isActive).to.be.false;
    });

    it("Should NOT allow a non-author to delete a post", async function () {
      await expect(
        postContract.connect(tipper1).deletePost(0)
      ).to.be.revertedWith("You are not the author of this post.");
    });
  });

  describe("Tipping", function () {
    beforeEach(async function () {
      // author1 creates a post (ID 0)
      await postContract.connect(author1).createPost("QmPostToTip");
      
      // The owner mints 1000 tokens to tipper1
      const mintAmount = ethers.parseUnits("1000", 18);
      await socialToken.connect(owner).mint(tipper1.address, mintAmount);
    });

    it("Should allow a user to tip a post after approving the token transfer", async function () {
      const tipAmount = ethers.parseUnits("150", 18);

      // Step 1: tipper1 must approve the Post contract to spend its tokens
      await socialToken.connect(tipper1).approve(await postContract.getAddress(), tipAmount);
      
      // Step 2: tipper1 calls the tipPost function
      await expect(postContract.connect(tipper1).tipPost(0, tipAmount))
        .to.emit(postContract, "PostTipped")
        .withArgs(0, tipper1.address, tipAmount);

      // Check balances after the tip
      const authorBalance = await socialToken.balanceOf(author1.address);
      const tipperBalance = await socialToken.balanceOf(tipper1.address);
      expect(authorBalance).to.equal(tipAmount);
      expect(tipperBalance).to.equal(ethers.parseUnits("850", 18)); // 1000 - 150

      // Check that the post's tipJar was updated
      const post = await postContract.posts(0);
      expect(post.tipJar).to.equal(tipAmount);
    });

    it("Should fail if a user tries to tip without prior approval", async function () {
      const tipAmount = ethers.parseUnits("100", 18);
      
      // We skip the approve() step. The underlying ERC20 contract will revert with
      // a custom error. We check for that specific error from the `socialToken` contract.
      await expect(
        postContract.connect(tipper1).tipPost(0, tipAmount)
      ).to.be.revertedWithCustomError(socialToken, "ERC20InsufficientAllowance");
    });
  });
});

