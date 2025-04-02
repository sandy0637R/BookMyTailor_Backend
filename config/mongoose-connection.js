const mongoose = require("mongoose");
const config= require("config")
mongoose
  .connect(`${config.get("MONGODB_URI")}/bookmytailor`)
  .then(function () {
    console.log("connected");
  })
  .catch(function (err) {
    console.log(err);
  });

module.exports = mongoose.connection;
