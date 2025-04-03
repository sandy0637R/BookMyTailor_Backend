const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async function (req, res, next) {
  if (!req.cookies.token) {
    req.flash("error", "You need to login first");
    return res.redirect("/");
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    let user = await userModel
      .findOne({ email: decoded.email })
      .select("-password"); //This will exclude the password from the data we are getting from the session of user
    req.user = user;
    next();
  } catch (err) {
    req.flash("error", "something went wrong.");
    res.redirect("/");
  }
};
