const User = require("../models/User");

// Get user counts based on roles
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ roles: { $ne: ["admin"] } });
    const onlyCustomers = await User.countDocuments({ roles: ["customer"] });
    const tailors = await User.countDocuments({ roles: { $in: ["tailor"] } });

    res.status(200).json({
      totalUsers,
      onlyCustomers,
      tailors,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user stats", error: err });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
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
