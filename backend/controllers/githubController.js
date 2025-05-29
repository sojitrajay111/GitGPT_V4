// controllers/githubController.js
const GitHubData = require("../models/GithubData"); // Ensure this path is correct
const User = require("../models/User"); // Required for updating user auth status
const Project = require("../models/Project"); // Required for collaborator logic
const ProjectCollaborator = require("../models/ProjectCollaborator");

// Authenticate and store GitHub data (existing function)
const authenticateGitHub = async (req, res) => {
  try {
    const { githubUsername, githubEmail, githubToken } = req.body;
    const userId = req.user.id; // Assuming you have middleware that sets req.user

    // Validate required fields
    if (!githubUsername || !githubEmail || !githubToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub username, email, and token are required",
      });
    }

    // Verify GitHub token and get user data
    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${githubToken}`,
        "User-Agent": "Your-App-Name", // GitHub requires a User-Agent header
      },
    });

    if (!githubResponse.ok) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub token or unable to authenticate with GitHub",
      });
    }

    const githubUserData = await githubResponse.json();

    // Check if GitHub data already exists for this user
    const existingGitHubData = await GitHubData.findOne({ userId });

    let savedGitHubData;

    if (existingGitHubData) {
      // Update existing data
      existingGitHubData.githubUsername = githubUsername;
      existingGitHubData.githubEmail = githubEmail;
      existingGitHubData.githubId = githubUserData.id.toString();
      existingGitHubData.githubPAT = githubToken;
      existingGitHubData.avatarUrl = githubUserData.avatar_url;
      existingGitHubData.authenticatedAt = new Date();

      savedGitHubData = await existingGitHubData.save();
    } else {
      // Create new GitHub data
      savedGitHubData = await GitHubData.create({
        userId,
        githubUsername,
        githubEmail,
        githubId: githubUserData.id.toString(),
        githubPAT: githubToken,
        avatarUrl: githubUserData.avatar_url,
      });
    }

    // Update user's GitHub authentication status
    await User.findByIdAndUpdate(userId, {
      isAuthenticatedToGithub: true,
    });

    res.status(200).json({
      success: true,
      message: "GitHub authentication successful",
      data: {
        githubUsername: savedGitHubData.githubUsername,
        githubEmail: savedGitHubData.githubEmail,
        avatarUrl: savedGitHubData.avatarUrl,
        githubId: savedGitHubData.githubId,
        authenticatedAt: savedGitHubData.authenticatedAt,
        createdAt: savedGitHubData.createdAt,
      },
    });
  } catch (error) {
    console.error("GitHub authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during GitHub authentication",
    });
  }
};

// Get GitHub authentication status and data in one call (existing function)
const getGitHubStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // First check user's authentication status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If not authenticated to GitHub, return false status
    if (!user.isAuthenticatedToGithub) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        data: null,
      });
    }

    // If authenticated, fetch GitHub data
    const githubData = await GitHubData.findOne({ userId }).select(
      "-githubPAT"
    );

    if (!githubData) {
      // If user is marked as authenticated but no GitHub data exists, reset status
      await User.findByIdAndUpdate(userId, {
        isAuthenticatedToGithub: false,
      });

      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticated: true,
      data: githubData,
    });
  } catch (error) {
    console.error("Get GitHub status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching GitHub status",
    });
  }
};

// Disconnect GitHub (logout from GitHub) (existing function)
const disconnectGitHub = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove GitHub data
    await GitHubData.findOneAndDelete({ userId });

    // Update user's GitHub authentication status
    await User.findByIdAndUpdate(userId, {
      isAuthenticatedToGithub: false,
    });

    res.status(200).json({
      success: true,
      message: "GitHub account disconnected successfully",
    });
  } catch (error) {
    console.error("Disconnect GitHub error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while disconnecting GitHub",
    });
  }
};

// Legacy functions for backward compatibility (if needed) (existing functions)
const getGitHubData = async (req, res) => {
  try {
    const userId = req.user.id;

    const githubData = await GitHubData.findOne({ userId }).select(
      "-githubPAT"
    );

    if (!githubData) {
      return res.status(404).json({
        success: false,
        message: "GitHub data not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: githubData,
    });
  } catch (error) {
    console.error("Get GitHub data error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching GitHub data",
    });
  }
};

const checkGitHubAuthStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticatedToGithub: user.isAuthenticatedToGithub,
    });
  } catch (error) {
    console.error("Check GitHub auth status error:", error);
    res.status(500).json({
      success: false,
      message:
        "Internal server error while checking GitHub authentication status",
    });
  }
};

/**
 * @desc Get a list of private GitHub repositories for the authenticated user.
 * This function fetches the user's PAT from the database and uses it to call the GitHub API.
 * This keeps the PAT secure on the backend.
 * @route GET /api/github/repos
 * @access Private (requires user authentication middleware)
 */
const getUserGithubRepos = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from auth middleware

    const githubData = await GitHubData.findOne({ userId });

    // If no GitHub data or PAT is missing, indicate that GitHub is not authenticated
    if (!githubData || !githubData.githubPAT) {
      return res.status(200).json({
        // Return 200 with status false for frontend handling
        success: true,
        message:
          "GitHub authentication data not found for this user, or PAT is missing.",
        isAuthenticatedToGithub: false,
        repos: [], // Return empty array of repos
      });
    }

    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername;

    // Fetch user's repositories from GitHub API
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?type=owner`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername, // GitHub requires a User-Agent header
        },
      }
    );

    if (!reposResponse.ok) {
      // If token is invalid or expired (e.g., 401 Unauthorized), update user's auth status
      if (reposResponse.status === 401) {
        await User.findByIdAndUpdate(userId, {
          isAuthenticatedToGithub: false,
        });
      }
      const errorData = await reposResponse.json();
      console.error("GitHub API error fetching repos:", errorData);
      return res.status(reposResponse.status).json({
        success: false,
        message: `Failed to fetch GitHub repositories: ${
          errorData.message || "Unknown error"
        }`,
        isAuthenticatedToGithub: false, // Indicate authentication issue
      });
    }

    const repos = await reposResponse.json();

    // Filter for private repositories and map to relevant data for the frontend
    const privateRepos = repos
      .filter((repo) => repo.private)
      .map((repo) => ({
        name: repo.name,
        html_url: repo.html_url,
        full_name: repo.full_name,
      }));

    res.status(200).json({
      success: true,
      isAuthenticatedToGithub: true,
      repos: privateRepos,
    });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching GitHub repositories",
    });
  }
};

