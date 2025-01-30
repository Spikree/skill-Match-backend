import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";

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

    return res.status(200).json({
      message: "Fteched user details sucessfully",
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default visitProfile;
