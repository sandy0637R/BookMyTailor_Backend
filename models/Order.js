const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
  clothId: { type: mongoose.Schema.Types.ObjectId, ref: "Cloth" },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed"],
    default: "Pending",
  },
  advancePayment: Number,
  totalPrice: Number,
});

module.exports = mongoose.model("Order", orderSchema);
