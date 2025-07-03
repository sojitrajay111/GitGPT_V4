// controllers/githubController.js
const GitHubData = require("../models/GithubData"); // Ensure this path is correct
const User = require("../models/User"); // Required for updating user auth status
const Project = require("../models/Project"); // Required for collaborator logic
const ProjectCollaborator = require("../models/ProjectCollaborator");
const crypto = require("crypto");
// Dynamic imports for Octokit as it might be an ES Module
let Octokit;

// Function to dynamically import modules
async function loadESModules() {
  if (!Octokit) {
    ({ Octokit } = await import("@octokit/rest"));
  }
}

// Helper function to get authenticated user's GitHub PAT and username
const getGitHubAuthDetails = async (userId) => {
  const githubData = await GitHubData.findOne({ userId });
  if (!githubData || !githubData.githubPAT) {
    // Throw an error object that can be caught and used for consistent response
    const error = new Error("GitHub PAT not found for the user.");
    error.status = 400; // Bad Request, as the user needs to be authenticated with GitHub
    throw error;
  }
  return {
    pat: githubData.githubPAT,
    username: githubData.githubUsername,
    githubId: githubData.githubId,
  };
};

// NEW HELPER: Get PAT and repo details for a developer if they are a legitimate collaborator
const getCollaboratorPatAndRepoDetails = async (
  developerUserId,
  owner,
  repo
) => {
  // 1. Get developer's GitHub ID
  const developerGithubData = await GitHubData.findOne({
    userId: developerUserId,
  });
  if (!developerGithubData) {
    throw Object.assign(new Error("Developer's GitHub data not found."), {
      status: 404,
    });
  }
  const developerGithubId = developerGithubData.githubId;

  // 2. Find the project linked to this repo
  // Construct the regex to match both with and without .git
  const githubRepoLinkRegex = new RegExp(
    `^https?://github.com/${owner}/${repo}(.git)?/?$`,
    "i"
  );
  const project = await Project.findOne({
    githubRepoLink: githubRepoLinkRegex,
  });
  if (!project) {
    throw Object.assign(
      new Error("Project not found for the given repository."),
      { status: 404 }
    );
  }

  // 3. Check if the developer is a collaborator on this project
  const projectCollaboratorDoc = await ProjectCollaborator.findOne({
    project_id: project._id,
    "collaborators.githubId": developerGithubId,
  });

  if (!projectCollaboratorDoc) {
    throw Object.assign(
      new Error("Developer is not an accepted collaborator for this project."),
      { status: 403 }
    );
  }

  // 4. Get the manager's (project owner's) GitHub PAT
  const managerUserId = project.userId; // Assuming project.userId is the manager's ID
  const managerGithubData = await GitHubData.findOne({ userId: managerUserId });
  if (!managerGithubData || !managerGithubData.githubPAT) {
    throw Object.assign(
      new Error("Manager's GitHub PAT not found. Cannot grant access."),
      { status: 500 }
    );
  }

  return {
    pat: managerGithubData.githubPAT,
    username: managerGithubData.githubUsername,
    repoFullName: `${owner}/${repo}`,
  };
};