/**
 * @desc Search for GitHub users by username.
 * @route GET /api/github/search/users?q=
 * @access Private
 */
const searchGithubUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });
    }

    const githubResponse = await fetch(
      `https://api.github.com/search/users?q=${q}`,
      {
        headers: {
          "User-Agent": "Your-App-Name",
        },
      }
    );

    if (!githubResponse.ok) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to search GitHub users." });
    }

    const data = await githubResponse.json();
    res.status(200).json({ success: true, users: data.items });
  } catch (error) {
    console.error("Error searching GitHub users:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Add or update a collaborator for a project and GitHub repository.
 * @route POST /api/github/collaborators
 * @access Private
 */
const addCollaborator = async (req, res) => {
  const { projectId, githubUsername, permissions } = req.body;
  const userId = req.user.id; // Get userId from authentication middleware

  try {
    // 1. Validate project existence and user authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    // Ensure the requesting user is the owner of the project
    if (project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // 2. Fetch GitHub PAT for the project owner
    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found for the project owner.",
      });
    }

    // 3. Search for the collaborator's GitHub profile to get their ID and avatar URL
    const searchUserResponse = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        headers: {
          Authorization: `token ${githubData.githubPAT}`,
          "User-Agent": githubData.githubUsername,
        },
      }
    );

    if (!searchUserResponse.ok) {
      const errorData = await searchUserResponse.json();
      return res.status(searchUserResponse.status).json({
        success: false,
        message: `Failed to find GitHub user '${githubUsername}': ${
          errorData.message || "User not found"
        }`,
      });
    }
    const collaboratorGitHubInfo = await searchUserResponse.json();
    const collaboratorGithubId = collaboratorGitHubInfo.id.toString();
    const collaboratorAvatarUrl = collaboratorGitHubInfo.avatar_url;

    // 4. Add collaborator to the GitHub repository (if not already added)
    const repoFullName = new URL(project.githubRepoLink).pathname.substring(1);

    const addCollaboratorResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators/${githubUsername}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${githubData.githubPAT}`,
          "User-Agent": "Your-App-Name",
          "Content-Type": "application/json",
        },
      }
    );

    if (!addCollaboratorResponse.ok) {
      const errorData = await addCollaboratorResponse.json();
      console.error("GitHub API error adding collaborator:", errorData);
      // Handle the case where collaborator is already part of the organization
      if (
        addCollaboratorResponse.status === 422 &&
        errorData.message.includes("is already a collaborator")
      ) {
        // Proceed to update database if already a collaborator on GitHub
        console.log(
          `User ${githubUsername} is already a collaborator on GitHub. Proceeding to update database.`
        );
      } else {
        return res.status(addCollaboratorResponse.status).json({
          success: false,
          message: `Failed to add collaborator to GitHub repository: ${errorData.message}`,
        });
      }
    }

    // 5. Save or update collaborator details in ProjectCollaborator in MongoDB
    const newCollaboratorData = {
      username: githubUsername,
      githubId: collaboratorGithubId,
      avatarUrl: collaboratorAvatarUrl,
      // Status is set to 'pending' as a GitHub invitation is sent.
      // This status should be updated to 'accepted' via a GitHub webhook
      // when the collaborator accepts the invitation.
      status: "pending",
      permissions: permissions || [],
    };

    let projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    if (projectCollaboratorDoc) {
      const existingCollaboratorIndex =
        projectCollaboratorDoc.collaborators.findIndex(
          (collab) => collab.githubId === collaboratorGithubId
        );

      if (existingCollaboratorIndex > -1) {
        // Collaborator exists, update their details
        projectCollaboratorDoc.collaborators[existingCollaboratorIndex] = {
          ...projectCollaboratorDoc.collaborators[existingCollaboratorIndex], // Keep existing data
          ...newCollaboratorData, // Overlay new data
        };
      } else {
        // Collaborator doesn't exist, add them to the array
        projectCollaboratorDoc.collaborators.push(newCollaboratorData);
      }
      await projectCollaboratorDoc.save();
    } else {
      // No document for this project, create a new one
      await ProjectCollaborator.create({
        created_user_id: userId,
        project_id: projectId,
        collaborators: [newCollaboratorData],
      });
    }

    res.status(200).json({
      success: true,
      message: "Collaborator added/updated successfully.",
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Get all collaborators for a project.
 * @route GET /api/projects/:projectId/collaborators
 * @access Private
 */
const getCollaboratorsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const collaboratorsDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    if (!collaboratorsDoc) {
      return res.status(200).json({ success: true, collaborators: [] });
    }

    res
      .status(200)
      .json({ success: true, collaborators: collaboratorsDoc.collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching collaborators.",
    });
  }
};

/**
 * @desc Delete a collaborator from a project and GitHub repository.
 * @route DELETE /api/github/collaborators/:projectId/:githubUsername
 * @access Private
 */
const deleteCollaborator = async (req, res) => {
  const { projectId, githubUsername } = req.params;
  const userId = req.user.id; // Get userId from authentication middleware

  try {
    // 1. Validate project existence and user authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    // Ensure the requesting user is the owner of the project
    if (project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // 2. Fetch GitHub PAT for the project owner
    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found for the project owner.",
      });
    }

    const repoFullName = new URL(project.githubRepoLink).pathname.substring(1);

    // 3. Remove collaborator from GitHub repository
    const removeCollaboratorResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators/${githubUsername}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${githubData.githubPAT}`,
          "User-Agent": "Your-App-Name",
        },
      }
    );

    if (!removeCollaboratorResponse.ok) {
      const errorData = await removeCollaboratorResponse.json();
      console.error("GitHub API error removing collaborator:", errorData);
      // If the collaborator is not found on GitHub (e.g., already removed),
      // we can still proceed to remove them from our database.
      if (removeCollaboratorResponse.status !== 404) {
        return res.status(removeCollaboratorResponse.status).json({
          success: false,
          message: `Failed to remove collaborator from GitHub: ${errorData.message}`,
        });
      }
      console.log(
        `Collaborator ${githubUsername} not found on GitHub, proceeding with DB removal.`
      );
    }

    // 4. Remove collaborator from ProjectCollaborator in MongoDB
    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    if (projectCollaboratorDoc) {
      projectCollaboratorDoc.collaborators =
        projectCollaboratorDoc.collaborators.filter(
          (collab) => collab.username !== githubUsername
        );
      await projectCollaboratorDoc.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Collaborator removed successfully." });
  } catch (error) {
    console.error("Error deleting collaborator:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Update a collaborator's permissions for a project.
 * @route PUT /api/github/collaborators/:projectId/:githubUsername/permissions
 * @access Private
 */
const updateCollaboratorPermissions = async (req, res) => {
  const { projectId, githubUsername } = req.params;
  const { permissions } = req.body;
  const userId = req.user.id; // Get userId from authentication middleware

  try {
    // 1. Validate project existence and user authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    // Ensure the requesting user is the owner of the project
    if (project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ success: false, message: "Permissions must be an array." });
    }

    // 2. Find and update collaborator's permissions in MongoDB
    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    if (!projectCollaboratorDoc) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Project collaborator data not found.",
        });
    }

    const collaboratorIndex = projectCollaboratorDoc.collaborators.findIndex(
      (collab) => collab.username === githubUsername
    );

    if (collaboratorIndex === -1) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Collaborator not found for this project.",
        });
    }

    projectCollaboratorDoc.collaborators[collaboratorIndex].permissions =
      permissions;
    await projectCollaboratorDoc.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Collaborator permissions updated successfully.",
      });
  } catch (error) {
    console.error("Error updating collaborator permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  authenticateGitHub,
  getGitHubStatus,
  disconnectGitHub,
  getGitHubData,
  checkGitHubAuthStatus,
  getUserGithubRepos,
  searchGithubUsers,
  addCollaborator,
  getCollaboratorsByProjectId,
  deleteCollaborator, // Export the new function
  updateCollaboratorPermissions, // Export the new function
};
