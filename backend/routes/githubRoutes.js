// routes/github.js (or wherever you define your routes)
const express = require("express");
const router = express.Router();
const {
  authenticateGitHub,
  getGitHubStatus,
  disconnectGitHub,
  getGitHubData,
  checkGitHubAuthStatus,
} = require("../controllers/githubController");

// Middleware to authenticate user (replace with your auth middleware)
const authenticateUser = require("../middleware/authMiddleware"); // Your auth middleware

// New unified route - gets both authentication status and data
router.get("/status", authenticateUser, getGitHubStatus);

// Authenticate/Connect GitHub account
router.post("/authenticate", authenticateUser, authenticateGitHub);

// Disconnect GitHub account
router.delete("/disconnect", authenticateUser, disconnectGitHub);

// Legacy routes (keep for backward compatibility)
router.get("/auth-status", authenticateUser, checkGitHubAuthStatus);
router.get("/data", authenticateUser, getGitHubData);

module.exports = router;
