// routes/tailors.js
const express = require("express");
const router = express.Router();
const isLoggedin = require("../middleware/isLoggedin");
const { getAllPosts } = require("../controllers/tailorController");

router.get("/posts", isLoggedin, getAllPosts);

module.exports = router;
