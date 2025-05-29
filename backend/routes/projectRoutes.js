const express = require("express");
const router = express.Router(); // Create an Express router
const {
  createProject,
  getProjectsByUserId,
  getProjectById,
} = require("../controllers/projectController"); // Import project controller functions
const {
  getCollaboratorsByProjectId,
} = require("../controllers/githubController");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have an authentication middleware

// --- Project Routes ---

/**
 * @route POST /
 * @desc Create a new project.
 * This route will be accessible at /api/projects (due to app.use in index.js)
 * @access Private
 */
router.post("/", authMiddleware, createProject);

/**
 * @route GET /user/:userId
 * @desc Get all projects for a specific user.
 * This route will be accessible at /api/projects/user/:userId (due to app.use in index.js)
 * @access Private
 */
router.get("/user/:userId", authMiddleware, getProjectsByUserId);
router.get("/:projectId", authMiddleware, getProjectById); // New: Get a specific project by its ID

// --- Project Collaborators ---
// Moved getCollaboratorsByProjectId to be under the project context, as it relates to a specific project
router.get(
  "/:projectId/collaborators",
  authMiddleware,
  getCollaboratorsByProjectId
); // New: Get collaborators for a project

module.exports = router; // Export the router
