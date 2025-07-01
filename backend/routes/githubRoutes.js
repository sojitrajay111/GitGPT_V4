// routes/githubRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateGitHub,
  getGitHubStatus,
  disconnectGitHub,
  getGitHubData, // Legacy
  checkGitHubAuthStatus, // Legacy
  getUserGithubRepos,
  searchGithubUsers,
  addCollaborator,
  deleteCollaborator, // Make sure this is the one you intend if you have multiple
  updateCollaboratorPermissions,
  handleGitHubWebhook,
  // Using the new/updated controller function names for clarity and consistency
  createBranch, // This will map to createNewBranch from controller
  getRepoBranches, // This will map to listRepoBranches from controller
  deleteExistingBranch,
  listPullRequests,
  createNewPullRequest,
  updateExistingPullRequest,
  getUserAndGithubData,
  getCollaboratorsByProjectId, // Added this to imports as it's used in a route
  deleteGithubRepo, // New: Import deleteGithubRepo
  getGitHubDetails, // New: Import getGitHubDetails
  addOrUpdateGitHubDetails, // New: Import addOrUpdateGitHubDetails
  deleteGitHubDetails, // New: Import deleteGitHubDetails
  getRepoBranchesServer,
} = require("../controllers/githubController");

// Middleware to authenticate user (ensure this path is correct)
const authenticateUser = require("../middleware/authMiddleware");

// --- General GitHub Account Routes ---
router.get("/status", authenticateUser, getGitHubStatus);
router.post("/authenticate", authenticateUser, authenticateGitHub);
router.delete("/disconnect", authenticateUser, disconnectGitHub);

// New: Routes for managing user's GitHub integration details
router.get("/details/:userId", authenticateUser, getGitHubDetails);
router.post("/details/:userId", authenticateUser, addOrUpdateGitHubDetails);
router.delete("/details/:userId", authenticateUser, deleteGitHubDetails);

// --- User and Repository Info ---
router.get("/repos", authenticateUser, getUserGithubRepos); // List user's own repos (for project creation)
router.get("/search/users", authenticateUser, searchGithubUsers);
router.get(
  "/user-and-github-data/:userId",
  authenticateUser,
  getUserAndGithubData
);

// --- Collaborators ---
// For a specific project (if collaborators are tied to projects in your system)
router.get(
  "/projects/:projectId/collaborators",
  authenticateUser,
  getCollaboratorsByProjectId
);
// General collaborator management (as per your existing structure)
router.post("/collaborators", authenticateUser, addCollaborator);
router.delete(
  "/collaborators/:projectId/:githubUsername",
  authenticateUser,
  deleteCollaborator
);
router.put(
  "/collaborators/:projectId/:githubUsername/permissions",
  authenticateUser,
  updateCollaboratorPermissions
);

// --- Branch Management for a specific repository ---
// The :owner and :repo params will be extracted from project's githubRepoLink on the frontend
router.get("/repos/:owner/:repo/branches", authenticateUser, getRepoBranches); // Maps to listRepoBranches
router.post("/repos/:owner/:repo/branches", authenticateUser, createBranch); // Maps to createNewBranch
router.delete(
  "/repos/:owner/:repo/branches/:branchNameEncoded",
  authenticateUser,
  deleteExistingBranch
);

// --- Pull Request Management for a specific repository ---
router.get("/repos/:owner/:repo/pulls", authenticateUser, listPullRequests);
router.post(
  "/repos/:owner/:repo/pulls",
  authenticateUser,
  createNewPullRequest
);
router.patch(
  "/repos/:owner/:repo/pulls/:pullNumber",
  authenticateUser,
  updateExistingPullRequest
);

// --- GitHub Repository Management ---
/**
 * @route DELETE /repos/:owner/:repo
 * @desc Delete a GitHub repository.
 * @access Private (requires user authentication and appropriate GitHub permissions)
 */
router.delete("/repos/:owner/:repo", authenticateUser, deleteGithubRepo); // New: Route for deleting a GitHub repo

// --- Webhook ---
// Ensure this route is configured for raw body parsing if verifying signatures
// e.g., app.use('/api/github/webhook', express.raw({ type: 'application/json' }), githubWebhookRoute);
router.post("/webhook", handleGitHubWebhook);

// --- Legacy Routes (if still needed) ---
router.get("/auth-status", authenticateUser, checkGitHubAuthStatus);
router.get("/data", authenticateUser, getGitHubData);

// Add route to fetch branches from backend
router.get("/branches", getRepoBranchesServer);

module.exports = router;
