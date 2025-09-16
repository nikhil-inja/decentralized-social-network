import { expect } from "chai";
import { network } from "hardhat";

describe("Comment Contract", function () {
  let commentContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let ethers;

  // This hook runs once before all tests in this block
  before(async function () {
    const { ethers: ethersInstance } = await network.connect();
    ethers = ethersInstance;
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const CommentFactory = await ethers.getContractFactory("Comment");
    commentContract = await CommentFactory.deploy();
  });

  describe("Comment Creation", function () {
    it("Should allow a user to create a comment", async function () {
      const testContent = "This is my first comment!";
      const postId = 1;

      // Create comment and check for event emission
      await expect(commentContract.connect(addr1).createComment(postId, testContent))
        .to.emit(commentContract, "CommentCreated")
        .withArgs(1, addr1.address, postId, testContent);

      // Verify comment data
      const comment = await commentContract.getComment(1);
      expect(comment.id).to.equal(1);
      expect(comment.author).to.equal(addr1.address);
      expect(comment.content).to.equal(testContent);
      expect(comment.postId).to.equal(postId);
      expect(comment.isDeleted).to.be.false;
    });

    it("Should increment comment ID for each new comment", async function () {
      const testContent = "Second comment";
      const postId = 1;

      await commentContract.connect(addr2).createComment(postId, testContent);

      const comment = await commentContract.getComment(2);
      expect(comment.id).to.equal(2);
      expect(comment.author).to.equal(addr2.address);
    });

    it("Should track user comments correctly", async function () {
      const userComments = await commentContract.getUserComments(addr1.address);
      expect(userComments).to.deep.equal([1]);

      const user2Comments = await commentContract.getUserComments(addr2.address);
      expect(user2Comments).to.deep.equal([2]);
    });

    it("Should track post comments correctly", async function () {
      const postComments = await commentContract.getPostComments(1);
      expect(postComments).to.deep.equal([1, 2]);
    });
  });

  describe("Comment Updates", function () {
    it("Should allow author to update their comment", async function () {
      const newContent = "Updated comment content";

      await expect(commentContract.connect(addr1).updateComment(1, newContent))
        .to.emit(commentContract, "CommentUpdated")
        .withArgs(1, addr1.address, newContent);

      const comment = await commentContract.getComment(1);
      expect(comment.content).to.equal(newContent);
      expect(comment.updatedAt).to.be.greaterThan(comment.createdAt);
    });

    it("Should not allow non-author to update comment", async function () {
      const newContent = "Unauthorized update";

      await expect(
        commentContract.connect(addr2).updateComment(1, newContent)
      ).to.be.revertedWith("Not the author");
    });

    it("Should not allow updating non-existent comment", async function () {
      const newContent = "Update non-existent";

      await expect(
        commentContract.connect(addr1).updateComment(999, newContent)
      ).to.be.revertedWith("Comment does not exist");
    });

    it("Should not allow updating deleted comment", async function () {
      // First delete the comment
      await commentContract.connect(addr1).deleteComment(1);

      const newContent = "Try to update deleted comment";
      await expect(
        commentContract.connect(addr1).updateComment(1, newContent)
      ).to.be.revertedWith("Comment is deleted");
    });
  });

  describe("Comment Deletion", function () {
    it("Should allow author to delete their comment", async function () {
      await expect(commentContract.connect(addr2).deleteComment(2))
        .to.emit(commentContract, "CommentDeleted")
        .withArgs(2, addr2.address);

      const comment = await commentContract.getComment(2);
      expect(comment.isDeleted).to.be.true;
    });

    it("Should not allow non-author to delete comment", async function () {
      // Create a new comment first
      await commentContract.connect(addr3).createComment(1, "New comment");

      await expect(
        commentContract.connect(addr1).deleteComment(3)
      ).to.be.revertedWith("Not the author");
    });

    it("Should not allow operations on deleted comments", async function () {
      const newContent = "Try to update deleted comment";
      await expect(
        commentContract.connect(addr2).updateComment(2, newContent)
      ).to.be.revertedWith("Comment is deleted");
    });
  });

  describe("View Functions", function () {
    it("Should return correct comment data", async function () {
      const comment = await commentContract.getComment(3);
      expect(comment.id).to.equal(3);
      expect(comment.author).to.equal(addr3.address);
      expect(comment.isDeleted).to.be.false;
    });

    it("Should return user comments correctly", async function () {
      const userComments = await commentContract.getUserComments(addr3.address);
      expect(userComments).to.deep.equal([3]);
    });

    it("Should return post comments correctly", async function () {
      const postComments = await commentContract.getPostComments(1);
      expect(postComments).to.deep.equal([1, 2, 3]);
    });

    it("Should return total comments count", async function () {
      const totalComments = await commentContract.getTotalComments();
      expect(totalComments).to.equal(3);
    });

    it("Should check if comment is deleted", async function () {
      const isDeleted = await commentContract.isCommentDeleted(2);
      expect(isDeleted).to.be.true;

      const isNotDeleted = await commentContract.isCommentDeleted(3);
      expect(isNotDeleted).to.be.false;
    });
  });

  describe("Pagination", function () {
    beforeEach(async function () {
      // Create more comments for pagination testing
      await commentContract.connect(addr1).createComment(2, "Comment on post 2");
      await commentContract.connect(addr2).createComment(2, "Another comment on post 2");
      await commentContract.connect(addr3).createComment(2, "Third comment on post 2");
    });

    it("Should return paginated comments correctly", async function () {
      const page1 = await commentContract.getPostCommentsPaginated(2, 0, 2);
      expect(page1).to.deep.equal([4, 5]);

      const page2 = await commentContract.getPostCommentsPaginated(2, 2, 2);
      expect(page2).to.deep.equal([6]);
    });

    it("Should handle offset beyond array length", async function () {
      const result = await commentContract.getPostCommentsPaginated(2, 10, 5);
      expect(result).to.deep.equal([]);
    });

    it("Should handle limit larger than remaining items", async function () {
      const result = await commentContract.getPostCommentsPaginated(2, 1, 10);
      expect(result).to.deep.equal([5, 6]);
    });

    it("Should return empty array for non-existent post", async function () {
      const result = await commentContract.getPostCommentsPaginated(999, 0, 5);
      expect(result).to.deep.equal([]);
    });
  });

  describe("Access Control", function () {
    it("Should set correct owner", async function () {
      const contractOwner = await commentContract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("Should not allow operations on non-existent comments", async function () {
      await expect(
        commentContract.getComment(999)
      ).to.be.revertedWith("Comment does not exist");
    });
  });

  describe("Multiple Posts Comments", function () {
    it("Should handle comments on different posts", async function () {
      // Create comments on different posts
      await commentContract.connect(addr1).createComment(3, "Comment on post 3");
      await commentContract.connect(addr2).createComment(4, "Comment on post 4");

      const post3Comments = await commentContract.getPostComments(3);
      expect(post3Comments).to.deep.equal([7]);

      const post4Comments = await commentContract.getPostComments(4);
      expect(post4Comments).to.deep.equal([8]);
    });

    it("Should track user comments across multiple posts", async function () {
      const user1Comments = await commentContract.getUserComments(addr1.address);
      expect(user1Comments).to.deep.equal([1, 4, 7]);

      const user2Comments = await commentContract.getUserComments(addr2.address);
      expect(user2Comments).to.deep.equal([2, 5, 8]);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty comment content", async function () {
      const emptyContent = "";

      await commentContract.connect(addr1).createComment(5, emptyContent);

      const comment = await commentContract.getComment(9);
      expect(comment.content).to.equal("");
    });

    it("Should handle very long comment content", async function () {
      const longContent = "A".repeat(1000); // 1000 character string

      await commentContract.connect(addr2).createComment(5, longContent);

      const comment = await commentContract.getComment(10);
      expect(comment.content).to.equal(longContent);
    });

    it("Should handle zero post ID", async function () {
      const testContent = "Comment on post 0";

      await commentContract.connect(addr3).createComment(0, testContent);

      const comment = await commentContract.getComment(11);
      expect(comment.postId).to.equal(0);
    });
  });

  describe("Timestamp Verification", function () {
    it("Should set correct timestamps on creation", async function () {
      const beforeCreation = Math.floor(Date.now() / 1000);
      
      await commentContract.connect(addr1).createComment(6, "Timestamp test");
      
      const afterCreation = Math.floor(Date.now() / 1000);
      const comment = await commentContract.getComment(12);
      
      expect(comment.createdAt).to.be.at.least(beforeCreation);
      expect(comment.createdAt).to.be.at.most(afterCreation);
      expect(comment.updatedAt).to.equal(comment.createdAt);
    });

    it("Should update timestamp on comment update", async function () {
      const comment = await commentContract.getComment(12);
      const originalUpdatedAt = comment.updatedAt;
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await commentContract.connect(addr1).updateComment(12, "Updated content");
      
      const updatedComment = await commentContract.getComment(12);
      expect(updatedComment.updatedAt).to.be.greaterThan(originalUpdatedAt);
    });
  });
});
