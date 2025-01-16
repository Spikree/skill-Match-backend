import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";
import bcrypt from "bcryptjs";

const resetpassword = express.Router();

resetpassword.put("/resetpassword", verifyToken, async (req, res) => {
  const { user } = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    return res.status(400).json({
      message: "Please provide old password",
    });
  }
  if (!newPassword) {
    return res.status(400).json({
      message: "Please provide new password",
    });
  }

  try {
    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, isUser.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    isUser.password = hashedPassword;

    isUser.save();

    return res.status(200).json({
      message: "password changed sucessfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

export default resetpassword;