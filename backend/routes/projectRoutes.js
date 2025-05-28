const express = require("express");
const router = express.Router(); // Create an Express router
const {
  createProject,
  getProjectsByUserId,
} = require("../controllers/projectController"); // Import project controller functions
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

module.exports = router; // Export the router
