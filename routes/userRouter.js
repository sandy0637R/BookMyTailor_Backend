const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadImage,
  deleteProfileImage,
  checkAdmin, // New method for deleting profile image
  addPost,
  updatePost,
  deletePost,
  uploadPostImages,
  getAllPosts,
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

// Route to delete profile image
router.delete("/profile/image", isLoggedin, deleteProfileImage); // Route to handle profile image deletion

// GET /users/admin-exists
router.get("/admin-exists",checkAdmin);


router.post("/post", isLoggedin, uploadPostImages, addPost);
router.put("/post/:postId", isLoggedin, uploadPostImages, updatePost);
router.delete("/post/:postId", isLoggedin, deletePost);
router.get("/posts", isLoggedin, getAllPosts);

module.exports = router;
