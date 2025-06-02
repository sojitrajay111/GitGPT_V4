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
  deleteCollaborator,
  updateCollaboratorPermissions,
  handleGitHubWebhook,
  createBranch,
  getRepoBranches,
  getUserAndGithubData,
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

// Add this logging middleware to the DELETE route
router.delete(
  "/collaborators/:projectId/:githubUsername",
  (req, res, next) => {
    console.log(
      `DEBUG: Hitting DELETE route for project: ${req.params.projectId}, user: ${req.params.githubUsername}`
    );
    next(); // IMPORTANT: Pass control to the next middleware/handler
  },
  authenticateUser,
  deleteCollaborator
);

// Add this logging middleware to the PUT route
router.put(
  "/collaborators/:projectId/:githubUsername/permissions",
  (req, res, next) => {
    console.log(
      `DEBUG: Hitting PUT permissions route for project: ${req.params.projectId}, user: ${req.params.githubUsername}`
    );
    next(); // IMPORTANT: Pass control to the next middleware/handler
  },
  authenticateUser,
  updateCollaboratorPermissions
);

router.post("/webhook", handleGitHubWebhook);

router.post("/repos/:owner/:repo/branches", authenticateUser, createBranch);

router.get("/repos/:owner/:repo/branches", authenticateUser, getRepoBranches);
router.get(
  "/user-and-github-data/:userId",
  authenticateUser,
  getUserAndGithubData
);

module.exports = router;
