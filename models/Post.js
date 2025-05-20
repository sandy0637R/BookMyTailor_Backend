const mongoose = require("mongoose");

const ProductTagSchema = new mongoose.Schema({
  productId: { type: String },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
});

// Comment schema for nested comments inside posts
const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  images: [{ type: String }], // URLs or filenames
  caption: { type: String },
  hashtags: [{ type: String }],
  location: { type: String },
  taggedPeople: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // user IDs
  altText: { type: String },
  productTags: [ProductTagSchema],
  scheduledTime: { type: Date },

  // New fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // array of user IDs who liked
  comments: [CommentSchema], // array of comments
});

module.exports = PostSchema;
