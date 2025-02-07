import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";
import Rating from "../../models/rating.js";

const visitProfile = express.Router();

visitProfile.get("/getUserProfile/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;
  try {
    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    

    const ratings = await Rating.find({
      reviewOf: userDetails._id
    })

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

export default visitProfile;
