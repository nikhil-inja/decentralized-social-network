import { expect } from "chai";
import { network } from "hardhat";

describe("Post and Comment Integration", function () {
  let postContract;
  let commentContract;
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
    
    const CommentFactory = await ethers.getContractFactory("Comment");
    commentContract = await CommentFactory.deploy();
  });

  describe("Complete Social Media Flow", function () {
    it("Should allow complete post and comment workflow", async function () {
      // Step 1: Create a post
      const postContent = "Welcome to our decentralized social network!";
      const imageHashes = ["QmWelcomeImage"];
      
      const tx1 = await postContract.connect(addr1).createPost(postContent, imageHashes);
      const receipt1 = await tx1.wait();
      const postCreatedEvent = receipt1.logs.find(log => 
        log.topics[0] === postContract.interface.getEvent("PostCreated").topicHash
      );
      const postId = postContract.interface.parseLog(postCreatedEvent).args.postId;
      
      expect(postId).to.equal(1);
      
      // Step 2: Verify post was created correctly
      const post = await postContract.getPost(postId);
      expect(post.content).to.equal(postContent);
      expect(post.author).to.equal(addr1.address);
      expect(post.isActive).to.be.true;
      
      // Step 3: Create comments on the post
      const comment1Content = "Great post!";
      const comment2Content = "I agree with this!";
      
      const comment1Tx = await commentContract.connect(addr2).createComment(postId, comment1Content);
      const comment1Receipt = await comment1Tx.wait();
      const comment1Event = comment1Receipt.logs.find(log => 
        log.topics[0] === commentContract.interface.getEvent("CommentCreated").topicHash
      );
      const comment1Id = commentContract.interface.parseLog(comment1Event).args.commentId;
      
      const comment2Tx = await commentContract.connect(addr1).createComment(postId, comment2Content);
      const comment2Receipt = await comment2Tx.wait();
      const comment2Event = comment2Receipt.logs.find(log => 
        log.topics[0] === commentContract.interface.getEvent("CommentCreated").topicHash
      );
      const comment2Id = commentContract.interface.parseLog(comment2Event).args.commentId;
      
      // Step 4: Add comments to post (update post comment count)
      await postContract.connect(addr1).addComment(postId, comment1Id);
      await postContract.connect(addr1).addComment(postId, comment2Id);
      
      // Step 5: Verify post comment count was updated
      const updatedPost = await postContract.getPost(postId);
      expect(updatedPost.commentCount).to.equal(2);
      expect(updatedPost.commentIds).to.deep.equal([comment1Id, comment2Id]);
      
      // Step 6: Verify comments exist and are linked to post
      const comment1 = await commentContract.getComment(comment1Id);
      const comment2 = await commentContract.getComment(comment2Id);
      
      expect(comment1.postId).to.equal(postId);
      expect(comment1.content).to.equal(comment1Content);
      expect(comment1.author).to.equal(addr2.address);
      
      expect(comment2.postId).to.equal(postId);
      expect(comment2.content).to.equal(comment2Content);
      expect(comment2.author).to.equal(addr1.address);
      
      // Step 7: Verify post comments can be retrieved
      const postComments = await commentContract.getPostComments(postId);
      expect(postComments).to.deep.equal([comment1Id, comment2Id]);
    });

    it("Should handle post deletion and comment visibility", async function () {
      // Create a post and comment
      const postContent = "This post will be deleted";
      const imageHashes = ["QmDeleteImage"];
      
      await postContract.connect(addr1).createPost(postContent, imageHashes);
      const postId = 2;
      
      await commentContract.connect(addr2).createComment(postId, "Comment before deletion");
      const commentId = 3;
      
      await postContract.connect(addr1).addComment(postId, commentId);
      
      // Verify post is active and has comment
      let post = await postContract.getPost(postId);
      expect(post.isActive).to.be.true;
      expect(post.commentCount).to.equal(1);
      
      // Delete the post
      await postContract.connect(addr1).deletePost(postId);
      
      // Verify post is deleted
      post = await postContract.getPost(postId);
      expect(post.isActive).to.be.false;
      
      // Comment should still exist but post should not accept new comments
      const comment = await commentContract.getComment(commentId);
      expect(comment.isDeleted).to.be.false;
      expect(comment.postId).to.equal(postId);
      
      // Should not be able to add new comments to deleted post
      await expect(
        postContract.connect(addr1).addComment(postId, 999)
      ).to.be.revertedWith("Post is not active");
    });

    it("Should handle comment deletion independently of post", async function () {
      // Create a post and comment
      const postContent = "Post for comment deletion test";
      const imageHashes = ["QmTestImage"];
      
      await postContract.connect(addr1).createPost(postContent, imageHashes);
      const postId = 3;
      
      await commentContract.connect(addr2).createComment(postId, "This comment will be deleted");
      const commentId = 4;
      
      await postContract.connect(addr1).addComment(postId, commentId);
      
      // Verify post has comment
      let post = await postContract.getPost(postId);
      expect(post.commentCount).to.equal(1);
      expect(post.commentIds).to.deep.equal([commentId]);
      
      // Delete the comment
      await commentContract.connect(addr2).deleteComment(commentId);
      
      // Verify comment is deleted
      const comment = await commentContract.getComment(commentId);
      expect(comment.isDeleted).to.be.true;
      
      // Post should still be active and comment count should remain
      // (Note: In a real implementation, you might want to decrement comment count)
      post = await postContract.getPost(postId);
      expect(post.isActive).to.be.true;
      expect(post.commentCount).to.equal(1); // Count remains the same
    });

    it("Should handle multiple users interacting with same post", async function () {
      // Create a post
      const postContent = "Multi-user interaction post";
      const imageHashes = ["QmMultiUserImage"];
      
      await postContract.connect(addr1).createPost(postContent, imageHashes);
      const postId = 4;
      
      // Multiple users comment on the same post
      const comments = [];
      for (let i = 0; i < 5; i++) {
        const commentContent = `Comment ${i + 1} from user ${i % 2 === 0 ? 'addr1' : 'addr2'}`;
        const user = i % 2 === 0 ? addr1 : addr2;
        
        await commentContract.connect(user).createComment(postId, commentContent);
        const commentId = 5 + i;
        comments.push(commentId);
        
        await postContract.connect(addr1).addComment(postId, commentId);
      }
      
      // Verify post has all comments
      const post = await postContract.getPost(postId);
      expect(post.commentCount).to.equal(5);
      expect(post.commentIds).to.deep.equal(comments);
      
      // Verify all comments exist and are linked to post
      for (let i = 0; i < comments.length; i++) {
        const comment = await commentContract.getComment(comments[i]);
        expect(comment.postId).to.equal(postId);
        expect(comment.isDeleted).to.be.false;
      }
      
      // Verify post comments can be retrieved
      const postComments = await commentContract.getPostComments(postId);
      expect(postComments).to.deep.equal(comments);
    });

    it("Should handle pagination with multiple comments", async function () {
      // Create a post
      const postContent = "Pagination test post";
      const imageHashes = ["QmPaginationImage"];
      
      await postContract.connect(addr1).createPost(postContent, imageHashes);
      const postId = 5;
      
      // Create many comments
      const commentIds = [];
      for (let i = 0; i < 10; i++) {
        await commentContract.connect(addr2).createComment(postId, `Comment ${i + 1}`);
        const commentId = 10 + i;
        commentIds.push(commentId);
        await postContract.connect(addr1).addComment(postId, commentId);
      }
      
      // Test pagination
      const page1 = await commentContract.getPostCommentsPaginated(postId, 0, 3);
      expect(page1).to.deep.equal([10, 11, 12]);
      
      const page2 = await commentContract.getPostCommentsPaginated(postId, 3, 3);
      expect(page2).to.deep.equal([13, 14, 15]);
      
      const page3 = await commentContract.getPostCommentsPaginated(postId, 6, 5);
      expect(page3).to.deep.equal([16, 17, 18, 19]);
      
      const page4 = await commentContract.getPostCommentsPaginated(postId, 9, 5);
      expect(page4).to.deep.equal([19]);
    });
  });

  describe("Error Handling Integration", function () {
    it("Should handle non-existent post references in comments", async function () {
      // Try to create comment on non-existent post
      await commentContract.connect(addr1).createComment(999, "Comment on non-existent post");
      
      const comment = await commentContract.getComment(20);
      expect(comment.postId).to.equal(999);
      expect(comment.content).to.equal("Comment on non-existent post");
      
      // Try to add comment to non-existent post
      await expect(
        postContract.connect(addr1).addComment(999, 20)
      ).to.be.revertedWith("Post does not exist");
    });

    it("Should handle cross-contract validation", async function () {
      // Create a post
      await postContract.connect(addr1).createPost("Test post", ["QmTest"]);
      const postId = 6;
      
      // Create a comment
      await commentContract.connect(addr2).createComment(postId, "Test comment");
      const commentId = 21;
      
      // Verify both contracts have consistent data
      const post = await postContract.getPost(postId);
      const comment = await commentContract.getComment(commentId);
      
      expect(comment.postId).to.equal(post.id);
      expect(comment.author).to.not.equal(post.author); // Different authors
    });
  });
});
