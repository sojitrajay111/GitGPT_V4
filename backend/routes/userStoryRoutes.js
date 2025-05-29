const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware"); // Assuming this path is correct for your authentication middleware
const {
  createUserStory,
  getUserStoriesByProjectId,
} = require("../controllers/userStoryController"); // Import the specific functions from your userStoryController

/**
 * @route POST /api/user-stories
 * @desc Create a new user story for a project
 * @access Private (requires authentication)
 */
router.post("/", authenticateUser, createUserStory);

/**
 * @route GET /api/user-stories/:projectId
 * @desc Get all user stories for a specific project
 * @access Private (requires authentication)
 */
router.get("/:projectId", authenticateUser, getUserStoriesByProjectId);

module.exports = router;
