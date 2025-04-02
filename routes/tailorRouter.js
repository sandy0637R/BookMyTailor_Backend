const express = require("express");
const router = express.Router();
const tailorModel = require("../models/Tailor");

router.get("/", function (req, res) {
  res.send("hey its working");
});

router.post("/create", async function (req, res) {
  console.log("Received body:", req.body);
  let { userId, name, email, password, experience, specialization, fees, topDesigns, ratings, } = req.body;

  let createdTailor = await tailorModel.create({
    userId,
    name,
    email,
    password,
    experience,
    specialization,
    fees,
    topDesigns,
    ratings,
  });
  res.status(201).send(createdTailor);
});

module.exports = router;
