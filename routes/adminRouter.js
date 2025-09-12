const express = require("express");
const router = express.Router();
const { getUserStats,blockUser,getAllUsers ,unblockUser,getAllCloths,editCloth,deleteCloth,getAllOrders,updateOrderStatus } = require('../controllers/adminController');
const isLoggedin = require('../middleware/isLoggedin');
const isAdmin = require('../middleware/isAdmin');

router.get("/user-stats", isLoggedin, isAdmin, getUserStats);
router.put("/block-user/:userId", isLoggedin, isAdmin, blockUser);
router.put("/unblock-user/:userId", isLoggedin, isAdmin, unblockUser);
router.get("/all", isLoggedin, isAdmin, getAllUsers);
router.get("/cloths/allcloths", isLoggedin, isAdmin, getAllCloths);
router.put("/cloths/:clothId", isLoggedin, isAdmin, editCloth);
router.delete("/cloths/:clothId", isLoggedin, isAdmin, deleteCloth);
router.get("/all-orders", isLoggedin, isAdmin, getAllOrders);
router.put("/orders/:orderId/status", isLoggedin, isAdmin, updateOrderStatus);

module.exports = router;
