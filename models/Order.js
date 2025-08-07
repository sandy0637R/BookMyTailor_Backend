// models/Order.js
const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Cloth" },
      quantity: Number,
    },
  ],
  address: String,
  paymentMode: String,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Pending",
  },
  deliveredAt: { type: Date },
});

module.exports=mongoose.model("Order", orderSchema);
