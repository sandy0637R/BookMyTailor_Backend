const express = require("express");
const router = express.Router();
const isLoggedin = require("../middleware/isLoggedin");
const {
  getFollowersOfTailor,
  getAllPosts,
  toggleLikeOnPost,
  addCommentOnPost,
  getAllCommentsForPost,
  deleteCommentFromPost,
  getAllTailors,
  followTailor,
  unfollowTailor,
  rateTailor,
  getRatingsForTailor,
} = require("../controllers/tailorController");

router.get("/posts", isLoggedin, getAllPosts);
router.put("/posts/:postId/like", isLoggedin, toggleLikeOnPost);
router.post("/posts/:postId/comment", isLoggedin, addCommentOnPost);
router.get("/posts/:postId/comments", isLoggedin, getAllCommentsForPost);
router.delete("/posts/:postId/comments/:commentId", isLoggedin, deleteCommentFromPost);

router.get("/alltailors", isLoggedin, getAllTailors);

router.post("/follow/:tailorId", isLoggedin, followTailor);
router.post("/unfollow/:tailorId", isLoggedin, unfollowTailor);
router.get("/followers/:tailorId", isLoggedin, getFollowersOfTailor);

router.post("/rate", isLoggedin, rateTailor);
router.get("/ratings/:tailorId", isLoggedin, getRatingsForTailor);

module.exports = router;
