const jwt = require("jsonwebtoken");

const generateToken = (user, userRole = "customer") => {
  return jwt.sign(
    {
      email: user.email,
      _id: user._id,     // ✅ correct key for token decoding
      role: userRole,
    },
    process.env.JWT_KEY,
    { expiresIn: "1d" }
  );
};

module.exports.generateToken = generateToken;