// Authenticate and store GitHub data (existing function - slightly enhanced error handling)
const authenticateGitHub = async (req, res) => {
  try {
    const { githubUsername, githubEmail, githubToken } = req.body;
    const userId = req.user.id;

    if (!githubUsername || !githubEmail || !githubToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub username, email, and token are required",
      });
    }

    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${githubToken}`,
        "User-Agent": "GitGPT-App", // Consistent User-Agent
      },
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse
        .json()
        .catch(() => ({ message: "Unable to parse GitHub error response" }));
      return res.status(githubResponse.status).json({
        // Use GitHub's status
        success: false,
        message: `Invalid GitHub token or unable to authenticate with GitHub: ${errorData.message}`,
      });
    }

    const githubUserData = await githubResponse.json();
    const existingGitHubData = await GitHubData.findOne({ userId });
    let savedGitHubData;

    if (existingGitHubData) {
      existingGitHubData.githubUsername = githubUsername;
      existingGitHubData.githubEmail = githubEmail;
      existingGitHubData.githubId = githubUserData.id.toString();
      existingGitHubData.githubPAT = githubToken; // Ensure PAT is updated
      existingGitHubData.avatarUrl = githubUserData.avatar_url;
      existingGitHubData.authenticatedAt = new Date();
      savedGitHubData = await existingGitHubData.save();
    } else {
      savedGitHubData = await GitHubData.create({
        userId,
        githubUsername,
        githubEmail,
        githubId: githubUserData.id.toString(),
        githubPAT: githubToken,
        avatarUrl: githubUserData.avatar_url,
      });
    }

    await User.findByIdAndUpdate(userId, { isAuthenticatedToGithub: true });

    res.status(200).json({
      success: true,
      message: "GitHub authentication successful",
      data: {
        // Return consistent data structure
        githubUsername: savedGitHubData.githubUsername,
        githubEmail: savedGitHubData.githubEmail,
        avatarUrl: savedGitHubData.avatarUrl,
        githubId: savedGitHubData.githubId,
        authenticatedAt: savedGitHubData.authenticatedAt,
      },
    });
  } catch (error) {
    console.error("GitHub authentication error:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error during GitHub authentication",
    });
  }
};

// Get GitHub authentication status and data (existing function - minor refinement)
const getGitHubStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isAuthenticatedToGithub) {
      return res
        .status(200)
        .json({ success: true, isAuthenticated: false, data: null });
    }

    const githubData = await GitHubData.findOne({ userId }).select(
      "-githubPAT"
    ); // Exclude PAT

    if (!githubData) {
      // Data inconsistency: User marked as auth'd but no GitHubData record. Reset.
      await User.findByIdAndUpdate(userId, { isAuthenticatedToGithub: false });
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        data: null,
        message:
          "GitHub data inconsistency found and corrected. Please re-authenticate GitHub.",
      });
    }

    res
      .status(200)
      .json({ success: true, isAuthenticated: true, data: githubData });
  } catch (error) {
    console.error("Get GitHub status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching GitHub status",
    });
  }
};

// Disconnect GitHub (existing function)
const disconnectGitHub = async (req, res) => {
  try {
    const userId = req.user.id;
    await GitHubData.findOneAndDelete({ userId });
    await User.findByIdAndUpdate(userId, { isAuthenticatedToGithub: false });
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

// Get GitHub data (legacy, if still needed)
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
    res.status(200).json({ success: true, data: githubData });
  } catch (error) {
    console.error("Get GitHub data error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Check GitHub auth status (legacy, if still needed)
const checkGitHubAuthStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      isAuthenticatedToGithub: user.isAuthenticatedToGithub,
    });
  } catch (error) {
    console.error("Check GitHub auth status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get user's private GitHub repositories (existing function - refined)
const getUserGithubRepos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pat, username } = await getGitHubAuthDetails(userId); // Use helper

    const reposResponse = await fetch(
      `https://api.github.com/user/repos?type=owner&per_page=100`, // Get more repos
      {
        headers: {
          Authorization: `token ${pat}`,
          "User-Agent": username || "GitGPT-App",
        },
      }
    );

    if (!reposResponse.ok) {
      if (reposResponse.status === 401) {
        // Token might be invalid
        await User.findByIdAndUpdate(userId, {
          isAuthenticatedToGithub: false,
        });
      }
      const errorData = await reposResponse.json().catch(() => ({}));
      return res.status(reposResponse.status).json({
        success: false,
        message: `Failed to fetch GitHub repositories: ${
          errorData.message || reposResponse.statusText
        }`,
        isAuthenticatedToGithub:
          reposResponse.status === 401 ? false : undefined,
      });
    }

    const repos = await reposResponse.json();
    const privateRepos = repos
      .filter((repo) => repo.private) // Assuming you only want private ones for project creation
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
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Internal server error while fetching GitHub repositories",
      isAuthenticatedToGithub: error.status === 401 ? false : undefined,
    });
  }
};

