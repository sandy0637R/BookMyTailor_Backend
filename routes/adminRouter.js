const express = require("express");
const router = express.Router();
const { getUserStats,blockUser,getAllUsers ,unblockUser,getAllCloths,editCloth,deleteCloth,getAllOrders,updateOrderStatus } = require('../controllers/adminController');
const isLoggedin = require('../middleware/isLoggedin');

router.get("/user-stats",isLoggedin, getUserStats);
router.put("/block-user/:userId",isLoggedin,blockUser);
router.put("/unblock-user/:userId",isLoggedin,unblockUser);
router.get("/all",isLoggedin,getAllUsers)
router.get("/cloths/allcloths",isLoggedin, getAllCloths);
router.put("/cloths/:clothId", isLoggedin,editCloth);
router.delete("/cloths/:clothId", isLoggedin,deleteCloth);
router.get("/all-orders",isLoggedin,getAllOrders)
router.put("/orders/:orderId/status",isLoggedin,updateOrderStatus)


module.exports = router;
