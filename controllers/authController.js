const userModel = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { name, email, password, role, wishlist, orders } = req.body;

    let user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(401).send("User already exists, please login.");
    }
    bcryptjs.genSalt(10, function (err, salt) {
      bcryptjs.hash(password, salt, async function (err, hash) {
        if (err) {
          return res.send(err.message);
        } else {
          let user = await userModel.create({
            name,
            email,
            password: hash,
            role,
            wishlist,
            orders,
          });

          let token = generateToken(user);
          res.cookie("token", token);
          res.status(201).send("User created successfully");
        }
      });
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "Email not found." }); // Send 404 for email not found
    }

    // If user exists, compare password
    bcryptjs.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error, please try again later." }); // Handle bcrypt error
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
        res.status(401).json({ message: "Incorrect password." }); // Send 401 for incorrect password
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." }); // Handle unexpected server error
  }
};


module.exports.logoutUser = function (res, req) {
  res.cookie("token", "");
  res.redirect("/");
};

module.exports.getProfile = async function (req, res) {
  try {
    const user = req.user; // The user is already attached to req.user by the authentication middleware
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.status(200).json(user); // Send the user profile data
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error.");
  }
};
