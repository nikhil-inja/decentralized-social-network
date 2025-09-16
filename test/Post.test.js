import { expect } from "chai";
import { network } from "hardhat";

describe("Post Contract", function () {
  let postContract;
  let owner;
  let addr1;
  let addr2;
  let ethers;

  // This hook runs once before all tests in this block
  before(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, addr1, addr2] = await ethers.getSigners();
    const PostFactory = await ethers.getContractFactory("Post");
    postContract = await PostFactory.deploy();
  });

  describe("Post Creation", function () {
    it("Should allow a user to create a post", async function () {
      const testContent = "This is my first post!";
      const testImageHashes = ["QmImageHash1", "QmImageHash2"];

      // Create post and check for event emission
      await expect(postContract.connect(addr1).createPost(testContent, testImageHashes))
        .to.emit(postContract, "PostCreated")
        .withArgs(1, addr1.address, testContent);

      // Verify post data
      const post = await postContract.getPost(1);
      expect(post.id).to.equal(1);
      expect(post.author).to.equal(addr1.address);
      expect(post.content).to.equal(testContent);
      expect(post.imageHashes).to.deep.equal(testImageHashes);
      expect(post.commentCount).to.equal(0);
      expect(post.isActive).to.be.true;
    });

    it("Should increment post ID for each new post", async function () {
      const testContent = "Second post";
      const testImageHashes = ["QmImageHash3"];

      await postContract.connect(addr2).createPost(testContent, testImageHashes);

      const post = await postContract.getPost(2);
      expect(post.id).to.equal(2);
      expect(post.author).to.equal(addr2.address);
    });

    it("Should track user posts correctly", async function () {
      const userPosts = await postContract.getUserPosts(addr1.address);
      expect(userPosts).to.deep.equal([1]);

      const user2Posts = await postContract.getUserPosts(addr2.address);
      expect(user2Posts).to.deep.equal([2]);
    });
  });

  describe("Post Updates", function () {
    it("Should allow author to update their post", async function () {
      const newContent = "Updated post content";
      const newImageHashes = ["QmNewImageHash"];

      await expect(postContract.connect(addr1).updatePost(1, newContent, newImageHashes))
        .to.emit(postContract, "PostUpdated")
        .withArgs(1, addr1.address, newContent);

      const post = await postContract.getPost(1);
      expect(post.content).to.equal(newContent);
      expect(post.imageHashes).to.deep.equal(newImageHashes);
      expect(post.updatedAt).to.be.greaterThan(post.createdAt);
    });

    it("Should not allow non-author to update post", async function () {
      const newContent = "Unauthorized update";
      const newImageHashes = ["QmUnauthorizedHash"];

      await expect(
        postContract.connect(addr2).updatePost(1, newContent, newImageHashes)
      ).to.be.revertedWith("Not the author");
    });

    it("Should not allow updating non-existent post", async function () {
      const newContent = "Update non-existent";
      const newImageHashes = ["QmHash"];

      await expect(
        postContract.connect(addr1).updatePost(999, newContent, newImageHashes)
      ).to.be.revertedWith("Post does not exist");
    });
  });

  describe("Post Deletion", function () {
    it("Should allow author to delete their post", async function () {
      await expect(postContract.connect(addr1).deletePost(1))
        .to.emit(postContract, "PostDeleted")
        .withArgs(1, addr1.address);

      const post = await postContract.getPost(1);
      expect(post.isActive).to.be.false;
    });

    it("Should not allow non-author to delete post", async function () {
      await expect(
        postContract.connect(addr2).deletePost(2)
      ).to.be.revertedWith("Not the author");
    });

    it("Should not allow operations on deleted posts", async function () {
      const newContent = "Try to update deleted post";
      const newImageHashes = ["QmHash"];

      await expect(
        postContract.connect(addr1).updatePost(1, newContent, newImageHashes)
      ).to.be.revertedWith("Post is not active");
    });
  });

  describe("Comment Management", function () {
    it("Should allow adding comments to active posts", async function () {
      await expect(postContract.connect(addr1).addComment(2, 101))
        .to.emit(postContract, "CommentAdded")
        .withArgs(2, 101);

      const post = await postContract.getPost(2);
      expect(post.commentCount).to.equal(1);
      expect(post.commentIds).to.deep.equal([101]);
    });

    it("Should not allow adding comments to deleted posts", async function () {
      await expect(
        postContract.connect(addr1).addComment(1, 102)
      ).to.be.revertedWith("Post is not active");
    });

    it("Should track multiple comments correctly", async function () {
      await postContract.connect(addr2).addComment(2, 103);
      
      const post = await postContract.getPost(2);
      expect(post.commentCount).to.equal(2);
      expect(post.commentIds).to.deep.equal([101, 103]);
    });
  });

  describe("View Functions", function () {
    it("Should return correct post data", async function () {
      const post = await postContract.getPost(2);
      expect(post.id).to.equal(2);
      expect(post.author).to.equal(addr2.address);
      expect(post.isActive).to.be.true;
    });

    it("Should return user posts correctly", async function () {
      const userPosts = await postContract.getUserPosts(addr2.address);
      expect(userPosts).to.deep.equal([2]);
    });

    it("Should return post comment IDs", async function () {
      const commentIds = await postContract.getPostCommentIds(2);
      expect(commentIds).to.deep.equal([101, 103]);
    });

    it("Should return total posts count", async function () {
      const totalPosts = await postContract.getTotalPosts();
      expect(totalPosts).to.equal(2);
    });

    it("Should check if post is active", async function () {
      const isActive = await postContract.isPostActive(2);
      expect(isActive).to.be.true;

      const isDeletedActive = await postContract.isPostActive(1);
      expect(isDeletedActive).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should set correct owner", async function () {
      const contractOwner = await postContract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("Should not allow operations on non-existent posts", async function () {
      await expect(
        postContract.getPost(999)
      ).to.be.revertedWith("Post does not exist");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty image hashes array", async function () {
      const testContent = "Post with no images";
      const emptyImageHashes = [];

      await postContract.connect(addr1).createPost(testContent, emptyImageHashes);

      const post = await postContract.getPost(3);
      expect(post.imageHashes).to.deep.equal([]);
    });

    it("Should handle empty content", async function () {
      const emptyContent = "";
      const testImageHashes = ["QmHash"];

      await postContract.connect(addr2).createPost(emptyContent, testImageHashes);

      const post = await postContract.getPost(4);
      expect(post.content).to.equal("");
    });
  });
});
