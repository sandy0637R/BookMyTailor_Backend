const userModel = require("../models/User");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");

// Register User
module.exports.registerUser = async function (req, res) {
  try {
    const { name, email, password, wishlist, orders } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(401).send("User already exists, please login.");
    }

    bcryptjs.genSalt(10, function (err, salt) {
      bcryptjs.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);

        user = await userModel.create({
          name,
          email,
          password: hash,
          roles: ["customer"], // Default role is Customer
          wishlist,
          orders,
        });

        let token = generateToken(user);
        res.cookie("token", token);
        res.status(201).send("User created successfully");
      });
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal server error.");
  }
};

// Login User
module.exports.loginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    bcryptjs.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error, please try again later." });
      }

      if (result) {
        const token = generateToken(user);
        res.cookie("token", token);
        res.status(200).json({
          message: "Login successful",
          success: true,
          token,
          email,
          name: user.name,
        });
      } else {
        res.status(401).json({ message: "Incorrect password." });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Profile
module.exports.getProfile = async function (req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.status(200).json(user); // Return full profile
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error.");
  }
};

// Update Profile
module.exports.updateProfile = async function (req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send("User not found.");

    // Ensure that roles field is initialized
    if (!user.roles) user.roles = ["customer"]; // Default to "customer" if undefined

    const incomingRoles = (updates.roles || updates.role || []).map(r => r.toLowerCase());
    const isAddingTailor = incomingRoles.includes("tailor") && !user.roles.includes("tailor");

    if (isAddingTailor) {
      const { experience, specialization, fees } = updates.tailorDetails || {};
      if (!experience || !specialization || !fees) {
        return res.status(400).json({
          message: "Tailor details must include experience, specialization, and fees.",
        });
      }
      user.tailorDetails = updates.tailorDetails;
      user.roles.push("tailor");  // Corrected to `roles` instead of `role`
    }

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};
