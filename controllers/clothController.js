const Cloth = require("../models/Cloths");
const path = require("path");
const fs = require("fs");

exports.getAllCloths = async (req, res) => {
  try {
    const cloths = await Cloth.find().populate("tailor", "name"); // 👈 Add this
    res.status(200).json(cloths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cloths", error });
  }
};


exports.getClothById = async (req, res) => {
  try {
    const cloth = await Cloth.findById(req.params.id).populate("tailor", "name"); // 👈 Add this
    if (!cloth) {
      return res.status(404).json({ message: "Cloth not found" });
    }
    res.json(cloth);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addCloth = async (req, res) => {
  try {
    const { name, type, size, gender, price, description } = req.body;

    if (!req.user || !req.user.roles.includes("tailor")) {
      return res.status(403).json({ message: "Only tailors can add clothes." });
    }

    const imagePath = req.file ? `/uploads/clothImages/${req.file.filename}` : null;
    if (!imagePath) return res.status(400).json({ message: "Image is required." });

    const newCloth = new Cloth({
      name,
      type,
      tailor: req.user._id,
      size,
      gender,
      price,
      description,
      image: imagePath,
    });

    await newCloth.save();
    res.status(201).json({ message: "Cloth added successfully", cloth: newCloth });
  } catch (error) {
    res.status(500).json({ message: "Error adding cloth", error: error.message });
  }
};

exports.updateCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || (!req.user.roles.includes("tailor") && !req.user.roles.includes("admin"))) {
      return res.status(403).json({ message: "Only tailors or admins can update clothes." });
    }

    const existingCloth = await Cloth.findById(id);
    if (!existingCloth) {
      return res.status(404).json({ message: "Cloth not found" });
    }

    let updatedImagePath = existingCloth.image;
    if (req.file) {
      const oldImagePath = path.join(__dirname, "..", existingCloth.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      updatedImagePath = `/uploads/clothImages/${req.file.filename}`;
    }

    const updatedData = {
      ...req.body,
      image: updatedImagePath,
    };

    const updatedCloth = await Cloth.findByIdAndUpdate(id, updatedData, { new: true });
    res.json({ message: "Cloth updated successfully", cloth: updatedCloth });
  } catch (error) {
    res.status(500).json({ message: "Error updating cloth", error: error.message });
  }
};


exports.deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || (!req.user.roles.includes("tailor") && !req.user.roles.includes("admin"))) {
      return res.status(403).json({ message: "Only tailors or admins can delete clothes." });
    }

    const cloth = await Cloth.findById(id);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    const imagePath = path.join(__dirname, "..", cloth.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await Cloth.findByIdAndDelete(id);
    res.json({ message: "Cloth deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cloth", error: error.message });
  }
};


exports.getClothsByTailor = async (req, res) => {
  try {
    if (!req.user || !req.user.roles.includes("tailor")) {
      return res.status(403).json({ message: "Only tailors can view their clothes." });
    }

    const cloths = await Cloth.find({ tailor: req.user._id }).populate("tailor", "name"); // 👈 Add this
    res.status(200).json(cloths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tailor's clothes", error: error.message });
  }
};

