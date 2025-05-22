const userModel = require("../models/User");
const {  toggleLike, addComment,
  getAllComments, deleteComment,} = require("./postService");
const mongoose = require("mongoose");


exports.getAllPosts = async (req, res) => {
  try {
    const users = await userModel.find().select("name email tailorDetails.posts");

    let allPosts = [];

    users.forEach(user => {
      const posts = user.tailorDetails?.posts || [];
      posts.forEach(post => {
        allPosts.push({
          ...post.toObject(),
          postedBy: {
            name: user.name,
            email: user.email,
            userId: user._id,
          }
        });
      });
    });

    if (allPosts.length === 0) {
      return res.status(200).json({ message: "No posts found from any user." });
    }

    res.status(200).json(allPosts);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Controller to toggle like/unlike
exports.toggleLikeOnPost = async (req, res) => {
  try {
    const userId = req.user._id;   // from your auth middleware
    const { postId } = req.params;

    const updatedPost = await toggleLike(userId, postId);
    res.status(200).json({ message: "Like toggled", post: updatedPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller to add comment
exports.addCommentOnPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Valid comment text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const updatedPost = await addComment(userId, postId, text);
    res.status(200).json({ message: "Comment added", post: updatedPost });
  } catch (err) {
    console.error("Error in addCommentOnPost:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await getAllComments(postId);
    res.status(200).json(comments);
  } catch (err) {
    console.error("Error in getAllCommentsForPost:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a comment from a post
exports.deleteCommentFromPost = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    await deleteComment(postId, commentId, userId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error in deleteCommentFromPost:", err);
    res.status(500).json({ message: err.message });
  }
};
