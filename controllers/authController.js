const userModel = require("../models/User");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Register User
module.exports.registerUser = async function (req, res) {
  try {
    let { name, email, password, wishlist, orders, roles = ["customer"] } = req.body;  // Change to 'let' for roles
    console.log("Request Body:", req.body);  // Log the incoming request body

    // If admin is selected, check if an admin already exists
    if (roles.includes("admin")) {
      console.log("Checking for existing admin...");
      const existingAdmin = await userModel.findOne({ roles: "admin" });
      if (existingAdmin) {
        return res.status(403).send("Admin already exists.");
      }

      // Ensure only 'admin' role is assigned if 'admin' is selected
      if (roles.length > 1) {
        return res.status(400).send("Admin cannot have other roles.");
      }

      console.log("Assigning admin role...");
      roles = ["admin"]; // Now you can safely reassign roles
    }

    // Check if the user already exists by email
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(401).send("User already exists, please login.");
    }

    console.log("Hashing the password...");
    bcryptjs.genSalt(10, function (err, salt) {
      if (err) {
        console.log("Error generating salt:", err.message);
        return res.status(500).send("Error generating salt.");
      }

      bcryptjs.hash(password, salt, async function (err, hash) {
        if (err) {
          console.log("Error hashing password:", err.message);
          return res.status(500).send("Error hashing password.");
        }

        console.log("Password hashed successfully. Creating user...");
        user = await userModel.create({
          name,
          email,
          password: hash,
          roles,    // Store the roles in the user document
          wishlist,
          orders,
        });

        // Generate the token for the new user
        let token = generateToken(user);
        res.cookie("token", token);
        res.status(201).send("User created successfully");
      });
    });
  } catch (err) {
    console.log("Error during registration:", err.message);
    res.status(500).send("Internal server error.");
  }
};






// Login User
// Login User
module.exports.loginUser = async function (req, res) {
  const { email, password, role } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    const isAdminInDB = user.roles.includes("admin");
    const isAdminLogin = role === "admin";

    if (isAdminInDB && !isAdminLogin) {
      return res.status(403).json({ message: "You are an admin. Please select 'Login as Admin'." });
    }

    if (!isAdminInDB && isAdminLogin) {
      return res.status(403).json({ message: "You are not an admin." });
    }

    bcryptjs.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error, please try again later." });
      }

      if (result) {
        // Generate token with full user object and correct role string
        const token = generateToken(user, user.roles[0]);
        res.cookie("token", token);

        res.status(200).json({
          message: "Login successful",
          success: true,
          token,
          email,
          name: user.name,
          roles: user.roles,
        });
      } else {
        res.status(401).json({ message: "Incorrect password." });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};




// Get Profile
module.exports.getProfile = async function (req, res) {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error.");
  }
};


// Update Profile with optional image upload
module.exports.updateProfile = async function (req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send("User not found.");

    if (!user.roles) user.roles = ["customer"];

    const incomingRoles = (updates.roles || updates.role || []).map(r => r.toLowerCase());
    const isAddingTailor = incomingRoles.includes("tailor") && !user.roles.includes("tailor");

    if (isAddingTailor) {
      const { experience, specialization, fees } = updates.tailorDetails || {};
      if (!experience || !specialization || !fees) {
        return res.status(400).json({
          message: "Tailor details must include experience, specialization, and fees.",
        });
      }
      user.tailorDetails = updates.tailorDetails;
      user.roles.push("tailor");
    }

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;

    // Handle profile image if uploaded
    if (req.file) {
      if (user.profileImage) {
        // If there's an existing image, delete it
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const profileImagePath = req.file.path.replace(/\\/g, '/');
      user.profileImage = profileImagePath;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};

// Delete Profile Image
module.exports.deleteProfileImage = async function (req, res) {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send("User not found.");

    if (user.profileImage) {
      const imagePath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        user.profileImage = null; // Remove the image reference from the user object
        await user.save();
        return res.status(200).send("Profile image deleted successfully.");
      }
      return res.status(404).send("Image not found.");
    }

    return res.status(404).send("No profile image to delete.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};

// ✅ Fixed uploadImage middleware
module.exports.uploadImage = upload.single("profileImage");

module.exports.checkAdmin = async function (req,res){
  try {
    console.log("Checking for admin...");
    const admin = await userModel.findOne({ roles: "admin" });
    res.json({ exists: !!admin });
  } catch (err) {
    console.error(err); // Show actual error in terminal
    res.status(500).json({ error: "Server error" });
  }
}