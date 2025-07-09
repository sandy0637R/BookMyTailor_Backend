const userModel = require("../models/User");
const Rating=require("../models/Raiting")
const {  toggleLike, addComment,
  getAllComments, deleteComment,} = require("./postService");
const mongoose = require("mongoose");


// Example controller logic

exports.getTailorById = async (req, res) => {
  try {
    const tailorDoc = await userModel
      .findById(req.params.id)
      .select("name email profileImage address tailorDetails roles");

    if (!tailorDoc || !tailorDoc.roles.includes("tailor")) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    const tailor = tailorDoc.toObject();

    if (tailor.tailorDetails?.createdAt) {
      const now = new Date();
      const createdAt = new Date(tailor.tailorDetails.createdAt);
      const diff = now - createdAt;

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const days = Math.floor(
        (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24)
      );

      tailor.tailorDetails.experience = `${years}yr${years === 1 ? "" : "s"} ${days} day${days !== 1 ? "s" : ""}`;
    }

    const allUserIds = [];
    tailor.tailorDetails?.posts?.forEach((post) => {
      post.comments?.forEach((comment) => {
        if (comment.userId) allUserIds.push(comment.userId);
      });
    });

    const uniqueUserIds = [...new Set(allUserIds.map((id) => String(id)))];

    const users = await userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select("name");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u.name;
    });

    tailor.tailorDetails.posts = tailor.tailorDetails.posts.map((post) => ({
      ...post,
      productLink: post.productLink || "", // ✅ include productLink
      postedBy: {
        _id: tailor._id,
        name: tailor.name,
      },
      comments: post.comments.map((comment) => ({
        ...comment,
        userName: userMap[comment.userId?.toString()] || "User",
      })),
    }));

    res.json({ tailor });
  } catch (error) {
    console.error("❌ Error fetching tailor:", error);
    res.status(500).json({ message: "Server error" });
  }
};




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

    const result = await addComment(userId, postId, text);
    res.status(200).json(result); // ✅ send the exact comment object
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

// Follow Tailor (updated)
exports.followTailor = async (req, res) => {
  const { tailorId } = req.params;
  const { _id: followerId, name: followerName } = req.user;

  if (!mongoose.Types.ObjectId.isValid(tailorId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const tailor = await userModel.findById(tailorId);
    const follower = await userModel.findById(followerId);

    if (!tailor || !tailor.tailorDetails || !follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Avoid duplicates
    const alreadyFollowing = tailor.tailorDetails.followers?.some(f => f._id.toString() === followerId.toString());
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following" });
    }

    // Add to followers
    tailor.tailorDetails.followers.push({ _id: followerId, name: followerName });

    // Add to follower's following list
    follower.following.push({ _id: tailor._id, name: tailor.name });

    await tailor.save();
    await follower.save();

    res.status(200).json({ message: "Followed successfully", followersCount: tailor.tailorDetails.followers.length });
  } catch (err) {
    console.error("Follow Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





// Unfollow Tailor
// Unfollow Tailor (updated)
exports.unfollowTailor = async (req, res) => {
  const { tailorId } = req.params;
  const { _id: followerId } = req.user;

  if (
    !mongoose.Types.ObjectId.isValid(tailorId) ||
    !mongoose.Types.ObjectId.isValid(followerId)
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Remove follower from tailor's followers list (array of objects)
    await userModel.findByIdAndUpdate(tailorId, {
      $pull: { "tailorDetails.followers": { _id: followerId } }
    });

    // Remove tailor from user's following list (array of ObjectIds)
    await userModel.findByIdAndUpdate(followerId, {
  $pull: { following: { _id: tailorId } }
});


    // Re-fetch updated followers count
    const updatedTailor = await userModel.findById(tailorId).select("tailorDetails.followers");

    res.status(200).json({
      message: "Unfollowed successfully",
      followersCount: updatedTailor?.tailorDetails?.followers?.length || 0
    });
  } catch (err) {
    console.error("Unfollow Error:", err);
    res.status(500).json({ message: "Server error" });
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
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    const userRating = ratings.find(
      (r) => r.userId.toString() === userId.toString()
    );

    res.json({
      averageRating: avgRating,
      userRating: userRating ? userRating.rating : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFollowingList = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await userModel.findById(userId).select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔄 Remove duplicates by _id
    const uniqueFollowing = [];
    const seenIds = new Set();

    for (const person of user.following || []) {
      const idStr = person._id.toString();
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        uniqueFollowing.push(person);
      }
    }

    res.status(200).json({ following: uniqueFollowing });
  } catch (error) {
    console.error("Get Following List Error:", error);
    res.status(500).json({ message: "Error fetching following list" });
  }
};



exports.getUsersWhoRatedTailor = async (req, res) => {
  const { tailorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tailorId)) {
    return res.status(400).json({ message: "Invalid tailor ID" });
  }

  try {
    const ratings = await Rating.find({ tailorId }).populate("userId", "name");

    const ratedUsers = ratings
      .filter(r => r.userId) // ✅ Avoid null users
      .map(r => ({
        _id: r.userId._id,
        name: r.userId.name,
        rating: r.rating,
      }));

    res.status(200).json({ ratedUsers });
  } catch (error) {
    console.error("Get Rated Users Error:", error);
    res.status(500).json({ message: "Error fetching rated users", error: error.message });
  }
};
