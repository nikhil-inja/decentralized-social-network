import { expect } from "chai";
import { network } from "hardhat";

describe("Comment (Refactored)", function () {
  let commentContract;
  let owner;
  let author1;
  let author2;
  let ethers;

  beforeEach(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, author1, author2] = await ethers.getSigners();
    const CommentFactory = await ethers.getContractFactory("Comment");
    commentContract = await CommentFactory.deploy();
  });

  describe("Comment Creation", function () {
    it("Should allow a user to create a comment", async function () {
      const postId = 1;
      const contentHash = "QmFirstCommentHash";

      // The first comment will have an ID of 0.
      await expect(commentContract.connect(author1).createComment(postId, contentHash))
        .to.emit(commentContract, "CommentCreated")
        .withArgs(postId, 0, author1.address);

      const comment = await commentContract.comments(0);
      expect(comment.commentId).to.equal(0);
      expect(comment.postId).to.equal(postId);
      expect(comment.author).to.equal(author1.address);
      expect(comment.contentHash).to.equal(contentHash);
      expect(comment.isActive).to.be.true;
    });

    it("Should correctly update userComments and postComments mappings", async function () {
      // author1 comments on post 1
      await commentContract.connect(author1).createComment(1, "QmHash1"); // Comment ID 0
      // author2 comments on post 1
      await commentContract.connect(author2).createComment(1, "QmHash2"); // Comment ID 1
      // author1 comments on post 2
      await commentContract.connect(author1).createComment(2, "QmHash3"); // Comment ID 2

      // Check author1's comments
      const author1Comments = await commentContract.getCommentsByUser(author1.address);
      expect(author1Comments.length).to.equal(2);
      expect(author1Comments[0]).to.equal(0);
      expect(author1Comments[1]).to.equal(2);

      // Check post 1's comments
      const post1Comments = await commentContract.getCommentsByPost(1);
      expect(post1Comments.length).to.equal(2);
      expect(post1Comments[0]).to.equal(0);
      expect(post1Comments[1]).to.equal(1);
    });
  });

  describe("Comment Updates and Deletion", function () {
    beforeEach(async function () {
      // author1 creates comment 0 on post 1
      await commentContract.connect(author1).createComment(1, "QmOriginalHash");
    });

    it("Should allow the author to update their comment", async function () {
      const newContentHash = "QmUpdatedHash";
      await expect(commentContract.connect(author1).updateComment(0, newContentHash))
        .to.emit(commentContract, "CommentUpdated")
        .withArgs(0);

      const updatedComment = await commentContract.comments(0);
      expect(updatedComment.contentHash).to.equal(newContentHash);
    });

    it("Should NOT allow a non-author to update a comment", async function () {
      await expect(
        commentContract.connect(author2).updateComment(0, "QmFakeHash")
      ).to.be.revertedWith("You are not the author of this comment.");
    });

    it("Should allow the author to delete their comment", async function () {
      await expect(commentContract.connect(author1).deleteComment(0))
        .to.emit(commentContract, "CommentDeleted")
        .withArgs(0);
      
      const comment = await commentContract.comments(0);
      expect(comment.isActive).to.be.false;
    });

    it("Should NOT allow a non-author to delete a comment", async function () {
      await expect(
        commentContract.connect(author2).deleteComment(0)
      ).to.be.revertedWith("You are not the author of this comment.");
    });
    
    it("Should prevent updating a deleted comment", async function(){
        await commentContract.connect(author1).deleteComment(0);

        await expect(
            commentContract.connect(author1).updateComment(0, "QmTryingToUpdateDeleted")
        ).to.be.revertedWith("Comment is not active.");
    });
  });
});

