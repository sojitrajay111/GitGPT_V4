const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: "Gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Destructure username, email, password, and role

    // Check if the username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if the email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password - this part might become optional if you're only using it for direct registration,
    // or you'd call it if a password is provided. For the invite flow, it's not needed here.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set default status to 'active' for developers, undefined for managers
    let status;
    if (role === "developer") {
      status = "active";
    }

    // Create user with hashed password, email, and role
    const user = new User({
      username,
      email,
      password: hashedPassword, // This password will be set via reset-password in the invite flow
      role: role, // Assign the role from the request body
      status: status, // Assign status based on role
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
    const { identifier, password } = req.body; // 'identifier' can be either username or email

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" }); // Generic message for security
    }

    // Check if password is set (i.e., not blank or contains only whitespace)
    if (!user.password || user.password.trim() === "") {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Please set your password first. Check your invitation email.",
        });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" }); // Generic message for security
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Check if JWT_SECRET is loaded
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined. Check your .env file.");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
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
          username: user.username,
          email: user.email, // Include email in response
          role: user.role,
          status: user.status, // Include status in response
          isAuthenticatedToGithub: user.isAuthenticatedToGithub,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request for Your Account", // More specific subject
      html: `
    <div style="font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #1e40af; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Dear User,</p>
      <p>We received a request to reset the password for your account. If you did not make this request, please disregard this email.</p>
      <p>To reset your password, please click on the button below. This link is valid for <strong>1 hour</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p>For your security, if you did not initiate this password reset, no action is required. Your current password will remain unchanged.</p>
      <p style="margin-top: 30px;">Best regards,</p>
      <p>The GitGPT Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #777; text-align: center;">
        If you are having trouble clicking the "Reset My Password" button, copy and paste the URL below into your web browser:<br>
        <a href="${resetUrl}" style="color: #3b82f6; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  `,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Password reset link has been sent to your email",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // If email sending fails, remove the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw new Error("Failed to send reset email. Please try again later.");
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: error.message || "Error processing password reset request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
