const mongoose = require("mongoose");

const tailorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String, 
  email: String,  
  password:  String,
  experience: Number,
  specialization: String,
  fees: Number, 
  topDesigns: [],
  ratings: Number
});

module.exports = mongoose.model("Tailor", tailorSchema);
