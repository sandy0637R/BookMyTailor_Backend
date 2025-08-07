const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  // Common for Male Top
  chest: Number,
  shoulderWidth: Number,
  sleeveLength: Number,
  shirtLength: Number,
  neck: Number,

  // Male Bottom
  waist: Number,
  hip: Number,
  inseam: Number,
  rise: Number,
  thigh: Number,

  // Female Top
  bust: Number,
  topLength: Number,

  // Female Bottom – values reused from male
}, { _id: false });

const customRequestSchema = new mongoose.Schema({
  image:  String, // image filename or URL
  measurements: { type: measurementSchema, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  budget: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  duration: { type: Date, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Uploaded", "Accepted", "Ready", "Out for Delivery", "Delivered", "Confirmed"],
    default: "Uploaded",
  },
  tailorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  deliveredAt: {
  type: Date,
  default: null,
},

  acceptedAt: { 
    type: Date,
    default: null,
  },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = customRequestSchema;
