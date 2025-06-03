const GitHubData = require("../models/GithubData"); // Adjust path as necessary
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Adjust path as necessary
const Project = require("../models/Project"); // Adjust path as necessary
const UserStory = require("../models/UserStory");
const mongoose = require("mongoose");

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

module.exports = {
  getDeveloperProjects,
  getCollaboratorPermissions,
  getDeveloperUserStories,
};
