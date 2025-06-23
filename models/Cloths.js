const mongoose = require("mongoose");

const clothSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  manufacturer: { type: String },
  size: { type: [String], default: ["S", "M", "L", "XL"] },
  gender: { type: String, enum: ["Male", "Female", "Unisex"], required: true },
  price: { type: Number, required: true },
  image: { type: String,required: true },
  description: { type: String, default: "N/A" }, 
});

module.exports = mongoose.model("Cloth", clothSchema);
