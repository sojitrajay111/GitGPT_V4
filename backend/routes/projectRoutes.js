const express = require("express");
const router = express.Router(); // Create an Express router
const {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProject, // New: Import updateProject
  deleteProject, // New: Import deleteProject
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

/**
 * @route GET /:projectId
 * @desc Get a specific project by its ID.
 * @access Private
 */
router.get("/:projectId", authMiddleware, getProjectById); // Existing: Get a specific project by its ID

/**
 * @route PUT /:projectId
 * @desc Update an existing project.
 * @access Private (requires project ownership)
 */
router.put("/:projectId", authMiddleware, updateProject); // New: Route for updating a project

/**
 * @route DELETE /:projectId
 * @desc Delete a project.
 * @access Private (requires project ownership)
 */
router.delete("/:projectId", authMiddleware, deleteProject); // New: Route for deleting a project

// --- Project Collaborators ---
// Moved getCollaboratorsByProjectId to be under the project context, as it relates to a specific project
router.get(
  "/:projectId/collaborators",
  authMiddleware,
  getCollaboratorsByProjectId
); // New: Get collaborators for a project

module.exports = router; // Export the router
