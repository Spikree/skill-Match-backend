import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";
import Rating from "../../models/rating.js";

const profile = express.Router();

profile.put("/edit", verifyToken, async (req, res) => {
  const { user } = req.user;
  const { name, bio, skills, portfolio } = req.body;

  try {
    const isUser = await User.findById(user._id);

    if (!isUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) isUser.profile.name = name;
    if (bio !== undefined) isUser.profile.bio = bio;
    if (skills !== undefined) isUser.profile.skills = skills;
    if (portfolio !== undefined) isUser.profile.portfolio = portfolio;

    const updatedUser = await isUser.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

profile.get("/getUser", verifyToken, async (req, res) => {
  const { user } = req.user;

  try {
    const userDetails = await User.findById(user._id);

    if (!userDetails) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const ratings = await Rating.find({
      reviewOf: userDetails._id,
    });

    const totalRatings = ratings.length;

    let averageRating = 0;

    if (totalRatings > 0) {
      const sumOfRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      averageRating = (sumOfRatings / totalRatings).toFixed(1); // Rounds to 1 decimal place
    }

    return res.status(200).json({
      message: "Fteched user details sucessfully",
      userDetails,
      ratingStats: {
        averageRating: parseFloat(averageRating),
        totalRatings
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default profile;
