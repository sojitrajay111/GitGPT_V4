const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const {
  createUserStory,
  getUserStoriesByProjectId,
  updateUserStory,
  deleteUserStory,
  generateAiStoryContent,
} = require("../controllers/userStoryController");

// Route to create a new user story
router.post("/", authenticateUser, createUserStory);

// Route to get all user stories for a project
router.get("/:projectId", authenticateUser, getUserStoriesByProjectId);

// Route to update a user story
router.put("/:userStoryId", authenticateUser, updateUserStory);

// Route to delete a user story
router.delete("/:userStoryId", authenticateUser, deleteUserStory);

// Route for AI content generation
router.post("/generate-ai-story", authenticateUser, generateAiStoryContent);

module.exports = router;
