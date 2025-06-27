const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async function (socket, next) {
  const handshake = socket.handshake;
  let token = null;

  try {
    // 1. Authorization header
    if (handshake.headers.authorization?.startsWith("Bearer ")) {
      token = handshake.headers.authorization.split(" ")[1];
    }

    // 2. Cookie token
    if (!token && handshake.headers.cookie) {
      const cookies = Object.fromEntries(
        handshake.headers.cookie.split(';').map(cookie => {
          const [name, value] = cookie.trim().split('=');
          return [name, value];
        })
      );
      token = cookies.token;
    }

    // 3. Auth object
    if (!token && handshake.auth?.token) {
      token = handshake.auth.token;
    }

    // No token found
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findById(decoded._id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Admin checks
    const isAdminInDB = Array.isArray(user.roles) && user.roles.includes("admin");
    const isAdminInToken = decoded.role === "admin";

    if (isAdminInDB !== isAdminInToken) {
      return next(new Error("Authentication error: Role mismatch"));
    }

    // Attach user
    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};
