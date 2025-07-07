const express = require("express");
const router = express.Router();
const { getAllCloths ,getClothById} = require("../controllers/clothController");

// Route: /api/cloths/allcloths
router.get("/allcloths", getAllCloths);
router.get("/:id", getClothById);

module.exports = router;
