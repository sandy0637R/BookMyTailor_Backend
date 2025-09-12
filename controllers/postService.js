const User = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

async function addPost(userId, postData, images = []) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.tailorDetails) {
    throw new Error("User is not a tailor or tailorDetails missing");
  }

  postData.images = Array.isArray(images)
    ? images
        .filter((file) => file && file.path)
        .map((file) => SERVER_URL + "/" + file.path.replace(/\\/g, "/"))
    : [];

  postData.postedBy = {
    _id: user._id,
    name: user.name,
  };

  if (typeof postData.productLink !== "undefined") {
    postData.productLink = postData.productLink;
  }

  user.tailorDetails.posts.push(postData);
  await user.save();

  return user.tailorDetails.posts[user.tailorDetails.posts.length - 1];
}

async function updatePost(userId, postId, updatedData, images = []) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const post = user.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  if (Array.isArray(images) && images.length > 0) {
    post.images?.forEach((imageUrl) => {
      const filePath = path.join(
        __dirname,
        "..",
        imageUrl.replace(SERVER_URL + "/", "")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    const newImages = images
      .filter((file) => file && file.path)
      .map((file) => SERVER_URL + "/" + file.path.replace(/\\/g, "/"));
    post.images = newImages;
  }

  if (typeof updatedData.productLink !== "undefined") {
    post.productLink = updatedData.productLink;
  }

  Object.assign(post, updatedData);
  await user.save();

  return post;
}

async function deletePost(userId, postId) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid Post ID");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.tailorDetails) {
    throw new Error("User is not a tailor or tailorDetails missing");
  }

  const post = user.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  post.images?.forEach((imageUrl) => {
    const filePath = path.join(
      __dirname,
      "..",
      imageUrl.replace(SERVER_URL + "/", "")
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  post.deleteOne();
  await user.save();
  return true;
}

async function getAllPosts(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.tailorDetails)
    throw new Error("User is not a tailor or tailorDetails missing");

  return user.tailorDetails.posts;
}

async function toggleLike(userId, postId) {
  const user = await User.findOne({ "tailorDetails.posts._id": postId });
  if (!user) throw new Error("Post not found");

  const post = user.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  const likeIndex = post.likes.findIndex(
    (id) => id.toString() === userId.toString()
  );

  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await user.save();
  return post;
}

async function addComment(userId, postId, text) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const postOwner = await User.findOne({ "tailorDetails.posts._id": postId });
  if (!postOwner) throw new Error("Post not found");

  const post = postOwner.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  const comment = {
    _id: new mongoose.Types.ObjectId(),
    userId,
    commentText: text,
    createdAt: new Date(),
  };

  post.comments.push(comment);
  await postOwner.save();

  return {
    comment: {
      ...comment,
      userName: user.name,
    },
  };
}

// Get all comments for a post
async function getAllComments(postId) {
  const user = await User.findOne({ "tailorDetails.posts._id": postId });
  if (!user) throw new Error("Post not found");

  const post = user.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  const populatedComments = await Promise.all(
    post.comments.map(async (comment) => {
      const userInfo = await User.findById(comment.userId).select("name");
      return {
        _id: comment._id,
        commentText: comment.commentText,
        userId: comment.userId,
        userName: userInfo?.name || "Unknown",
        createdAt: comment.createdAt,
      };
    })
  );

  return populatedComments;
}

// Delete a comment by commentId
async function deleteComment(postId, commentId, userId) {
  const user = await User.findOne({ "tailorDetails.posts._id": postId });
  if (!user || !user.tailorDetails)
    throw new Error("Post not found or tailor details missing");

  const post = user.tailorDetails.posts.id(postId);
  if (!post) throw new Error("Post not found");

  const comment = post.comments.id(commentId);
  if (!comment) throw new Error("Comment not found");

  if (comment.userId.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this comment");
  }

  await comment.deleteOne();

  await user.save();

  return true;
}

module.exports = {
  addPost,
  updatePost,
  deletePost,
  getAllPosts,
  toggleLike,
  addComment,
  getAllComments,
  deleteComment,
};
