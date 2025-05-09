const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadImage,
} = require("../controllers/authController");

const isLoggedin = require("../middleware/isLoggedin");

// Test Route
router.get("/", (req, res) => {
  res.send("hey its working");
});

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", isLoggedin, getProfile);
router.put("/profile", isLoggedin, uploadImage, updateProfile); // ⬅️ Image upload + profile update

module.exports = router;
