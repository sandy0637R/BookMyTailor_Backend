const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Rating", ratingSchema);
