const jwt = require("jsonwebtoken");

const generateToken = (user, role = "user") => {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
      role, // ✅ include role in token payload
    },
    process.env.JWT_KEY,
  );
};

module.exports.generateToken = generateToken;
