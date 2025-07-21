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
      // Shared fields
      waist: { type: Number },
      hip: { type: Number },
      inseam: { type: Number },
      rise: { type: Number },
      thigh: { type: Number },

      // Male-specific
      chest: { type: Number },
      shoulderWidth: { type: Number },
      sleeveLength: { type: Number },
      shirtLength: { type: Number },
      neck: { type: Number },

      // Female-specific
      bust: { type: Number },
      topLength: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Measurement", measurementSchema);