// Search GitHub users (existing function)
const searchGithubUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });
    }
    const githubResponse = await fetch(
      `https://api.github.com/search/users?q=${q}&per_page=20`,
      {
        headers: { "User-Agent": "GitGPT-App" }, // Use consistent agent
      }
    );
    if (!githubResponse.ok) {
      const errorData = await githubResponse.json().catch(() => ({}));
      return res.status(githubResponse.status).json({
        success: false,
        message: `Failed to search GitHub users: ${
          errorData.message || githubResponse.statusText
        }`,
      });
    }
    const data = await githubResponse.json();
    res.status(200).json({ success: true, users: data.items });
  } catch (error) {
    console.error("Error searching GitHub users:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Add collaborator (existing function - minor refinements)
const addCollaborator = async (req, res) => {
  const { projectId, githubUsername, permissions } = req.body;
  const userId = req.user.id;

  try {
    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    if (project.userId.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });

    const { pat: ownerPat, username: ownerUsername } =
      await getGitHubAuthDetails(userId);

    const searchUserResponse = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        headers: {
          Authorization: `token ${ownerPat}`,
          "User-Agent": ownerUsername || "GitGPT-App",
        },
      }
    );
    if (!searchUserResponse.ok) {
      const errorData = await searchUserResponse.json().catch(() => ({}));
      return res.status(searchUserResponse.status).json({
        success: false,
        message: `Failed to find GitHub user '${githubUsername}': ${
          errorData.message || "User not found"
        }`,
      });
    }
    const collaboratorGitHubInfo = await searchUserResponse.json();

    const repoFullName = new URL(project.githubRepoLink).pathname
      .substring(1)
      .replace(/\.git$/, "");
    const addCollaboratorResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators/${githubUsername}`,
      {
        method: "PUT", // Adds or invites user
        headers: {
          Authorization: `token ${ownerPat}`,
          "User-Agent": ownerUsername || "GitGPT-App",
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ permission: "push" }), // Example: give push access. Default is read.
      }
    );

    // GitHub returns 201 if invitation created, 204 if already a collaborator and permissions updated (or no change)
    if (![201, 204].includes(addCollaboratorResponse.status)) {
      const errorData = await addCollaboratorResponse.json().catch(() => ({}));
      // 422 if user cannot be added (e.g. org restrictions)
      if (
        addCollaboratorResponse.status === 422 &&
        errorData.message?.includes("is already a collaborator")
      ) {
        console.log(
          `User ${githubUsername} is already a collaborator on GitHub. Proceeding to update database.`
        );
      } else {
        return res.status(addCollaboratorResponse.status).json({
          success: false,
          message: `Failed to add collaborator to GitHub repository: ${
            errorData.message || addCollaboratorResponse.statusText
          }`,
        });
      }
    }
    const invitationData =
      addCollaboratorResponse.status === 201
        ? await addCollaboratorResponse.json()
        : null;

    const newCollaboratorData = {
      username: githubUsername,
      githubId: collaboratorGitHubInfo.id.toString(),
      avatarUrl: collaboratorGitHubInfo.avatar_url,
      status: invitationData ? "pending" : "accepted", // If 204, they are already accepted. If 201, invitation is pending.
      permissions: permissions || [],
    };

    let projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    if (projectCollaboratorDoc) {
      const existingIdx = projectCollaboratorDoc.collaborators.findIndex(
        (c) => c.githubId === newCollaboratorData.githubId
      );
      if (existingIdx > -1)
        projectCollaboratorDoc.collaborators[existingIdx] = {
          ...projectCollaboratorDoc.collaborators[existingIdx],
          ...newCollaboratorData,
        };
      else projectCollaboratorDoc.collaborators.push(newCollaboratorData);
      await projectCollaboratorDoc.save();
    } else {
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
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

// Get collaborators by project ID (existing function)
const getCollaboratorsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const collaboratorsDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    if (!collaboratorsDoc)
      return res.status(200).json({ success: true, collaborators: [] });
    res
      .status(200)
      .json({ success: true, collaborators: collaboratorsDoc.collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Delete collaborator (existing function - refined)
const deleteCollaborator = async (req, res) => {
  const { projectId, githubUsername } = req.params;
  const userId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    if (project.userId.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });

    const { pat: ownerPat, username: ownerUsername } =
      await getGitHubAuthDetails(userId);
    const repoFullName = new URL(project.githubRepoLink).pathname
      .substring(1)
      .replace(/\.git$/, "");

    const removeCollaboratorResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators/${githubUsername}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${ownerPat}`,
          "User-Agent": ownerUsername || "GitGPT-App",
        },
      }
    );

    if (
      !removeCollaboratorResponse.ok &&
      removeCollaboratorResponse.status !== 404
    ) {
      // 404 means not a collaborator, which is fine for deletion
      const errorData = await removeCollaboratorResponse
        .json()
        .catch(() => ({}));
      return res.status(removeCollaboratorResponse.status).json({
        success: false,
        message: `Failed to remove collaborator from GitHub: ${
          errorData.message || removeCollaboratorResponse.statusText
        }`,
      });
    }

    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    if (projectCollaboratorDoc) {
      projectCollaboratorDoc.collaborators =
        projectCollaboratorDoc.collaborators.filter(
          (c) => c.username !== githubUsername
        );
      await projectCollaboratorDoc.save();
    }
    res
      .status(200)
      .json({ success: true, message: "Collaborator removed successfully." });
  } catch (error) {
    console.error("Error deleting collaborator:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

/**
 * @desc Delete a GitHub repository.
 * @route DELETE /api/github/repos/:owner/:repo
 * @access Private (requires user authentication)
 */
const deleteGithubRepo = async (req, res) => {
  const { owner, repo } = req.params;
  const userId = req.user.id;

  try {
    const { pat: githubPAT, username: githubUsername } =
      await getGitHubAuthDetails(userId);

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error(
        `GitHub API error deleting repository ${owner}/${repo}:`,
        errorData
      );
      return res.status(response.status).json({
        success: false,
        message: `Failed to delete GitHub repository: ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    // GitHub returns 204 No Content for successful deletion
    res.status(204).json({
      success: true,
      message: "GitHub repository deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting GitHub repository:", error);
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Internal server error while deleting GitHub repository.",
    });
  }
};

// Update collaborator permissions (existing function)
const updateCollaboratorPermissions = async (req, res) => {
  const { projectId, githubUsername } = req.params;
  const { permissions } = req.body;
  const userId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    if (project.userId.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    if (!Array.isArray(permissions))
      return res
        .status(400)
        .json({ success: false, message: "Permissions must be an array." });

    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    if (!projectCollaboratorDoc)
      return res.status(404).json({
        success: false,
        message: "Project collaborator data not found.",
      });

    const collaboratorIndex = projectCollaboratorDoc.collaborators.findIndex(
      (c) => c.username === githubUsername
    );
    if (collaboratorIndex === -1)
      return res.status(404).json({
        success: false,
        message: "Collaborator not found for this project.",
      });

    projectCollaboratorDoc.collaborators[collaboratorIndex].permissions =
      permissions;
    await projectCollaboratorDoc.save();
    res.status(200).json({
      success: true,
      message: "Collaborator permissions updated successfully.",
    });
  } catch (error) {
    console.error("Error updating collaborator permissions:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Update collaborator status in DB (existing function)
const updateCollaboratorStatusInDb = async (projectId, githubId, newStatus) => {
  try {
    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    if (!projectCollaboratorDoc) {
      console.warn(
        `ProjectCollaborator document not found for project_id: ${projectId}`
      );
      return false;
    }
    const collaboratorIndex = projectCollaboratorDoc.collaborators.findIndex(
      (c) => c.githubId === githubId
    );
    if (collaboratorIndex === -1) {
      console.warn(
        `Collaborator with githubId ${githubId} not found for project ${projectId}`
      );
      return false;
    }
    if (
      projectCollaboratorDoc.collaborators[collaboratorIndex].status !==
      newStatus
    ) {
      projectCollaboratorDoc.collaborators[collaboratorIndex].status =
        newStatus;
      await projectCollaboratorDoc.save();
      console.log(
        `Collaborator ${githubId} status updated to '${newStatus}' for project ${projectId}`
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating collaborator status in DB:", error);
    return false;
  }
};

// Handle GitHub Webhook (existing function - minor refinement)
const handleGitHubWebhook = async (req, res) => {
  const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];
  const deliveryID = req.headers["x-github-delivery"]; // For logging

  // IMPORTANT: Express.json() middleware might parse the body. For signature verification,
  // you need the raw body. Ensure your webhook route is configured to use express.raw({ type: 'application/json' })
  // or a similar mechanism to get the raw buffer.
  // For this example, assuming req.rawBody is available or payload is correctly reconstructed.
  // If using express.json(), this verification will likely fail.
  // A common pattern is to have a separate middleware for raw body parsing just for webhook routes.

  // Let's assume req.rawBody is populated by a middleware like:
  // app.use('/api/github/webhook', express.raw({ type: 'application/json' }), githubRoutes);
  const payload = req.body; // If using express.json(), this is already parsed.
  // For verification, you'd need the raw stringified payload.
  // This is a common pitfall.

  // For now, this verification might not work correctly if express.json() has already parsed req.body.
  // We'll proceed with logic, but highlight this as a critical point for webhook security.
  if (GITHUB_WEBHOOK_SECRET && signature) {
    // This needs the raw request body as a buffer or string.
    // const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
    // const digest = "sha256=" + hmac.update(JSON.stringify(payload) /* or rawBody */).digest("hex");
    // if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    //   console.warn(`Webhook signature mismatch for delivery ${deliveryID}!`);
    //   return res.status(401).send("Webhook signature mismatch.");
    // }
    console.log(
      `Webhook signature verification would be performed here for delivery ${deliveryID}. (Skipped for now due to raw body complexities)`
    );
  } else {
    console.warn(
      `Webhook secret not configured or signature missing for delivery ${deliveryID}. Processing insecurely.`
    );
  }

  try {
    console.log(
      `Received GitHub webhook event: ${event}, Delivery ID: ${deliveryID}`
    );
    if (event === "member" || event === "membership") {
      // `membership` for org member changes
      const { action, member, repository, organization, scope } = req.body;
      const relevantMember =
        member || (scope === "user" ? req.body.user : null); // `membership` event has `user`

      if (action === "added" && relevantMember && repository) {
        const githubUsername = relevantMember.login;
        const githubId = relevantMember.id.toString();
        const repoFullName = repository.full_name;
        console.log(
          `Member '${githubUsername}' (ID: ${githubId}) was added to repository '${repoFullName}'`
        );
        const project = await Project.findOne({
          githubRepoLink: { $regex: new RegExp(repoFullName, "i") },
        });
        if (project) {
          await updateCollaboratorStatusInDb(project._id, githubId, "accepted");
        } else
          console.warn(
            `No project found matching GitHub repository: ${repoFullName}`
          );
      } else if (action === "removed" && relevantMember && repository) {
        const githubUsername = relevantMember.login;
        const githubId = relevantMember.id.toString();
        const repoFullName = repository.full_name;
        console.log(
          `Member '${githubUsername}' (ID: ${githubId}) was removed from repository '${repoFullName}'`
        );
        const project = await Project.findOne({
          githubRepoLink: { $regex: new RegExp(repoFullName, "i") },
        });
        if (project) {
          await updateCollaboratorStatusInDb(project._id, githubId, "rejected"); // Or 'removed'
        }
      }
    }
    res.status(200).send("Webhook received.");
  } catch (error) {
    console.error(
      `Error processing GitHub webhook (Delivery ID: ${deliveryID}):`,
      error
    );
    res.status(500).send("Error processing webhook.");
  }
};

// Get user and GitHub data (existing function)
const getUserAndGithubData = async (req, res) => {
  try {
    const { userId: requestedUserId } = req.params;
    const authenticatedUserId = req.user.id;
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only access your own data.",
      });
    }
    const user = await User.findById(requestedUserId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    const githubData = await GitHubData.findOne({
      userId: requestedUserId,
    }).select("-githubPAT");
    res.status(200).json({
      success: true,
      user,
      githubData,
      message: "User and GitHub data fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching user and GitHub data:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// --- START: New/Updated functions for Branch and PR Management ---

/**
 * @desc Get all branches for a given GitHub repository.
 * (Your existing getRepoBranches returned only names, this returns full branch objects)
 * @route GET /api/github/repos/:owner/:repo/branches
 * @access Private
 */
const listRepoBranches = async (req, res) => {
  const { owner, repo } = req.params;
  const userId = req.user.id; // User making the request

  console.log(
    `[listRepoBranches] Request to list branches for ${owner}/${repo} by userId: ${userId}`
  );

  let githubPAT;
  let githubUsername;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      // If the user is a manager, use their own PAT
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
      console.log(`[listRepoBranches] User is a manager. Using manager's PAT.`);
    } else if (user.role === "developer") {
      // If the user is a developer, check if they are an accepted collaborator
      console.log(
        `[listRepoBranches] User is a developer. Checking collaboration status.`
      );
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat; // This is the manager's PAT
      githubUsername = collaboratorDetails.username; // This is the manager's username
      console.log(
        `[listRepoBranches] Developer is an accepted collaborator. Using manager's PAT.`
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to access this resource.",
      });
    }

    // Mask PAT for logging, never log full PAT
    const maskedPAT = githubPAT.substring(0, 5) + "...";
    console.log(
      `[listRepoBranches] Using PAT: ${maskedPAT} for username: ${githubUsername}`
    );

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      let errorData = { message: response.statusText };
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      console.error(
        `[listRepoBranches] GitHub API error listing branches for ${owner}/${repo}:`,
        errorData
      );
      return res.status(response.status).json({
        success: false,
        message: `Failed to list branches for ${owner}/${repo}: ${
          errorData.message || "Unknown GitHub API error."
        }`,
        errorDetails: errorData, // Include error details for better debugging
      });
    }

    const branches = await response.json();
    console.log(
      `[listRepoBranches] Successfully fetched ${branches.length} branches for ${owner}/${repo}.`
    );
    res.status(200).json({ success: true, branches });
  } catch (error) {
    console.error("[listRepoBranches] Error in listRepoBranches:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error while listing branches.",
    });
  }
};

