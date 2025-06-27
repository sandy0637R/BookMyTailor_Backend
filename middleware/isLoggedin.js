const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization Header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check Cookie Token
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. No Token Found
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // 4. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 5. Optional Role Check
    const isAdminInDB = Array.isArray(user.roles) && user.roles.includes("admin");
    const isAdminInToken = decoded.role === "admin";

    if (isAdminInDB && !isAdminInToken) {
      return res.status(403).json({ message: "Admin must login using admin mode." });
    }

    if (!isAdminInDB && isAdminInToken) {
      return res.status(403).json({ message: "You are not an admin." });
    }

    // 6. Attach user to req
    req.user = user;
    next();

  } catch (err) {
    console.error("🔒 Auth error:", err.message);
    res.status(401).json({ message: "Unauthorized: Token invalid" });
  }
};
