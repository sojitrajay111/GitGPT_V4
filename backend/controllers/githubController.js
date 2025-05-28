// controllers/githubController.js
const GitHubData = require("../models/GitHubData");
const User = require("../models/User");

// Authenticate and store GitHub data
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
        "User-Agent": "Your-App-Name",
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

// Get GitHub authentication status and data in one call
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

// Disconnect GitHub (logout from GitHub)
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

// Legacy functions for backward compatibility (if needed)
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

module.exports = {
  authenticateGitHub,
  getGitHubStatus, // New unified function
  disconnectGitHub, // New logout function
  getGitHubData, // Keep for backward compatibility
  checkGitHubAuthStatus, // Keep for backward compatibility
};
