const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is loaded correctly from your .env file

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body; // Destructure username, password, and role

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password and role
    const user = new User({
      username,
      password: hashedPassword,
      role: role, // Assign the role from the request body
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Log the actual error for debugging purposes
    console.error("Registration Error:", error);
    res
      .status(400)
      .json({ message: error.message || "User registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body; // Expect username instead of email

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Invalid username" }); // Generic message for security
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" }); // Generic message for security
    }

    // Check if JWT_SECRET is loaded
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined. Check your .env file.");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2d",
    });

    res
      .cookie("token", token, {
        httpOnly: true, // middleware can now access it securely
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // works well for frontend-backend on different ports locally
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      })
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          username: user.username, // Only send username, not email
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
