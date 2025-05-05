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
  roles: { // Changed "role" to "roles" for consistency
    type: [String],  // Array of strings for multiple roles
    enum: ["customer", "tailor"], // Now it can store multiple roles
    default: ["customer"],  // Default role is "customer"
  },
  wishlist: [],
  orders: [],
  tailorDetails: {
    type: tailorDetailsSchema,
    default: null,
  },
});

// Optional: Add a pre-save hook to nullify tailorDetails for non-tailors
userSchema.pre("save", function (next) {
  if (!this.roles.includes("tailor")) {
    this.tailorDetails = null;  // Clear tailor details if the user is not a tailor
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
