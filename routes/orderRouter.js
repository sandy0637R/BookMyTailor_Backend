const express = require("express");
const router = express.Router();
const {

  placeOrder,
  getUserOrders,
  deleteOrder,
} = require("../controllers/orderController");
const isLoggedin = require('../middleware/isLoggedin');

router.post("/place", isLoggedin, placeOrder);
router.get("/my", isLoggedin, getUserOrders);
router.delete("/delete/:id", isLoggedin, deleteOrder);
module.exports = router;
