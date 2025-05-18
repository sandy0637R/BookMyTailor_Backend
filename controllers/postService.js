const User = require("../models/User");
const mongoose = require('mongoose');
const userModel = require('../models/User'); // adjust the path if needed


async function addPost(userId, postData, images = []) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.tailorDetails) {
    throw new Error("User is not a tailor or tailorDetails missing");
  }

  postData.images = Array.isArray(images)
    ? images
        .filter(file => file && file.path)
        .map(file => file.path.replace(/\\/g, "/"))
    : [];

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
    const newImages = images
      .filter(file => file && file.path)
      .map(file => file.path.replace(/\\/g, "/"));
    post.images.push(...newImages);
  }

  Object.assign(post, updatedData);
  await user.save();

  return post;
}

async function deletePost(userId, postId) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid Post ID");
  }
  
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.tailorDetails) {
    throw new Error("User is not a tailor or tailorDetails missing");
  }

  const post = user.tailorDetails.posts.id(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  post.deleteOne(); // ✅ Correct method to remove subdocument
  await user.save();
  return true;
}



async function getAllPosts(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.tailorDetails) throw new Error("User is not a tailor or tailorDetails missing");
  
  return user.tailorDetails.posts;
}

module.exports = { addPost, updatePost, deletePost, getAllPosts };
