const User = require("../models/User");
const Cloth = require("../models/Cloths");
const Order = require("../models/Order");

// Get user counts based on roles
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ roles: { $ne: ["admin"] } });
    const onlyCustomers = await User.countDocuments({ roles: ["customer"] });
    const tailors = await User.countDocuments({ roles: { $in: ["tailor"] } });

    const users = await User.find(
      { "tailorDetails.posts": { $exists: true } },
      "tailorDetails.posts"
    );
    const totalPosts = users.reduce((sum, user) => {
      const posts = user.tailorDetails?.posts || [];
      return sum + posts.length;
    }, 0);

    res.status(200).json({
      totalUsers,
      onlyCustomers,
      tailors,
      totalPosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user stats", error: err });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

// Block a user by setting a flag
exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { blocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User blocked", user });
  } catch (err) {
    res.status(500).json({ message: "Error blocking user", error: err });
  }
};

exports.unblockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { blocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User unblocked", user });
  } catch (err) {
    res.status(500).json({ message: "Error unblocking user", error: err });
  }
};

// Get all cloths
exports.getAllCloths = async (req, res) => {
  try {
    const cloths = await Cloth.find().populate("tailor", "name email");
    res.status(200).json(cloths);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cloths", error: err });
  }
};

// Edit a cloth by ID
exports.editCloth = async (req, res) => {
  const { clothId } = req.params;
  const updatedData = req.body;
  try {
    const updatedCloth = await Cloth.findByIdAndUpdate(clothId, updatedData, {
      new: true,
    });
    if (!updatedCloth)
      return res.status(404).json({ message: "Cloth not found" });
    res.status(200).json({ message: "Cloth updated", cloth: updatedCloth });
  } catch (err) {
    res.status(500).json({ message: "Error updating cloth", error: err });
  }
};

// Delete a cloth by ID
exports.deleteCloth = async (req, res) => {
  const { clothId } = req.params;
  try {
    const deletedCloth = await Cloth.findByIdAndDelete(clothId);
    if (!deletedCloth)
      return res.status(404).json({ message: "Cloth not found" });

    await User.updateMany(
      { "tailorDetails.cloths": clothId },
      { $pull: { "tailorDetails.cloths": clothId } }
    );

    res.status(200).json({ message: "Cloth deleted", cloth: deletedCloth });
  } catch (err) {
    res.status(500).json({ message: "Error deleting cloth", error: err });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// Update delivery status of an order
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { deliveryStatus } = req.body;

  const validStatuses = [
    "Pending",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  if (!validStatuses.includes(deliveryStatus)) {
    return res.status(400).json({ message: "Invalid delivery status" });
  }

  try {
    const updateData = {
      deliveryStatus,
    };

    if (deliveryStatus === "Delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    })
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Delivery status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Failed to update delivery status" });
  }
};
