const Cloth = require("../models/Cloths");

exports.getAllCloths = async (req, res) => {
  try {
    const cloths = await Cloth.find();
    res.status(200).json(cloths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cloths", error });
  }
};
