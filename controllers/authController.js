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
  let user = await userModel.findOne({ email: email });
  if (!user) {
    return res.send("Email or Password incorrect.");
  } else {
    bcryptjs.compare(password, user.password, function (err, result) {
      if (result) {
        let token = generateToken(user);
        res.cookie("token", token);
        res.send("Login successfull !");
      } else {
        res.status(401).send("Please enter the correct password !");
      }
    });
  }
};

module.exports.logoutUser = function (res, req) {
  res.cookie("token", "");
  res.redirect("/");
};
