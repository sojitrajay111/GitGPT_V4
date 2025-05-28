const Project = require("../models/Project");
const GitHubData = require("../models/GithubData"); // To get PAT for repo creation
const User = require("../models/User"); // To update isAuthenticatedToGithub if PAT becomes invalid

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      githubRepoLink,
      createNewRepo,
      repoName,
    } = req.body;
    const userId = req.user.id; // Assuming userId from authentication middleware

    // Validate required fields for project creation
    if (!projectName || !projectDescription) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required.",
      });
    }

    let finalGithubRepoLink = githubRepoLink; // Initialize with provided link

    // If the user opts to create a new GitHub repository
    if (createNewRepo) {
      if (!repoName) {
        return res.status(400).json({
          success: false,
          message: "New repository name is required when creating a new repo.",
        });
      }

      // Fetch GitHub authentication data for the user
      const githubData = await GitHubData.findOne({ userId });
      if (!githubData || !githubData.githubPAT || !githubData.githubUsername) {
        return res.status(400).json({
          success: false,
          message:
            "GitHub authentication data missing. Cannot create new repository without a valid PAT.",
        });
      }

      const githubPAT = githubData.githubPAT;
      const githubUsername = githubData.githubUsername;

      // Call GitHub API to create a new private repository
      const createRepoResponse = await fetch(
        `https://api.github.com/user/repos`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${githubPAT}`,
            "User-Agent": githubUsername, // GitHub requires a User-Agent header
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: repoName,
            private: true, // As requested, always create private repos
            description: projectDescription, // Use project description for repo description
          }),
        }
      );

      if (!createRepoResponse.ok) {
        // If token is invalid or expired (e.g., 401 Unauthorized), update user's auth status
        if (createRepoResponse.status === 401) {
          await User.findByIdAndUpdate(userId, {
            isAuthenticatedToGithub: false,
          });
        }
        const errorData = await createRepoResponse.json();
        console.error("GitHub repo creation error:", errorData);
        return res.status(createRepoResponse.status).json({
          success: false,
          message: `Failed to create GitHub repository: ${
            errorData.message || "Unknown error"
          }`,
        });
      }

      const newRepoData = await createRepoResponse.json();
      finalGithubRepoLink = newRepoData.html_url; // Set the link to the newly created repo
    } else if (!githubRepoLink) {
      // If not creating a new repo, a GitHub repo link must be provided
      return res.status(400).json({
        success: false,
        message:
          "GitHub repository link is required if not creating a new one.",
      });
    }

    // Create the new project in the database
    const newProject = await Project.create({
      userId,
      projectName,
      projectDescription,
      githubRepoLink: finalGithubRepoLink,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully!",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating project",
    });
  }
};

/**
 * @desc Get all projects for a specific user.
 * @route GET /api/projects/user/:userId
 * @access Private (requires user authentication middleware)
 */
const getProjectsByUserId = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId from authentication middleware

    // Find all projects associated with the userId and sort by creation date
    const projects = await Project.find({ userId }).sort({ createdAt: -1 }); // -1 for descending order

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching projects",
    });
  }
};

module.exports = {
  createProject,
  getProjectsByUserId,
};
