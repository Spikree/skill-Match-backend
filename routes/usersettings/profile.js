import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";

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

profile.get("/getUser", verifyToken, async (req,res) => {
  const {user} = req.user;

  try {
    const userDetails = await User.findById(user._id);

    if(!userDetails) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    return res.status(200).json({
      message: "Fteched user details sucessfully",
      userDetails
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

export default profile;
