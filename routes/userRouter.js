const express = require("express");
const router = express.Router();
const userModel = require("../models/User");

router.get("/", function (req, res) {
  res.send("hey its working");
});

router.post("/create", async function (req, res) {
  console.log("Received body:", req.body);
  let { name, email, password, role, wishlist, orders } = req.body ;
  let createdUser = await userModel.create({
    name,
    email,
    password,
    role,
    wishlist,
    orders,
  });
  res.status(201).send(createdUser);
});

module.exports = router;
