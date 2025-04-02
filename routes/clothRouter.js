const express = require("express");
const router = express.Router();
const clothModel = require("../models/Cloths");

router.get("/", function (req, res) {
  res.send("hey its working");
});

router.post("/create", async function (req, res) {
  console.log("Received body:", req.body);
  let { name, category, sizes, price, tailorId, image } = req.body;
  let cloth = await clothModel.create({
    name,
    category,
    sizes,
    price,
    tailorId,
    image,
  });
  res.status(201).send(cloth);
});

module.exports = router;
