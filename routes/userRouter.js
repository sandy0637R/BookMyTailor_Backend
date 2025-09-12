const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadImage,
  deleteProfileImage,
  checkAdmin, 
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
  clearUserCart,
  
} = require("../controllers/authController");



const{getFollowingList,getUsersWhoRatedTailor}=require("../controllers/tailorController")

const isLoggedin = require("../middleware/isLoggedin");



// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", isLoggedin, getProfile);
router.put("/profile", isLoggedin, uploadImage, updateProfile);

// Route to delete profile image
router.delete("/profile/image", isLoggedin, deleteProfileImage); 

// GET /users/admin-exists
router.get("/admin-exists",checkAdmin);


router.post("/post", isLoggedin, uploadPostImages, addPost);
router.put("/post/:postId", isLoggedin, uploadPostImages, updatePost);
router.delete("/post/:postId", isLoggedin, deletePost);
router.get("/posts", isLoggedin, getAllPosts);

router.post("/wishlist", isLoggedin, addToWishlist); 
router.delete("/wishlist/:itemId", isLoggedin, removeFromWishlist);

// ✅ Cart routes 
router.post("/cart", isLoggedin, addToCart); 
router.delete("/cart/:itemId", isLoggedin, removeFromCart);        
router.get("/tailors/:tailorId/rated-users", isLoggedin,getUsersWhoRatedTailor);
router.get("/:userId/following", isLoggedin,getFollowingList);


router.get("/:id", isLoggedin, getUserById);
router.delete('/cart/clear/:id',isLoggedin ,clearUserCart);


module.exports = router;