// Create a new branch
const createNewBranch = async (req, res) => {
  const { owner, repo, newBranchName, baseBranch } = req.body;
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to create branches.",
      });
    }

    // 1. Get the SHA of the base branch
    const getRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getRefResponse.ok) {
      const errorData = await getRefResponse
        .json()
        .catch(() => ({ message: getRefResponse.statusText }));
      console.error("GitHub API error getting base branch ref:", errorData);
      return res.status(getRefResponse.status).json({
        success: false,
        message: `Failed to get base branch ref ('${baseBranch}'): ${
          errorData.message || "Unknown error."
        }`,
      });
    }
    const refData = await getRefResponse.json();
    const baseBranchSha = refData.object.sha;

    // 2. Create the new branch
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranchName}`,
          sha: baseBranchSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const errorData = await createBranchResponse
        .json()
        .catch(() => ({ message: createBranchResponse.statusText }));
      console.error("GitHub API error creating new branch:", errorData);
      return res.status(createBranchResponse.status).json({
        success: false,
        message: `Failed to create branch '${newBranchName}': ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    const branchData = await createBranchResponse.json();
    res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      branch: branchData,
    });
  } catch (error) {
    console.error("Error in createNewBranch:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error while creating branch.",
    });
  }
};

// Delete an existing branch
const deleteExistingBranch = async (req, res) => {
  const { owner, repo, branchNameEncoded } = req.params;
  const branchName = decodeURIComponent(branchNameEncoded); // Decode the branch name
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to delete branches.",
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error("GitHub API error deleting branch:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Failed to delete branch '${branchName}': ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    res
      .status(204)
      .json({ success: true, message: "Branch deleted successfully." }); // 204 No Content for successful deletion
  } catch (error) {
    console.error("Error in deleteExistingBranch:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error while deleting branch.",
    });
  }
};

