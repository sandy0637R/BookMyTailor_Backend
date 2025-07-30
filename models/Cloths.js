const mongoose = require("mongoose");

const clothSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  size: { type: [String], default: ["S", "M", "L", "XL"] },
  gender: { type: String, enum: ["Male", "Female", "Unisex"], required: true },
  price: { type: Number, required: true },
  image: { type: String,required: true },
  description: { type: String, default: "N/A" }, 
  createdAt: { type: Date, default: Date.now }

});

clothSchema.index({ tailor: 1 });

module.exports = mongoose.model("Cloth", clothSchema);
