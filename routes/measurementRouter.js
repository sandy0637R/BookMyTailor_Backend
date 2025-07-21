const express = require("express");
const router = express.Router();
const {
  addMeasurement,
  getMeasurements,
  deleteMeasurement,
  updateMeasurement
} = require("../controllers/measurementController");
const isLoggedIn = require("../middleware/isLoggedin");

router.post("/", isLoggedIn, addMeasurement);
router.get("/", isLoggedIn, getMeasurements);
router.delete("/:id", isLoggedIn, deleteMeasurement);
router.put("/:id", isLoggedIn, updateMeasurement);


module.exports = router;
