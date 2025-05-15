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
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await userModel.findOne({ email: decoded.email }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Strict role match: block admin if not logged in as admin
    const isAdminInDB = user.roles.includes("admin");
    const isAdminInToken = decoded.role === "admin";

    if (isAdminInDB && !isAdminInToken) {
      return res.status(403).json({ message: "Admin must login using admin mode." });
    }

    // ✅ Block non-admins logging in as admin
    if (!isAdminInDB && isAdminInToken) {
      return res.status(403).json({ message: "You are not an admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err.message);
    return res.status(401).json({ message: "Token verification failed" });
  }
};
