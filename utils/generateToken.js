const jwt = require("jsonwebtoken");

const generateToken = (user, userRole = "customer") => {
  return jwt.sign(
    {
      email: user.email,
      _id: user._id,    
      role: userRole,
    },
    process.env.JWT_KEY,
  );
};

module.exports.generateToken = generateToken;