// List Pull Requests for a repository
const listPullRequests = async (req, res) => {
  const { owner, repo } = req.params;
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to list pull requests.",
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error("GitHub API error listing pull requests:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Failed to list pull requests for ${owner}/${repo}: ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    const pullRequests = await response.json();
    res.status(200).json({ success: true, pullRequests });
  } catch (error) {
    console.error("Error in listPullRequests:", error);
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Internal server error while listing pull requests.",
    });
  }
};

// Create a new Pull Request
const createNewPullRequest = async (req, res) => {
  const { owner, repo, title, head, base, body } = req.body;
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to create pull requests.",
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({ title, head, base, body }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error("GitHub API error creating pull request:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Failed to create pull request: ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    const prData = await response.json();
    res.status(201).json({
      success: true,
      message: "Pull Request created successfully.",
      pr: prData,
    });
  } catch (error) {
    console.error("Error in createNewPullRequest:", error);
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Internal server error while creating pull request.",
    });
  }
};

// Get a single Pull Request
const getPullRequest = async (req, res) => {
  const { owner, repo, pull_number } = req.params;
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to get pull request.",
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error("GitHub API error getting pull request:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Failed to get pull request #${pull_number}: ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    const prData = await response.json();
    res.status(200).json({ success: true, pr: prData });
  } catch (error) {
    console.error("Error in getPullRequest:", error);
    res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Internal server error while getting pull request.",
    });
  }
};

