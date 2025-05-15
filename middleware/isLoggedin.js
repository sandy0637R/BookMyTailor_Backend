const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async function (req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    console.log("Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("Decoded token:", decoded);

    const user = await userModel.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isAdminInDB = Array.isArray(user.roles) && user.roles.includes("admin");
    const isAdminInToken = decoded.role && decoded.role === "admin";

    if (isAdminInDB && !isAdminInToken) {
      return res.status(403).json({ message: "Admin must login using admin mode." });
    }

    if (!isAdminInDB && isAdminInToken) {
      return res.status(403).json({ message: "You are not an admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    return res.status(401).json({ message: "Token verification failed" });
  }
};
