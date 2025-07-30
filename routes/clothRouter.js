// clothRouter.js
const express = require("express");
const router = express.Router();

const {
  getAllCloths,
  getClothById,
  addCloth,
  updateCloth,
  deleteCloth,
  getClothsByTailor
} = require("../controllers/clothController");

const isLoggedin = require('../middleware/isLoggedin');
const { createClothImageUpload } = require("../middleware/multerConfig");

const upload = createClothImageUpload();

// Public Routes
router.get("/allcloths", getAllCloths);
router.get("/my-cloths", isLoggedin, getClothsByTailor);
router.get("/:id", getClothById);

// Protected Routes
router.post("/", isLoggedin, upload.single("image"), addCloth);
router.put("/:id", isLoggedin, upload.single("image"), updateCloth);
router.delete("/:id", isLoggedin, deleteCloth);


module.exports = router;
