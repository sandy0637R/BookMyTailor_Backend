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
  addToWishlist,
  removeFromWishlist,
  addToCart,
  removeFromCart,
  getUserById,
  // getUserCart,
  clearUserCart,
  
} = require("../controllers/authController");



const{getFollowingList,getUsersWhoRatedTailor}=require("../controllers/tailorController")

const isLoggedin = require("../middleware/isLoggedin");



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

router.post("/wishlist", isLoggedin, addToWishlist); // expects { itemId } in body
router.delete("/wishlist/:itemId", isLoggedin, removeFromWishlist);

// ✅ Cart routes — match frontend (POST with body, DELETE with param)
router.post("/cart", isLoggedin, addToCart); // expects { itemId } in body
router.delete("/cart/:itemId", isLoggedin, removeFromCart);        // Fro
router.get("/tailors/:tailorId/rated-users", isLoggedin,getUsersWhoRatedTailor);
router.get("/:userId/following", isLoggedin,getFollowingList);
// router.get('/cart/:id',isLoggedin, getUserCart);


router.get("/:id", isLoggedin, getUserById);
router.delete('/cart/clear/:id',isLoggedin ,clearUserCart);


module.exports = router;
