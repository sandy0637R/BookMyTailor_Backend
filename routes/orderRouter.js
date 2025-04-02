const express = require("express");
const router = express.Router();
const orderModel = require("../models/Order");

router.get("/", function (req, res) {
  res.send("hey its working");
});

router.post("/create", async function (req, res) {
  console.log("Received body:", req.body);
  let { customerId, tailorId, clothId, status, advancePayment, totalPrice } = req.body;
  let createdOrder = await orderModel.create({
    customerId,
    tailorId,
    clothId,
    status,
    advancePayment,
    totalPrice,
  });
  res.status(201).send(createdOrder);
});

module.exports = router;
