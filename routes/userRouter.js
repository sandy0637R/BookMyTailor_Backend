const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,  // Import the getProfile function from authController
} = require("../controllers/authController");

const isLoggedin = require("../middleware/isLoggedin"); // Import isLoggedin middleware

router.get("/", function (req, res) {
  res.send("hey its working");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// Profile route - requires the user to be logged in
router.get("/profile", isLoggedin, getProfile);

module.exports = router;
