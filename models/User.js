module.exports = router;
const mongoose = require("mongoose");

const tailorDetailsSchema = new mongoose.Schema({
  experience: Number,
  specialization: [String], // e.g., ["Traditional", "Western"]
  fees: Number,
  topDesigns: [String],     // URLs or image references
  ratings: Number,
  posts: [String],          // Post IDs or content references
}, { _id: false });          // No need for separate _id for sub-doc

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  roles: {
    type: [String],
    enum: ["customer", "tailor"],
    default: ["customer"],
  },
  wishlist: [],
  orders: [],
  profileImage: {
    type: String,           // Path to image file
    default: "",            // Optional: empty string if no image uploaded
  },
  tailorDetails: {
    type: tailorDetailsSchema,
    default: null,
  },
});

// Optional: Clear tailorDetails if not a tailor
userSchema.pre("save", function (next) {
  if (!this.roles.includes("tailor")) {
    this.tailorDetails = null;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
