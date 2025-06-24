const userModel = require("../models/User");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const path = require("path");
const fs = require("fs");
const postService=require("./postService")

const { createProfileImageUpload, createPostImageUpload } = require("../middleware/multerConfig");


// Multer middleware setup
const uploadImage = createProfileImageUpload();
const uploadPostImages = createPostImageUpload();

module.exports.uploadImage = uploadImage.single("profileImage");
module.exports.uploadPostImages = uploadPostImages.array("images", 5);

// Register User
module.exports.registerUser = async function (req, res) {
  try {
    let { name, email, password, wishlist, orders, roles = ["customer"] } = req.body;

    console.log("Request Body:", req.body);

    if (roles.includes("admin")) {
      console.log("Checking for existing admin...");
      const existingAdmin = await userModel.findOne({ roles: "admin" });
      if (existingAdmin) {
        return res.status(403).send("Admin already exists.");
      }
      if (roles.length > 1) {
        return res.status(400).send("Admin cannot have other roles.");
      }
      console.log("Assigning admin role...");
      roles = ["admin"];
    }

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
          roles,
          wishlist,
          orders,
        });

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
} else if (user.roles.includes("tailor") && updates.tailorDetails) {
  // ✅ update tailorDetails if already a tailor
  user.tailorDetails = {
    ...user.tailorDetails,
    ...updates.tailorDetails,
  };
}


    if (req.file) {
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      user.profileImage = req.file.path.replace(/\\/g, "/");
    }

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.address) user.address=updates.address;

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
        fs.unlinkSync(imagePath);
        user.profileImage = null;
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

// Check if admin exists
module.exports.checkAdmin = async function (req, res) {
  try {
    console.log("Checking for admin...");
    const admin = await userModel.findOne({ roles: "admin" });
    res.json({ exists: !!admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Post-related controllers

// Add Post
module.exports.addPost = async function (req, res) {
  try {
    const userId = req.user._id;
    const postData = req.body;

    // Pass full file objects, not only paths
    const images = req.files && req.files.length > 0 ? req.files : [];

    const result = await postService.addPost(userId, postData, images);
    res.status(201).json({ message: "Post created", post: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update Post
module.exports.updatePost = async function (req, res) {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;
    const updateData = req.body;

    // Pass full file objects, not only paths
    const images = req.files && req.files.length > 0 ? req.files : [];

    const result = await postService.updatePost(userId, postId, updateData, images);
    res.status(200).json({ message: "Post updated", post: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


module.exports.deletePost = async function (req, res) {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;
    await postService.deletePost(userId, postId);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};



module.exports.getAllPosts = async function (req, res) {
  try {
    const userId = req.user._id;
    const posts = await postService.getAllPosts(userId);
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.body;

    if (!itemId) return res.status(400).json({ message: "Item ID is required" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(itemId)) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    user.wishlist.push(itemId);
    await user.save();

    res.status(200).json({ success: true, message: "Item added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Error in addToWishlist:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const itemId = req.params.itemId;

    user.wishlist = user.wishlist.filter(id => id.toString() !== itemId);
    await user.save();

    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Error in removeFromWishlist:", err);
    res.status(500).send("Server error");
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (entry) => entry.item.toString() === itemId
    );

    if (existingItem) {
      // If item already in cart → increase quantity
      await userModel.updateOne(
        { _id: req.user._id, "cart.item": itemId },
        {
          $inc: { "cart.$.quantity": 1 },
          $pull: { wishlist: itemId },
        }
      );
    } else {
      // If item not in cart → push new item
      await userModel.updateOne(
        { _id: req.user._id },
        {
          $push: { cart: { item: itemId, quantity: 1 } },
          $pull: { wishlist: itemId },
        }
      );
    }

    const updatedUser = await userModel.findById(req.user._id);

    res.status(200).json({
      message: "Item added to cart",
      cart: updatedUser.cart,
      wishlist: updatedUser.wishlist,
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).send("Server error");
  }
};





exports.removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const itemId = req.params.itemId;

    const existingItem = user.cart.find(
      (entry) => entry.item.toString() === itemId
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
    } else {
      user.cart = user.cart.filter((entry) => entry.item.toString() !== itemId);
    }

    await user.save();

    res.status(200).json({ message: "Updated cart", cart: user.cart });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).send("Server error");
  }
};


