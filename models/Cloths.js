const mongoose = require("mongoose");

const clothSchema = new mongoose.Schema({
  name: String,
  category: String,
  sizes: [String],
  price: Number,
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tailor" },
  image: String,
});

module.exports = mongoose.model("Cloth", clothSchema);
