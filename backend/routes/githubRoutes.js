// routes/github.js (or wherever you define your routes)
const express = require("express");
const router = express.Router();
const {
  authenticateGitHub,
  getGitHubStatus,
  disconnectGitHub,
  getGitHubData,
  checkGitHubAuthStatus,
  getUserGithubRepos, // <--- Make sure this is imported
  searchGithubUsers,
  addCollaborator,
} = require("../controllers/githubController");

// Middleware to authenticate user (replace with your auth middleware)
const authenticateUser = require("../middleware/authMiddleware"); // Your auth middleware

// New unified route - gets both authentication status and data
router.get("/status", authenticateUser, getGitHubStatus);

// Authenticate/Connect GitHub account
router.post("/authenticate", authenticateUser, authenticateGitHub);

// Disconnect GitHub account
router.delete("/disconnect", authenticateUser, disconnectGitHub);

// Route to get user's private GitHub repositories
router.get("/repos", authenticateUser, getUserGithubRepos); // <--- Added this route
router.get("/search/users", authenticateUser, searchGithubUsers); // New: Search GitHub users
router.post("/collaborators", authenticateUser, addCollaborator);

// Legacy routes (keep for backward compatibility)
router.get("/auth-status", authenticateUser, checkGitHubAuthStatus);
router.get("/data", authenticateUser, getGitHubData);

module.exports = router;
