const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  // logoutUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const isLoggedin = require("../middleware/isLoggedin");

// Test Route
router.get("/", (req, res) => {
  res.send("hey its working");
});

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get("/logout", logoutUser);

// Protected Routes
router.get("/profile", isLoggedin, getProfile);
router.put("/profile", isLoggedin, updateProfile); // Profile update route
module.exports = router;