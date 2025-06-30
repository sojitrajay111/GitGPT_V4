const GitHubData = require("../models/GithubData"); // Adjust path as necessary
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Adjust path as necessary
const Project = require("../models/Project"); // Adjust path as necessary
const UserStory = require("../models/UserStory");
const mongoose = require("mongoose");
const User = require("../models/User");
const Configuration = require("../models/Configuration");

/**
 * @desc Get all projects a developer is collaborating on
 * @route GET /api/developer/projects/:userId
 * @access Private (assuming authentication middleware is used)
 */
const getDeveloperProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

    // 1. Fetch GitHub data for the given userId
    const githubData = await GitHubData.findOne({ userId });

    if (!githubData) {
      return res
        .status(404)
        .json({ message: "GitHub data not found for this user." });
    }

    const githubUsername = githubData.githubUsername;

    // 2. Find all ProjectCollaborator entries where the user is a collaborator
    // We need to iterate through all ProjectCollaborator documents and check
    // if the githubUsername exists in their 'collaborators' array.
    const projectCollaborations = await ProjectCollaborator.find({
      "collaborators.githubId": githubData.githubId, // Use githubId for more robust matching
      // "collaborators.status": "accepted", // Only fetch accepted collaborations
    });

    if (projectCollaborations.length === 0) {
      return res.status(200).json([]); // Return empty array if no collaborations found
    }

    // Extract unique project_ids from the collaborations
    const projectIds = projectCollaborations.map((pc) => pc.project_id);
    const uniqueProjectIds = [
      ...new Set(projectIds.map((id) => id.toString())),
    ]; // Ensure unique IDs as strings

    // 3. Fetch all project data from the Project model based on the extracted project_ids
    const projects = await Project.find({
      _id: {
        $in: uniqueProjectIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    // Return the array of project information
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching developer projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCollaboratorPermissions = async (req, res) => {
  try {
    const { projectId, githubId } = req.params;

    // Validate if projectId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID format." });
    }

    // 1. Find the ProjectCollaborator entry for the given projectId
    const projectCollaborator = await ProjectCollaborator.findOne({
      project_id: new mongoose.Types.ObjectId(projectId),
      "collaborators.githubId": githubId, // Efficiently find the document that contains the collaborator
    });

    if (!projectCollaborator) {
      return res
        .status(404)
        .json({ message: "Project or collaborator not found." });
    }

    // 2. Find the specific collaborator within the collaborators array
    const collaborator = projectCollaborator.collaborators.find(
      (collab) => collab.githubId === githubId
    );

    if (!collaborator) {
      // This case should ideally not be reached if the findOne query was successful,
      // but it's a good safeguard.
      return res
        .status(404)
        .json({ message: "Collaborator not found in this project." });
    }

    // 3. Return the permissions array for that collaborator
    res.status(200).json(collaborator.permissions);
  } catch (error) {
    console.error("Error fetching collaborator permissions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDeveloperUserStories = async (req, res) => {
  try {
    const { githubId } = req.params;

    // 1. Find all UserStory entries where the given githubId is in the collaborators array
    const userStories = await UserStory.find({
      "collaborators.githubId": githubId,
    });

    if (userStories.length === 0) {
      return res.status(200).json([]); // Return empty array if no user stories found
    }

    // Return the array of user stories
    res.status(200).json(userStories);
  } catch (error) {
    console.error("Error fetching developer user stories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get manager's Gemini configuration for a developer
 * @route GET /api/developer/manager-config/:developerId
 * @access Private
 */
const getManagersGeminiConfig = async (req, res) => {
  try {
    const { developerId } = req.params;
    const developer = await User.findById(developerId);
    if (!developer || developer.role !== "developer" || !developer.managerId) {
      return res.status(404).json({ message: "Developer or manager not found." });
    }
    const geminiConfig = await Configuration.findOne({
      userId: developer.managerId,
      configTitle: { $regex: /^gemini$/i },
      isActive: true,
    });
    if (!geminiConfig) {
      return res.status(404).json({ message: "Manager's Gemini config not found." });
    }

    // Only return safe fields (do NOT include configValue)
    res.status(200).json({
      config: {
        _id: geminiConfig._id,
        userId: geminiConfig.userId,
        configTitle: geminiConfig.configTitle,
        isActive: geminiConfig.isActive,
        createdAt: geminiConfig.createdAt,
        updatedAt: geminiConfig.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error fetching manager's Gemini config:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Utility script to remove all developer configs
// Usage: node backend/controllers/developerController.js --remove-developer-configs
if (require.main === module && process.argv.includes('--remove-developer-configs')) {
  const mongoose = require('mongoose');
  const User = require('../models/User');
  const Configuration = require('../models/Configuration');
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

  (async () => {
    await mongoose.connect(MONGO_URI);
    const developers = await User.find({ role: 'developer' });
    const developerIds = developers.map(u => u._id);
    const result = await Configuration.deleteMany({ userId: { $in: developerIds } });
    console.log(`Deleted ${result.deletedCount} developer configurations.`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

module.exports = {
  getDeveloperProjects,
  getCollaboratorPermissions,
  getDeveloperUserStories,
  getManagersGeminiConfig,
};
