const mongoose = require("mongoose");

const ProductTagSchema = new mongoose.Schema({
  productId: { type: String },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
});

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  images: [{ type: String }],
  caption: { type: String },
  hashtags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },

  // ✅ NEW: Posted by tailor
  postedBy: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
});

module.exports = PostSchema;
