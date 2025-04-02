const mongoose = require("mongoose");

const tailorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String, 
  email: String,  
  password:  String,
  experience: Number,
  specialization: String,
  fees: Number, 
  topDesigns: [{ type: String }],
  ratings: { type: Number, default: 0 },
});

module.exports = mongoose.model("Tailor", tailorSchema);
