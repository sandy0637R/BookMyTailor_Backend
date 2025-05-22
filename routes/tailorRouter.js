// routes/tailors.js
const express = require("express");
const router = express.Router();
const isLoggedin = require("../middleware/isLoggedin");
const { getAllPosts ,toggleLikeOnPost, addCommentOnPost,getAllCommentsForPost,deleteCommentFromPost} = require("../controllers/tailorController");

router.get("/posts", isLoggedin, getAllPosts);
router.put("/posts/:postId/like", isLoggedin, toggleLikeOnPost);
router.post("/posts/:postId/comment", isLoggedin, addCommentOnPost);
router.get("/posts/:postId/comments", isLoggedin, getAllCommentsForPost);
router.delete("/posts/:postId/comments/:commentId", isLoggedin, deleteCommentFromPost);


module.exports = router;
