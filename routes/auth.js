import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const auth = express.Router();

auth.post("/register", async (req, res) => {
  const { email, password, role, name, bio, skills, portfolio } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ message: "Please provide all the fields" });
  }

  if (!["freelancer", "employer"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either freelancer or employer" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      profile: { name, bio, skills, portfolio },
    });

    const token = jwt.sign(
      {
        newUser,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await newUser.save();

    return res.json({
      newUser,
      token,
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

auth.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User with this email not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  if (user && isMatch) {
    const token = jwt.sign(
      {
        user,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res
      .json({
        user,
        token,
        message: "Sucessfully LoggedIn",
      })
      .status(200);
  } else {
    return res.status;
  }
});

export default auth;
