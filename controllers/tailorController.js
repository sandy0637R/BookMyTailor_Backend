const userModel = require("../models/User");
const Rating=require("../models/Raiting")
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




exports.getAllTailors = async (req, res) => {
  try {
    const tailors = await userModel.find({
      roles: "tailor",
      tailorDetails: { $ne: null },
    });

    res.status(200).json({ success: true, tailors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

exports.followTailor = async (req, res) => {
  const { tailorId } = req.params;

  // Extract follower info from req.user (decoded from JWT)
  const { _id: followerId, name: followerName } = req.user;

  if (!mongoose.Types.ObjectId.isValid(tailorId) || !followerId || !followerName) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const tailor = await userModel.findById(tailorId);
    if (!tailor || !tailor.tailorDetails) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    const alreadyFollowing = tailor.tailorDetails.followers?.some(
      (f) => f._id.toString() === followerId.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following" });
    }

    if (!Array.isArray(tailor.tailorDetails.followers)) {
      tailor.tailorDetails.followers = [];
    }

    // **Fixed here: use 'new' with ObjectId**
    tailor.tailorDetails.followers.push({ _id: new mongoose.Types.ObjectId(followerId), name: followerName });

    await tailor.save();

    res.status(200).json({
      message: "Followed successfully",
      followersCount: tailor.tailorDetails.followers.length,
    });
  } catch (err) {
    console.error("Follow Tailor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Unfollow Tailor
exports.unfollowTailor = async (req, res) => {
  const { tailorId } = req.params;

  // Changed: get followerId from req.user, not req.body
  const { _id: followerId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(tailorId) || !mongoose.Types.ObjectId.isValid(followerId)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const tailor = await userModel.findById(tailorId);
    if (!tailor || !tailor.tailorDetails) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Remove follower by comparing strings
    tailor.tailorDetails.followers = (tailor.tailorDetails.followers || []).filter(
      (f) => f._id.toString() !== followerId.toString()  // changed for safe string compare
    );

    await tailor.save();

    res.status(200).json({
      message: "Unfollowed successfully",
      followersCount: tailor.tailorDetails.followers.length,
    });
  } catch (err) {
    console.error("Unfollow Tailor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get Followers of Tailor
exports.getFollowersOfTailor = async (req, res) => {
  const { tailorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tailorId)) {
    return res.status(400).json({ message: "Invalid tailor ID" });
  }

  try {
    const tailor = await userModel.findById(tailorId).select("tailorDetails.followers");

    if (!tailor || !tailor.tailorDetails) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    res.status(200).json({ followers: tailor.tailorDetails.followers || [] });
  } catch (error) {
    console.error("Get Followers Error:", error);
    res.status(500).json({ message: "Error fetching followers", error: error.message });
  }
};

exports.rateTailor = async (req, res) => {
  const { tailorId, rating } = req.body;
  const userId = req.user._id;

  if (!tailorId || !rating) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Update if already rated, else insert
    const existing = await Rating.findOne({ tailorId, userId });

    if (existing) {
      existing.rating = rating;
      await existing.save();
    } else {
      await Rating.create({ tailorId, userId, rating });
    }

    // Recalculate average
    const ratings = await Rating.find({ tailorId });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    // Save average to tailor document
    await userModel.findByIdAndUpdate(tailorId, {
      "tailorDetails.averageRating": avgRating,
    });

    res.json({ averageRating: avgRating });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRatingsForTailor = async (req, res) => {
  const tailorId = req.params.tailorId;
  const userId = req.user._id;

  try {
    const ratings = await Rating.find({ tailorId });

    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / (ratings.length || 1);

    const userRating = ratings.find(r => r.userId.toString() === userId.toString());

    res.json({
      averageRating: avgRating,
      userRating: userRating ? userRating.rating : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
