const userModel = require("../models/User");

exports.getAllPosts = async (req, res) => {
  try {
    const users = await userModel.find().select("name email tailorDetails.posts");

    let allPosts = [];

    users.forEach(user => {
      const posts = user.tailorDetails?.posts || [];
      posts.forEach(post => {
        allPosts.push({
          ...post.toObject(),
          postedBy: {
            name: user.name,
            email: user.email,
            userId: user._id,
          }
        });
      });
    });

    if (allPosts.length === 0) {
      return res.status(200).json({ message: "No posts found from any user." });
    }

    res.status(200).json(allPosts);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};
