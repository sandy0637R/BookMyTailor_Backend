const userModel = require("../models/User");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");

// Register User
module.exports.registerUser = async function (req, res) {
  try {
    let { name, email, password, wishlist, orders } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(401).send("User already exists, please login.");
    }

    bcryptjs.genSalt(10, function (err, salt) {
      bcryptjs.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);

        let user = await userModel.create({
          name,
          email,
          password: hash,
          role: "user", // Default role
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
  let { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    bcryptjs.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error, please try again later." });
      }

      if (result) {
        let token = generateToken(user);
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
    res.status(200).json(user); // Return the full user object
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error.");
  }
};

// Update Profile
module.exports.updateProfile = async function (req, res) {
  try {
    const userId = req.user._id; // Use _id to find the user in the DB
    const updates = req.body; // Accepts fields like name, role, etc.

    if (!updates.role && !updates.name) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true, // This ensures the updated document is returned
    });

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser, // Return the updated user object
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};
