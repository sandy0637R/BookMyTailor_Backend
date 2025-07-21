const Measurement = require("../models/Measurement");

exports.addMeasurement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, gender, measurements } = req.body;

    const existing = await Measurement.find({ user: userId });
    if (existing.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 measurements allowed" });
    }

    const newMeasurement = await Measurement.create({
      user: userId,
      name,
      gender,
      measurements: measurements || {},
    });

    res.status(201).json({ message: "Measurement added", newMeasurement });
  } catch (error) {
    console.error("❌ Add Measurement Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMeasurements = async (req, res) => {
  try {
    const userId = req.user._id;
    const measurements = await Measurement.find({ user: userId });
    res.status(200).json(measurements);
  } catch (error) {
    console.error("❌ Get Measurements Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteMeasurement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const measurement = await Measurement.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    res.status(200).json({ message: "Measurement deleted" });
  } catch (error) {
    console.error("❌ Delete Measurement Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateMeasurement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, gender, measurements } = req.body;

    const updated = await Measurement.findOneAndUpdate(
      { _id: id, user: userId },
      { name, gender, measurements },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    res.status(200).json({ message: "Measurement updated", updated });
  } catch (error) {
    console.error("❌ Update Measurement Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

