const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async function (req, res, next) {
  let token;

  // Extract token from the Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Decode token and verify user
    const decoded = jwt.verify(token, process.env.JWT_KEY); // Use your JWT secret key

    // Find the user in DB based on decoded email or user ID (match with the token's payload)
    const user = await userModel.findOne({ email: decoded.email }).select("-password"); // Exclude password field

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user object to request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.log(err.message);
    return res.status(401).json({ message: "Token verification failed" });
  }
};
