const UserStory = require("../models/UserStory");
const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");

/**
 * @desc Create a new user story for a project.
 * @route POST /api/user-stories
 * @access Private (requires user authentication middleware)
 */
const createUserStory = async (req, res) => {
  const {
    projectId,
    userStoryTitle,
    description,
    acceptanceCriteria,
    testingScenarios,
    collaboratorGithubIds, // Array of githubIds of selected collaborators
  } = req.body;
  const creator_id = req.user.id; // Get creator_id from authentication middleware

  try {
    // 1. Validate project existence
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // 2. Fetch collaborator details from ProjectCollaborator document
    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    if (!projectCollaboratorDoc) {
      return res.status(404).json({
        success: false,
        message: "Collaborator data not found for this project.",
      });
    }

    const selectedCollaborators = [];
    if (collaboratorGithubIds && collaboratorGithubIds.length > 0) {
      collaboratorGithubIds.forEach((githubId) => {
        const foundCollab = projectCollaboratorDoc.collaborators.find(
          (collab) => collab.githubId === githubId
        );
        if (foundCollab) {
          selectedCollaborators.push({
            username: foundCollab.username,
            githubId: foundCollab.githubId,
            avatarUrl: foundCollab.avatarUrl,
          });
        }
      });
    }

    // 3. Create the new user story
    const newUserStory = await UserStory.create({
      creator_id,
      projectId,
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaborators: selectedCollaborators,
    });

    res.status(201).json({
      success: true,
      message: "User story created successfully.",
      userStory: newUserStory,
    });
  } catch (error) {
    console.error("Error creating user story:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Get all user stories for a specific project.
 * @route GET /api/user-stories/:projectId
 * @access Private
 */
const getUserStoriesByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find all user stories associated with the given projectId
    const userStories = await UserStory.find({ projectId }).populate(
      "creator_id",
      "username email"
    ); // Populate creator details if needed

    res.status(200).json({ success: true, userStories });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createUserStory,
  getUserStoriesByProjectId,
};
