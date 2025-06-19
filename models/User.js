const mongoose = require("mongoose");
const PostSchema = require("./Post");

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const tailorDetailsSchema = new mongoose.Schema(
  {
    experience: Number,
    specialization: [String],
    fees: Number,
    topDesigns: [String],
    posts: [PostSchema],
    description: String,
    followers: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
      },
    ],
    averageRating: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  roles: {
    type: [String],
    enum: ["customer", "tailor", "admin"],
    default: ["customer"],
    validate: {
      validator: function (roles) {
        // If admin, it must be the only role
        if (roles.includes("admin") && roles.length > 1) return false;
        return true;
      },
      message: "Admin cannot have other roles.",
    },
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cloth" }],
cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cloth" }],

  orders: [],
  profileImage: {
    type: String,
    default: "",
  },
  address: String,
  tailorDetails: {
    type: tailorDetailsSchema,
    default: null,
  },
});

// Auto-remove tailorDetails if not a tailor
userSchema.pre("save", function (next) {
  if (!this.roles.includes("tailor")) {
    this.tailorDetails = null;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
