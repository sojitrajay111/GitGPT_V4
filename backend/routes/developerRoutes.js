const express = require("express");
const {
  getDeveloperProjects,
  getCollaboratorPermissions,
  getDeveloperUserStories,
  getManagersGeminiConfig,
} = require("../controllers/developerController"); // Adjust path as necessary

const router = express.Router();

/**
 * @route GET /api/developer/projects/:userId
 * @desc Get all projects a specific developer is collaborating on
 * @access Private (You would typically add authentication middleware here, e.g., router.get('/:userId', protect, getDeveloperProjects);)
 */
router.get("/projects/:userId", getDeveloperProjects);
router.get(
  "/projects/:projectId/collaborators/:githubId/permissions",
  getCollaboratorPermissions
);
router.get("/userstories/:githubId", getDeveloperUserStories);
router.get("/manager-config/:developerId", getManagersGeminiConfig);

module.exports = router;
