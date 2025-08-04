const express = require("express");
const router = express.Router();
const { getUserStats,blockUser,getAllUsers ,unblockUser } = require('../controllers/adminController');
const isLoggedin = require('../middleware/isLoggedin');

router.get("/user-stats",isLoggedin, getUserStats);
router.put("/block-user/:userId",isLoggedin,blockUser);
router.put("/unblock-user/:userId",isLoggedin,unblockUser);
router.get("/all",isLoggedin,getAllUsers)

module.exports = router;
