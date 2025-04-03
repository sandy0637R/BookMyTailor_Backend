const express = require("express");
const isLoggedin = require("../middleware/isLoggedin");
const router = express.Router();

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/shop", isLoggedin, function (res, req) {
  res.render("shop");
});
module.exports = router;
