const userModel = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// 🧵 1. Customer: Create a custom dress request
exports.createCustomRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      measurements,
      gender,
      budget,
      duration,
      description,
      quantity, // added
    } = req.body;

    const image = req.file?.filename;
    if (!image || !measurements || !gender || !budget || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.customDressRequests.push({
      image,
      measurements: JSON.parse(measurements),
      gender,
      budget,
      duration,
      description,
      quantity: quantity || 1, // default to 1 if not provided
    });

    await user.save();

    res.status(201).json({ message: "Custom request submitted successfully" });
  } catch (err) {
    console.error("createCustomRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 2. Tailor: View all uploaded custom requests
exports.getAllCustomRequests = async (req, res) => {
  try {
    const users = await userModel.find().select("name customDressRequests");

    const allRequests = [];

    users.forEach((user) => {
      user.customDressRequests.forEach((request) => {
        if (request.status === "Uploaded") {
          allRequests.push({
            ...request.toObject(),
            customer: { name: user.name, userId: user._id },
          });
        }
      });
    });

    res.status(200).json(allRequests);
  } catch (err) {
    console.error("getAllCustomRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 3. Tailor: Accept a request
exports.acceptCustomRequest = async (req, res) => {
  try {
    const tailorId = req.user._id;
    const { userId, requestId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const customer = await userModel.findById(userId);
    const tailor = await userModel.findById(tailorId);

    const request = customer.customDressRequests.id(requestId);
    if (!request || request.status !== "Uploaded") {
      return res
        .status(404)
        .json({ message: "Request not found or already accepted" });
    }

    request.status = "Accepted";
    request.tailorId = tailorId;

    tailor.tailorDetails.acceptedRequests.push({
      requestId,
      customerId: userId,
    });

    await customer.save();
    await tailor.save();

    res.status(200).json({ message: "Request accepted" });
  } catch (err) {
    console.error("acceptCustomRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 4. Tailor: Update tracking status
exports.updateRequestStatus = async (req, res) => {
  try {
    const tailorId = req.user._id;
    const { userId, requestId } = req.params;
    const { status } = req.body;

    if (!["Ready", "Out for Delivery", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const customer = await userModel.findById(userId);
    const tailor = await userModel.findById(tailorId);

    const request = customer.customDressRequests.id(requestId);
    const accepted = tailor.tailorDetails.acceptedRequests.find(
      (r) => r.requestId.toString() === requestId
    );

    if (!request || !accepted) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    accepted.status = status;

    await customer.save();
    await tailor.save();

    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error("updateRequestStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 5. Customer: Confirm delivery
exports.confirmDelivery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const user = await userModel.findById(userId);
    const request = user.customDressRequests.id(requestId);

    if (!request || request.status !== "Delivered") {
      return res.status(400).json({ message: "Invalid request status" });
    }

    request.status = "Confirmed";

    const tailor = await userModel.findById(request.tailorId);
    const accepted = tailor?.tailorDetails?.acceptedRequests.find(
      (r) => r.requestId.toString() === requestId
    );
    if (accepted) accepted.status = "Confirmed";

    await user.save();
    if (tailor) await tailor.save();

    res.status(200).json({ message: "Delivery confirmed" });
  } catch (err) {
    console.error("confirmDelivery error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 6. Customer: Edit a custom request before it's accepted
exports.editCustomRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const updates = req.body;
    const newImage = req.file?.filename;

    const user = await userModel.findById(userId);
    const request = user.customDressRequests.id(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Uploaded") {
      return res
        .status(400)
        .json({ message: "Can't edit after request is accepted" });
    }

    // 🔥 Delete old image if new one is uploaded
    if (newImage && request.image) {
      const oldPath = path.join(
        __dirname,
        "../uploads/customRequests",
        request.image
      );
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Failed to delete old image:", err.message);
      });
      request.image = newImage;
    }

    // 🛠️ Parse measurements if it's a string
    if (updates.measurements && typeof updates.measurements === "string") {
      try {
        updates.measurements = JSON.parse(updates.measurements);
      } catch (e) {
        return res.status(400).json({ message: "Invalid measurements format" });
      }
    }

    // 🧠 Update allowed fields (including quantity)
    Object.keys(updates).forEach((key) => {
      if (key !== "status" && key !== "tailorId" && key in request) {
        request[key] = updates[key];
      }
    });

    await user.save();
    res.status(200).json({ message: "Request updated successfully" });
  } catch (err) {
    console.error("editCustomRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 7. Customer: Delete a custom request before it's accepted
exports.deleteCustomRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const user = await userModel.findById(userId);
    const request = user.customDressRequests.id(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    // ✅ Allow delete if status is either Uploaded or Confirmed
    if (!["Uploaded", "Confirmed"].includes(request.status)) {
      return res
        .status(400)
        .json({
          message: "Only 'Uploaded' or 'Confirmed' requests can be deleted",
        });
    }

    // 🧹 Delete image from storage
    if (request.image) {
      const imgPath = path.join(
        __dirname,
        "../uploads/customRequests",
        request.image
      );
      fs.unlink(imgPath, (err) => {
        if (err) console.warn("Failed to delete image:", err.message);
      });
    }

    // ✅ Use pull to remove from array
    user.customDressRequests.pull({ _id: requestId });
    await user.save();

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("deleteCustomRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧵 8. Tailor: Get only their accepted custom requests
exports.getAcceptedRequests = async (req, res) => {
  try {
    const tailorId = req.user._id;

    const tailor = await userModel.findById(tailorId);
    if (!tailor || !tailor.tailorDetails) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    const accepted = tailor.tailorDetails.acceptedRequests || [];

    const enrichedRequests = await Promise.all(
      accepted.map(async (entry) => {
        const customer = await userModel.findById(entry.customerId);
        const request = customer?.customDressRequests?.id(entry.requestId);

        if (!request) return null;

        return {
          ...request.toObject(),
          customer: {
            name: customer.name,
            userId: customer._id,
          },
        };
      })
    );

    // filter out nulls
    const filtered = enrichedRequests.filter(Boolean);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("getAcceptedRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Allow tailor to delete request once it's marked as "Delivered"
exports.deleteTailorDeliveredRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.params;

    // Find tailor (logged-in user)
    const tailor = await userModel.findById(req.user._id);
    if (!tailor || !tailor.tailorDetails) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Find and remove the delivered request by requestId and customerId
    const updatedAccepted = tailor.tailorDetails.acceptedRequests.filter(
      (r) =>
        !(r.requestId.toString() === requestId && r.customerId.toString() === userId)
    );

    // If nothing was removed, return 404
    if (updatedAccepted.length === tailor.tailorDetails.acceptedRequests.length) {
      return res.status(404).json({ message: "Request not found or already removed" });
    }

    tailor.tailorDetails.acceptedRequests = updatedAccepted;
    await tailor.save();

    res.status(200).json({ message: "Delivered request removed successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





