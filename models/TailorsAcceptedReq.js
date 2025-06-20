const mongoose = require("mongoose");

const acceptedRequestSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Accepted", "Ready", "Out for Delivery", "Delivered", "Confirmed"],
    default: "Accepted",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = acceptedRequestSchema;
