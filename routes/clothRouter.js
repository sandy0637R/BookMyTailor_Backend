const express = require("express");
const router = express.Router();
const { getAllCloths } = require("../controllers/clothController");

// Route: /api/cloths/allcloths
router.get("/allcloths", getAllCloths);

module.exports = router;
