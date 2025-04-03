const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["customer", "tailor", "admin"],
    default: "customer",
  },
  wishlist: [],
  orders: [],
});

module.exports = mongoose.model("User", userSchema);