// Update an existing Pull Request
const updateExistingPullRequest = async (req, res) => {
  const { owner, repo, pull_number } = req.params;
  const { title, body, state } = req.body; // Can update title, body, or state (open/closed)
  const userId = req.user.id;

  try {
    // Determine which PAT to use based on user role and collaboration status
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role to update pull requests.",
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
      {
        method: "PATCH", // PATCH for partial updates
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({ title, body, state }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error("GitHub API error updating pull request:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Failed to update pull request #${pull_number}: ${
          errorData.message || "Unknown error."
        }`,
      });
    }

    const updatedPrData = await response.json();
    res.status(200).json({
      success: true,
      message: "Pull Request updated successfully.",
      pr: updatedPrData,
    });
  } catch (error) {
    console.error("Error updating pull request:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

// --- END: New/Updated functions for Branch and PR Management ---

// New: Get GitHub integration details
const getGitHubDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const githubData = await GitHubData.findOne({ userId }).select(
      "-githubPAT"
    );

    console.log("DEBUG: Fetched GitHub Data:", githubData); // TEMPORARY LOG: Inspect retrieved data

    if (!githubData) {
      return res.status(200).json({
        success: true,
        message: "No GitHub details found for this user.",
        data: null,
      });
    }

    res.status(200).json({ success: true, data: githubData });
  } catch (error) {
    console.error("Error fetching GitHub details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// New: Add or update GitHub integration details
const addOrUpdateGitHubDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from authentication middleware
    const { githubName, githubEmail, githubToken } = req.body;

    if (!githubName || !githubEmail || !githubToken) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    let githubData = await GitHubData.findOne({ userId });

    if (githubData) {
      // Update existing details
      githubData.githubUsername = githubName;
      githubData.githubEmail = githubEmail;
      githubData.githubPAT = githubToken; // Store the actual token
      await githubData.save();
      return res.status(200).json({
        success: true,
        message: "GitHub details updated successfully.",
      });
    } else {
      // Create new details
      githubData = new GitHubData({
        userId,
        githubUsername: githubName,
        githubEmail: githubEmail,
        githubPAT: githubToken,
      });
      await githubData.save();
      return res
        .status(201)
        .json({ success: true, message: "GitHub details added successfully." });
    }
  } catch (error) {
    console.error("Error adding/updating GitHub details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// New: Delete GitHub integration details
const deleteGitHubDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from authentication middleware
    const result = await GitHubData.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No GitHub details found to delete.",
      });
    }

    await User.findByIdAndUpdate(userId, { isAuthenticatedToGithub: false });

    res
      .status(200)
      .json({ success: true, message: "GitHub details deleted successfully." });
  } catch (error) {
    console.error("Error deleting GitHub details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Manual sync endpoint for GitHub contributions
const syncContributions = async (req, res) => {
  try {
    await loadESModules();
    const { projectId } = req.params;
    const { branchName } = req.body; // Accept branch name from frontend
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Try both string and ObjectId for userId
    let githubData = await GitHubData.findOne({
      userId: project.userId.toString(),
    });
    if (!githubData) {
      githubData = await GitHubData.findOne({ userId: project.userId });
    }

    if (!githubData || !githubData.githubPAT) {
      return res.status(401).json({
        message:
          "No GitHub token found for project owner. Authorization denied.",
      });
    }

    // Extract repo info from project.githubRepoLink (assume format: https://github.com/org/repo)
    const repoUrlParts = project.githubRepoLink.split("/");
    const owner = repoUrlParts[repoUrlParts.length - 2];
    const repo = repoUrlParts[repoUrlParts.length - 1];

    const octokit = new Octokit({ auth: githubData.githubPAT });

    // Use branchName if provided, otherwise use default branch
    let branchToSync = branchName;
    if (!branchToSync) {
      // Fetch default branch from repo info
      const { data: repoInfo } = await octokit.repos.get({ owner, repo });
      branchToSync = repoInfo.default_branch;
    }
    console.log("Syncing branch:", branchToSync);

    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branchToSync, // Only fetch commits from the specified branch
      per_page: 20, // Increase if needed
    });
    console.log(
      "Fetched commits:",
      commits.map((c) => ({
        sha: c.sha,
        author: c.author?.login,
        message: c.commit.message,
      }))
    );

    for (const commit of commits) {
      console.log(
        "Processing commit:",
        commit.sha,
        commit.html_url,
        commit.author?.login,
        commit.commit.author.name
      );
      // Fetch commit details to get stats
      let linesAdded = 0;
      try {
        const { data: commitDetails } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });
        if (commitDetails.stats) linesAdded = commitDetails.stats.additions;
      } catch (err) {
        console.error(
          "Failed to fetch commit stats for",
          commit.sha,
          err.message
        );
      }
      const CodeContribution = require("../models/CodeContribution");
      const exists = await CodeContribution.findOne({ prUrl: commit.html_url });
      if (exists) {
        console.log("Skipping existing commit:", commit.sha);
        continue;
      }
      console.log(
        "Creating CodeContribution for commit:",
        commit.sha,
        "Lines added:",
        linesAdded
      );
      await CodeContribution.create({
        projectId: project._id,
        contributorType: "Developer",
        githubUsername: commit.author?.login || commit.commit.author.name,
        linesOfCode: linesAdded,
        prUrl: commit.html_url,
        contributionDate: new Date(commit.commit.author.date),
      });
    }
    res.json({ success: true, message: "Contributions synced!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLastCommitDetails = async (req, res) => {
  try {
    await loadESModules();
    const { projectId } = req.params;
    const { branchName } = req.query; // Pass branchName as a query param

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    let githubData = await GitHubData.findOne({
      userId: project.userId.toString(),
    });
    if (!githubData) {
      githubData = await GitHubData.findOne({ userId: project.userId });
    }
    if (!githubData || !githubData.githubPAT) {
      return res.status(401).json({
        message:
          "No GitHub token found for project owner. Authorization denied.",
      });
    }

    const repoUrlParts = project.githubRepoLink.split("/");
    const owner = repoUrlParts[repoUrlParts.length - 2];
    const repo = repoUrlParts[repoUrlParts.length - 1];

    const octokit = new Octokit({ auth: githubData.githubPAT });

    // Get the latest commit for the branch
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branchName, // If not provided, gets default branch
      per_page: 50,
    });

    if (!commits.length) {
      return res.status(404).json({ message: "No commits found." });
    }

    const commit = commits[0];

    // Get commit details for stats
    let linesAdded = 0;
    let linesDeleted = 0;
    try {
      const { data: commitDetails } = await octokit.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });
      if (commitDetails.stats) {
        linesAdded = commitDetails.stats.additions;
        linesDeleted = commitDetails.stats.deletions;
      }
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch commit stats." });
    }

    // Return commit details
    res.json({
      sha: commit.sha,
      author: commit.author?.login || commit.commit.author.name,
      message: commit.commit.message,
      date: commit.commit.author.date,
      url: commit.html_url,
      linesAdded,
      linesDeleted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch branches from a GitHub repo (supports private repos via server token)
const getRepoBranchesServer = async (req, res) => {
  try {
    await loadESModules();
    const { owner, repo } = req.query;
    if (!owner || !repo) {
      return res
        .status(400)
        .json({ message: "Missing owner or repo parameter." });
    }
    const userId = req.user.id;
    let githubPAT;
    let githubUsername;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role === "manager") {
      const authDetails = await getGitHubAuthDetails(userId);
      githubPAT = authDetails.pat;
      githubUsername = authDetails.username;
    } else if (user.role === "developer") {
      const collaboratorDetails = await getCollaboratorPatAndRepoDetails(
        userId,
        owner,
        repo
      );
      githubPAT = collaboratorDetails.pat;
      githubUsername = collaboratorDetails.username;
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized role to access this resource." });
    }
    const octokit = new Octokit({ auth: githubPAT });
    const { data } = await octokit.repos.listBranches({ owner, repo });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  deleteCollaborator,
  updateCollaboratorPermissions,
  handleGitHubWebhook,
  createBranch: createNewBranch,
  getRepoBranches: listRepoBranches,
  getUserAndGithubData,
  deleteExistingBranch,
  listPullRequests,
  createNewPullRequest,
  updateExistingPullRequest,
  deleteGithubRepo,
  getGitHubDetails,
  addOrUpdateGitHubDetails,
  deleteGitHubDetails,
  getLastCommitDetails,
  getRepoBranchesServer,
};
