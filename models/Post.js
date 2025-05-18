// models/Post.js
const mongoose = require("mongoose");

const ProductTagSchema = new mongoose.Schema({
  productId: { type: String },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
});

const PostSchema = new mongoose.Schema({
  images: [{ type: String }], // URLs after upload or store filenames
  caption: { type: String },
  hashtags: [{ type: String }],
  location: { type: String },
  taggedPeople: [{ type: String }], // user IDs
  altText: { type: String },
  productTags: [ProductTagSchema],
  scheduledTime: { type: Date },
});

module.exports = PostSchema;
