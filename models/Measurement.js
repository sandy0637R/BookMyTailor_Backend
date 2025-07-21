const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    measurements: {
      chest: { type: Number },
      waist: { type: Number },
      hips: { type: Number },
      shoulder: { type: Number },
      sleeveLength: { type: Number },
      neck: { type: Number },
      inseam: { type: Number },
      length: { type: Number },
      bust: { type: Number },
      armhole: { type: Number },
      wrist: { type: Number },
      thigh: { type: Number },
      ankle: { type: Number },
      knee: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Measurement", measurementSchema);
