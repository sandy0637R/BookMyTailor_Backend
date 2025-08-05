const express = require("express");
const router = express.Router();
const {

  placeOrder,
  getUserOrders,
} = require("../controllers/orderController");
const isLoggedin = require('../middleware/isLoggedin');

router.post("/place", isLoggedin, placeOrder);
router.get("/my", isLoggedin, getUserOrders);  
module.exports = router;
