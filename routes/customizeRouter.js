const express = require("express");
const router = express.Router();

const {
  createCustomRequest,
  getAllCustomRequests,
  getDirectRequestsForTailor, // ✅ New import
  acceptCustomRequest,
  updateRequestStatus,
  confirmDelivery,
  editCustomRequest,
  deleteCustomRequest,
  getAcceptedRequests,
  deleteTailorDeliveredRequest,
  getRequestHistory,
} = require("../controllers/customizeController");

const isLoggedin = require("../middleware/isLoggedin");
const { createCustomImageUpload } = require("../middleware/multerConfig");
const uploadCustomImage = createCustomImageUpload();

// 🧍 Customer Routes
router.post("/request", isLoggedin, uploadCustomImage.single("image"), createCustomRequest);
router.put("/request/:requestId", isLoggedin, uploadCustomImage.single("image"), editCustomRequest);
router.delete("/request/:requestId", isLoggedin, deleteCustomRequest);
router.put("/request/:requestId/confirm", isLoggedin, confirmDelivery);

// ✅ History Route (Customer + Tailor)
router.get("/request-history", isLoggedin, getRequestHistory);

// 👔 Tailor Routes
router.get("/requests", isLoggedin, getAllCustomRequests); // 🧵 All general uploaded requests
router.get("/requests/direct", isLoggedin, getDirectRequestsForTailor); // 🆕 Directly requested to this tailor
router.put("/request/:userId/:requestId/accept", isLoggedin, acceptCustomRequest);
router.put("/request/:userId/:requestId/status", isLoggedin, updateRequestStatus);
router.get("/accepted-requests", isLoggedin, getAcceptedRequests);
router.delete("/request/:userId/:requestId/tailor-delete", isLoggedin, deleteTailorDeliveredRequest);

module.exports = router;
