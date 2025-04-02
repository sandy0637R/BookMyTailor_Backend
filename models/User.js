const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["customer", "tailor", "admin"],
    default: "customer",
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cloth" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

module.exports = mongoose.model("User", userSchema);
