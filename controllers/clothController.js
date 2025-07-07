const Cloth = require("../models/Cloths");

exports.getAllCloths = async (req, res) => {
  try {
    const cloths = await Cloth.find();
    res.status(200).json(cloths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cloths", error });
  }
};

exports.getClothById = async (req, res) => {
  try {
    const cloth = await Cloth.findById(req.params.id);
    if (!cloth) {
      return res.status(404).json({ message: "Cloth not found" });
    }
    res.json(cloth);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};