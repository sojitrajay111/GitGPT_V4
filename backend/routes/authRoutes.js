// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
// Example controller

// Auth routes
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
});
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router; // ✅ MUST export the router
