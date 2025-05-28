// routes/githubRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateGitHub,
  getGitHubData,
  checkGitHubAuthStatus
} = require("../controllers/githubController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have auth middleware

// Authenticate with GitHub
router.post("/authenticate", authMiddleware, authenticateGitHub);

// Get GitHub data for authenticated user
router.get("/data", authMiddleware, getGitHubData);

// Check GitHub authentication status
router.get("/auth-status", authMiddleware, checkGitHubAuthStatus);

module.exports = router;