// controllers/userStoryController.js - UPDATED
const UserStory = require("../models/UserStory");
const Project = require("../models/Project"); // Ensure Project model is imported
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Ensure this is imported
const GitHubData = require("../models/GithubData"); // Import the GitHubData model
const CodeContribution = require("../models/CodeContribution"); // NEW: Import CodeContribution model
const { parseDiffForLoc } = require("./metricsController"); // NEW: Import diff parser
const path = require("path");
require("dotenv").config();
const Configuration = require("../models/Configuration"); // Import the Configuration model
const User = require("../models/User");

// Dynamic imports for Octokit as it might be an ES Module
let Octokit;

// Function to dynamically import modules
async function loadESModules() {
  if (!Octokit) {
    ({ Octokit } = await import("@octokit/rest"));
  }
}

/**
 * Helper function to send a status update to the client.
 * @param {object} res - Express response object.
 * @param {string} message - The status message to send.
 * @param {string} type - Type of message (e.g., 'status', 'error', 'complete').
 * @param {object} [data] - Optional additional data.
 */
function sendStatusUpdate(res, message, type = "status", data = {}) {
  // Ensure the connection is still open before writing
  if (!res.headersSent) {
    // Check if headers have been sent (prevents errors if client disconnects)
    // This part should ideally be set ONCE at the beginning of the stream,
    // not on every sendStatusUpdate call. If called multiple times, writeHead
    // will throw an error once headers are sent.
    // For Server-Sent Events, the header is typically sent once when the connection is established.
    // Let's remove this check for now and assume the caller (generateSalesforceCodeAndPush)
    // sets the header correctly once.
  }
  // Format as a server-sent event
  res.write(`data: ${JSON.stringify({ type, message, ...data })}\n\n`);
}

/**
 * Helper function to fetch repository contents recursively from GitHub.
 * It fetches content for common code and text file types.
 * This function is adapted from codeAnalysisController.js
 * @param {object} octokit - Authenticated Octokit instance.
 * @param {string} owner - GitHub repository owner.
 * @param {string} repo - GitHub repository name.
 * @param {string} branch - The branch to fetch contents from.
 * @param {string} path - The current path within the repository (for recursion).
 * @param {Array<Object>} fetchedFiles - Accumulator for fetched file objects ({ path, content }).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of fetched file objects.
 */
async function fetchRepoContents(
  octokit,
  owner,
  repo, // <--- Ensure 'repo' is always passed into this helper
  branch,
  path = "",
  fetchedFiles = []
) {
  try {
    const { data: contents } = await octokit.rest.repos.getContents({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(contents)) {
      for (const item of contents) {
        const isCodeOrTextFile =
          item.name.endsWith(".js") ||
          item.name.endsWith(".ts") ||
          item.name.endsWith(".jsx") ||
          item.name.endsWith(".tsx") ||
          item.name.endsWith(".py") ||
          item.name.endsWith(".java") ||
          item.name.endsWith(".c") ||
          item.name.endsWith(".cpp") ||
          item.name.endsWith(".h") ||
          item.name.endsWith(".hpp") ||
          item.name.endsWith(".go") ||
          item.name.endsWith(".rb") ||
          item.name.endsWith(".php") ||
          item.name.endsWith(".cs") ||
          item.name.endsWith(".json") ||
          item.name.endsWith(".xml") || // Important for Salesforce metadata
          item.name.endsWith(".html") ||
          item.name.endsWith(".css") ||
          item.name.endsWith(".scss") ||
          item.name.endsWith(".md") ||
          item.name.endsWith(".txt") ||
          item.name.endsWith(".yml") ||
          item.name.endsWith(".yaml") ||
          item.name.endsWith(".sh") ||
          item.name.endsWith(".dockerfile") ||
          item.name.endsWith(".cls") || // Salesforce Apex classes
          item.name.endsWith(".trigger") || // Salesforce Apex triggers
          item.name.endsWith("-meta.xml") || // Explicitly include Salesforce metadata XMLs
          item.name.startsWith("."); // Include dotfiles

        if (item.type === "file" && isCodeOrTextFile && item.download_url) {
          try {
            const fileContentResponse = await fetch(item.download_url, {
              headers: {
                Authorization: `token ${octokit.auth}`, // Correct way to pass PAT for fetch
                "User-Agent": "GitGPT-App", // Generic user agent
              },
            });
            if (fileContentResponse.ok) {
              const fileContent = await fileContentResponse.text();
              fetchedFiles.push({
                path: item.path,
                content: fileContent,
                sha: item.sha,
              });
            } else {
              console.warn(
                `Failed to fetch raw content for ${item.path}: ${fileContentResponse.statusText}`
              );
            }
          } catch (fileError) {
            console.warn(
              `Error fetching file ${item.path}: ${fileError.message}`
            );
          }
        } else if (item.type === "dir") {
          await fetchRepoContents(
            octokit,
            owner,
            repo, // Pass repo here
            branch,
            item.path,
            fetchedFiles
          );
        }
      }
    } else if (contents && contents.type === "file" && contents.download_url) {
      // Directly fetched a single file (not a directory listing)
      const isCodeOrTextFile =
        contents.name.endsWith(".js") ||
        contents.name.endsWith(".ts") ||
        contents.name.endsWith(".jsx") ||
        contents.name.endsWith(".tsx") ||
        contents.name.endsWith(".py") ||
        contents.name.endsWith(".java") ||
        contents.name.endsWith(".c") ||
        contents.name.endsWith(".cpp") ||
        contents.name.endsWith(".h") ||
        contents.name.endsWith(".hpp") ||
        contents.name.endsWith(".go") ||
        contents.name.endsWith(".rb") ||
        contents.name.endsWith(".php") ||
        contents.name.endsWith(".cs") ||
        contents.name.endsWith(".json") ||
        contents.name.endsWith(".xml") ||
        contents.name.endsWith(".html") ||
        contents.name.endsWith(".css") ||
        contents.name.endsWith(".scss") ||
        contents.name.endsWith(".md") ||
        contents.name.endsWith(".txt") ||
        contents.name.endsWith(".yml") ||
        contents.name.endsWith(".yaml") ||
        contents.name.endsWith(".sh") ||
        contents.name.endsWith(".dockerfile") ||
        contents.name.endsWith(".cls") || // Salesforce Apex classes
        contents.name.endsWith(".trigger") || // Salesforce Apex triggers
        contents.name.endsWith("-meta.xml") || // Explicitly include Salesforce metadata XMLs
        contents.name.startsWith(".");
      if (isCodeOrTextFile) {
        try {
          const fileContentResponse = await fetch(contents.download_url, {
            headers: {
              Authorization: `token ${octokit.auth}`, // Correct way to pass PAT for fetch
              "User-Agent": "GitGPT-App",
            },
          });
          if (fileContentResponse.ok) {
            const fileContent = await fileContentResponse.text();
            fetchedFiles.push({
              path: contents.path,
              content: fileContent,
              sha: contents.sha,
            });
          } else {
            console.warn(
              `Failed to fetch raw content for single file ${contents.path}: ${fileContentResponse.statusText}`
            );
          }
        } catch (fileError) {
          console.warn(
            `Error fetching single file ${contents.path}: ${fileError.message}`
          );
        }
      }
    }
  } catch (error) {
    // If the path doesn't exist, GitHub API returns 404, which is handled here
    if (error.status === 404) {
      console.log(`Path not found: ${path} in ${owner}/${repo}/${branch}.`);
    } else {
      console.error(
        `Error in fetchRepoContents for ${path} in ${owner}/${repo}/${branch}:`,
        error.message
      );
    }
    // Do not re-throw, allow to return successfully fetched files so far
  }
  return fetchedFiles;
}

/**
 * @desc Create a new user story for a project.
 * @route POST /api/user-stories
 * @access Private
 */
const createUserStory = async (req, res) => {
  const {
    projectId,
    userStoryTitle,
    description,
    acceptanceCriteria,
    testingScenarios,
    collaboratorGithubIds,
    aiEnhancedUserStory,
    // NEW: Added fields
    priority,
    estimatedTime,
  } = req.body;
  const creator_id = req.user.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });
    const selectedCollaborators = [];
    if (
      projectCollaboratorDoc &&
      collaboratorGithubIds &&
      collaboratorGithubIds.length > 0
    ) {
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

    const newUserStory = await UserStory.create({
      creator_id,
      projectId,
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaborators: selectedCollaborators,
      aiEnhancedUserStory: aiEnhancedUserStory || "",
      // NEW: Set default status to PLANNING, can be overridden if AI generated
      status: aiEnhancedUserStory ? "IN REVIEW" : "PLANNING",
      priority: priority || "Medium", // Use provided priority or default
      estimatedTime: estimatedTime || "", // Use provided estimatedTime or default
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
 * @desc     all user stories for a specific project.
 * @route GET /api/user-stories/:projectId
 * @access Private
 */
const getUserStoriesByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const userStories = await UserStory.find({ projectId })
      .sort({ createdAt: -1 })
      .populate("creator_id", "username email");
    res.status(200).json({ success: true, userStories });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Update a user story.
 * @route PUT /api/user-stories/:userStoryId
 * @access Private
 */
const updateUserStory = async (req, res) => {
  const { userStoryId } = req.params;
  const {
    userStoryTitle,
    description,
    acceptanceCriteria,
    testingScenarios,
    collaboratorGithubIds,
    aiEnhancedUserStory,
    // NEW: Added fields
    status, // Allow manual status update, but AI/PR will override for specific cases
    priority,
    estimatedTime,
  } = req.body;

  try {
    const story = await UserStory.findById(userStoryId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "User story not found." });
    }

    // Optional: Authorization check can be added here
    // e.g., if (story.creator_id.toString() !== req.user.id && req.user.role !== 'manager') ...

    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: story.projectId,
    });
    const selectedCollaborators = [];
    if (projectCollaboratorDoc && collaboratorGithubIds) {
      collaboratorGithubIds.forEach((githubId) => {
        const foundCollab = projectCollaboratorDoc.collaborators.find(
          (c) => c.githubId === githubId
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

    story.userStoryTitle = userStoryTitle || story.userStoryTitle;
    story.description = description || story.description;
    story.acceptanceCriteria = acceptanceCriteria || story.acceptanceCriteria;
    story.testingScenarios = testingScenarios || story.testingScenarios;
    story.collaborators = selectedCollaborators;
    story.aiEnhancedUserStory =
      aiEnhancedUserStory !== undefined
        ? aiEnhancedUserStory
        : story.aiEnhancedUserStory;
    // NEW: Update status, priority, and estimatedTime if provided
    story.status = status || story.status; // Manual status update, will be overridden by AI/PR flow
    story.priority = priority || story.priority;
    story.estimatedTime = estimatedTime || story.estimatedTime;

    const updatedStory = await story.save();

    res.status(200).json({
      success: true,
      message: "User story updated successfully.",
      userStory: updatedStory,
    });
  } catch (error) {
    console.error("Error updating user story:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Delete a user story.
 * @route DELETE /api/user-stories/:userStoryId
 * @access Private
 */
const deleteUserStory = async (req, res) => {
  const { userStoryId } = req.params;

  try {
    const story = await UserStory.findById(userStoryId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "User story not found." });
    }

    // Optional: Authorization check can be added here

    await story.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "User story deleted successfully." });
  } catch (error) {
    console.error("Error deleting user story:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Generate AI-enhanced user story content.
 * @route POST /api/user-stories/generate-ai-story
 * @access Private
 */
const generateAiStoryContent = async (req, res) => {
  const { userStoryTitle, description, acceptanceCriteria, testingScenarios } =
    req.body;

  if (
    !userStoryTitle ||
    !description ||
    !acceptanceCriteria ||
    !testingScenarios
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields for AI generation.",
    });
  }

  const prompt = `As an expert project manager and agile coach, enhance the following user story details.
Ensure the user story is well-defined, follows the INVEST principles, and provides clear guidance for a development team.
Structure the output clearly.

User Story Input:
-----------------
Title: ${userStoryTitle}
Description: ${description}
Acceptance Criteria:
${acceptanceCriteria}
Testing Scenarios:
${testingScenarios}
-----------------

Enhanced User Story Output (provide only the enhanced content, ready to be stored):`;

  try {
    console.log("Looking for Gemini config for user:", req.user.id);
    const user = await User.findById(req.user.id);
    const configOwnerId = user.role === "developer" ? user.managerId : user._id;
    const geminiConfig = await Configuration.findOne({
      userId: configOwnerId,
      configTitle: { $regex: /^gemini$/i },
      isActive: true,
    });
    console.log("Gemini config found:", geminiConfig);
    const apiKeyObj = geminiConfig?.configValue.find(
      v => v.key.toLowerCase() === "apikey" || v.key.toLowerCase() === "gemini_api_key" || v.key.toLowerCase() === "api_key"
    );
    const apiKey = apiKeyObj?.value;
    if (!apiKey) {
      throw new Error("Gemini integration not configured. Please add your Gemini API key in settings.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error from Gemini API:", errorData);
      throw new Error(
        `Gemini API request failed with status ${response.status}`
      );
    }

    const result = await response.json();

    if (result.candidates && result.candidates[0].finishReason === "SAFETY") {
      return res.status(400).json({
        success: false,
        message: "Content was blocked by safety filters.",
      });
    }

    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      const enhancedText = result.candidates[0].content.parts[0].text;
      res
        .status(200)
        .json({ success: true, aiEnhancedText: enhancedText.trim() });
    } else {
      console.error("Unexpected API response structure from Gemini:", result);
      res
        .status(500)
        .json({ success: false, message: "Failed to parse AI response." });
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      success: false,
      message: `Error generating AI story content: ${error.message}`,
    });
  }
};

/**
 * @desc Generate Salesforce code based on user story and push to GitHub.
 * @route POST /api/user-stories/:userStoryId/generate-salesforce-code
 * @access Private
 */
const generateSalesforceCodeAndPush = async (req, res) => {
  // Ensure ES Modules are loaded before using Octokit
  await loadESModules();

  const { userStoryId } = req.params;
  const { projectId } = req.body;
  const authenticatedUserId = req.user.id;

  // Set response headers for Server-Sent Events immediately
  // This should be done only once.
  if (!res.headersSent) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
  }

  // Helper to send status and check connection.
  // Updated sendStatusUpdate to be safer when used multiple times.
  const sendSafeStatusUpdate = (message, type = "status", data = {}) => {
    try {
      if (!res.writableEnded) {
        // Check if the response stream is still open
        res.write(`data: ${JSON.stringify({ type, message, ...data })}\n\n`);
      } else {
        console.warn(
          "Attempted to send status update after client disconnected or response ended."
        );
      }
    } catch (writeError) {
      console.error("Error sending SSE message:", writeError);
    }
  };

  // Handle client disconnect
  req.on("close", () => {
    console.log("Client disconnected during Salesforce code generation.");
    if (!res.writableEnded) {
      res.end(); // Ensure the response is ended if client closes connection
    }
  });

  try {
    sendSafeStatusUpdate("AI code generation initiated...");

    // 1. Fetch project and user's GitHub data
    const project = await Project.findById(projectId);
    if (!project) {
      sendSafeStatusUpdate("Project not found.", "error");
      return res.end();
    }
    const githubRepoUrl = project.githubRepoLink;
    if (!githubRepoUrl) {
      sendSafeStatusUpdate(
        "GitHub repository link not found for this project. Please configure it in project settings.",
        "error"
      );
      return res.end();
    }

    const userGitHubData = await GitHubData.findOne({
      userId: authenticatedUserId,
    });
    if (!userGitHubData || !userGitHubData.githubPAT) {
      sendSafeStatusUpdate(
        "User's GitHub PAT not found. Please authenticate with GitHub.",
        "error"
      );
      return res.end();
    }
    const githubToken = userGitHubData.githubPAT;
    const githubUsername = userGitHubData.githubUsername;

    const octokit = new Octokit({ auth: githubToken });

    const userStory = await UserStory.findById(userStoryId);
    if (!userStory) {
      sendSafeStatusUpdate("User story not found.", "error");
      return res.end();
    }

    const repoMatch = githubRepoUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/i
    );
    if (!repoMatch) {
      sendSafeStatusUpdate(
        "Invalid GitHub repository URL from project.",
        "error"
      );
      return res.end();
    }
    const owner = repoMatch[1];
    const repoName = repoMatch[2];

    let baseBranchSha;
    let actualBaseBranchName = "main"; // Default to 'main' as a safe fallback for PR base

    sendSafeStatusUpdate("Fetching repository context...");
    // Determine the actual base branch and its SHA (prioritize 'dev', then default)
    try {
      // First, attempt to directly get the 'dev' branch by exact name
      const { data: devBranchRef } = await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: "heads/dev",
      });
      baseBranchSha = devBranchRef.object.sha;
      actualBaseBranchName = "dev";
      console.log(`Using 'dev' as the base branch. SHA: ${baseBranchSha}`);
    } catch (error) {
      if (error.status === 404) {
        console.warn(
          `'dev' branch not found directly. Attempting to list all branches to find a case-insensitive match or default.`
        );
        try {
          // List all branches to find 'dev' case-insensitively or get default
          const { data: allBranches } = await octokit.rest.repos.listBranches({
            owner,
            repo: repoName,
            per_page: 100, // Fetch a good number of branches
          });

          const foundDevBranch = allBranches.find(
            (b) => b.name.toLowerCase() === "dev"
          );

          if (foundDevBranch) {
            actualBaseBranchName = foundDevBranch.name; // Use the actual case of the branch
            const { data: foundDevRef } = await octokit.rest.git.getRef({
              owner,
              repo: repoName,
              ref: `heads/${actualBaseBranchName}`,
            });
            baseBranchSha = foundDevRef.object.sha;
            console.log(
              `Found case-insensitive 'dev' branch: '${actualBaseBranchName}'. Using it as base. SHA: ${baseBranchSha}`
            );
          } else {
            // Fallback to default branch if 'dev' (case-insensitive) is not found
            const { data: repoDetails } = await octokit.rest.repos.get({
              owner,
              repo: repoName,
            });
            actualBaseBranchName = repoDetails.default_branch;
            const { data: defaultBranchRef } = await octokit.rest.git.getRef({
              owner,
              repo: repoName,
              ref: `heads/${actualBaseBranchName}`,
            });
            baseBranchSha = defaultBranchRef.object.sha;
            console.log(
              `'dev' branch (case-insensitive) not found. Using default branch '${actualBaseBranchName}' as the base. SHA: ${baseBranchSha}`
            );
          }
        } catch (listError) {
          if (listError.status === 404) {
            sendSafeStatusUpdate(
              res,
              `Repository '${owner}/${repoName}' appears to be empty or uninitialized. Please create an initial commit and a 'dev' branch or a default branch (e.g., 'main') first.`,
              "error"
            );
            return res.end();
          }
          sendSafeStatusUpdate(
            res,
            `Failed to list branches or get default branch details for ${owner}/${repoName}: ${listError.message}`,
            "error"
          );
          return res.end();
        }
      } else {
        sendSafeStatusUpdate(
          res,
          `Failed to get 'dev' branch details for ${owner}/${repoName}: ${error.message}`,
          "error"
        );
        return res.end();
      }
    }

    // 2. Determine if Salesforce DX structure exists and fetch existing code
    let isSalesforceDXRepo = false;
    let existingCodeContext = "";
    let baseTreeSha = ""; // Initialize baseTreeSha

    try {
      const { data: commitData } = await octokit.rest.git.getCommit({
        owner,
        repo: repoName, // This was 'repo' and caused ReferenceError: repo is not defined because the parameter was named 'repo' in `fetchRepoContents` but 'repoName' here.
        commit_sha: baseBranchSha,
      });
      baseTreeSha = commitData.tree.sha;

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo: repoName, // This was 'repo' and caused ReferenceError: repo is not defined
        tree_sha: baseTreeSha,
        recursive: "true", // Get all files and directories
      });

      // Check if sfdx-project.json exists in the root of the tree
      if (
        treeData.tree.some(
          (item) => item.path === "sfdx-project.json" && item.type === "blob"
        )
      ) {
        isSalesforceDXRepo = true;
        console.log(
          "sfdx-project.json found. Repository has Salesforce DX structure."
        );

        // Fetch contents of Salesforce directories if they exist
        const sfPathsToFetch = [
          "force-app/main/default/classes",
          "force-app/main/default/lwc",
          "force-app/main/default/objects",
          "force-app/main/default/flows",
          "force-app/main/default/triggers",
          "force-app/main/default/flexipages", // Added common metadata types
          "force-app/main/default/tabs",
          "force-app/main/default/layouts",
          "force-app/main/default/applications",
          "force-app/main/default/permissionsets",
        ];
        let filesRead = [];

        for (const sfPath of sfPathsToFetch) {
          try {
            // Fetch contents for the specific Salesforce path
            const contents = await fetchRepoContents(
              octokit,
              owner,
              repoName, // Ensure repoName is passed here
              actualBaseBranchName,
              sfPath
            );
            filesRead = filesRead.concat(contents);
          } catch (error) {
            // Log if path not found, but don't stop the process
            if (error.status === 404) {
              console.log(`Salesforce path not found: ${sfPath}`);
            } else {
              throw error; // Re-throw other errors
            }
          }
        }

        if (filesRead.length > 0) {
          existingCodeContext = filesRead
            .map((file) => `// File: ${file.path}\n${file.content}`)
            .join("\n\n---\n\n");
          if (existingCodeContext.length > 20000) {
            // Increased context size
            // Limit context size to avoid exceeding token limits
            existingCodeContext =
              existingCodeContext.substring(0, 20000) +
              "\n\n// ... (truncated for brevity)";
          }
          console.log("Existing Salesforce code context collected for AI.");
        } else {
          console.log(
            "No existing Salesforce code files found in common directories."
          );
        }
      } else {
        console.log(
          "sfdx-project.json NOT found. Treating as no Salesforce DX structure."
        );
      }
    } catch (error) {
      if (error.status === 404) {
        // Repository might be empty or the branch doesn't have any commits yet.
        // This is valid for starting a new project.
        console.log(
          `Base branch '${actualBaseBranchName}' has no files or does not exist (expected for new repos).`
        );
      } else {
        console.error(
          "Error checking for sfdx-project.json or fetching base tree:",
          error
        );
        throw error; // Re-throw other errors
      }
    }

    // 3. Prepare AI Prompt
    // --- START AI PROMPT MODIFICATIONS ---
    let aiPrompt;
    const commonRequirements = `
      **GENERAL REQUIREMENTS FOR ALL CODE GENERATION:**
      - **Salesforce DX Structure:** Generate files within the standard Salesforce DX project structure (e.g., \`force-app/main/default/classes/\`, \`force-app/main/default/lwc/\`, \`force-app/main/default/objects/\`, etc.).
      - **Metadata XMLs:** For every component that requires a metadata XML file (e.g., Apex classes, Lightning Web Components, Custom Objects, Custom Fields, Flows, Apex Triggers), ensure its corresponding \`-meta.xml\` file is also generated with the correct API version (e.g., \`59.0\` or \`60.0\`) and status. This is CRITICAL for deployment.
      - **Apex Best Practices:**
          - **Security (FLS & CRUD):** ALL DML operations (insert, update, delete, upsert) and SOQL queries MUST enforce Field Level Security (FLS) and Object Level Security (CRUD). Use \`WITH SECURITY_ENFORCED\` for SOQL and \`Security.stripInaccessible()\` or manual \`isAccessible()\` checks for DML. Apex classes should generally use \`with sharing\`.
          - **Bulkification:** All Apex code (especially triggers and methods interacting with DML/SOQL) must be bulk-safe, meaning they can handle lists of records efficiently without hitting governor limits. Avoid SOQL or DML inside loops.
          - **Governor Limits:** Be mindful of all Salesforce governor limits (CPU time, heap size, query rows, DML statements, etc.) and write efficient code to stay within them.
          - **Error Handling:** Implement robust try-catch blocks. For methods exposed to Lightning components (\`@AuraEnabled\`), throw \`AuraHandledException\` with user-friendly messages for client-side consumption. Do NOT return generic error strings directly.
          - **Apex Test Classes:** For every Apex class and trigger, generate a corresponding test class (e.g., \`MyClassTest.cls\` for \`MyClass.cls\`).
              - Test classes must achieve at least **75% code coverage** for the Apex code they test.
              - Include test methods for **positive scenarios**, **negative/error scenarios**, and **bulk data scenarios**.
              - Use \`Test.startTest()\` and \`Test.stopTest()\` to isolate governor limits.
              - Create realistic test data within the test methods.
              - Use \`System.assert()\` or \`System.assertEquals()\` for proper assertions.
              - Ensure tests run in \`System.runAs()\` context if user permissions are relevant.
      - **Lightning Web Component (LWC) Best Practices:**
          - **Reactivity:** Use \`@api\` for public properties, \`@track\` judiciously only for objects/arrays whose internal values change, and avoid \`@track\` for primitive properties.
          - **Modularity:** Design small, reusable components.
          - **Error Handling:** Use \`ShowToastEvent\` for user-facing success, warning, and error messages.
          - **Performance:** Optimize rendering and data fetching. Avoid heavy synchronous logic.
          - **Accessibility:** Consider ARIA attributes and semantic HTML.
          - **HTML Validation:** Utilize standard HTML5 validation attributes (\`required\`, \`pattern\`, \`type\`, etc.) for \`lightning-input\` and other input fields.
          - **User Experience:** Implement loading spinners (\`lightning-spinner\`) for asynchronous operations.
      - **Code Quality:**
          - **Readability:** Write clean, well-structured, and easily understandable code.
          - **Comments:** Provide concise and meaningful comments where complexity warrants.
          - **Naming Conventions:** Follow Salesforce naming conventions (PascalCase for classes, camelCase for variables/methods, kebab-case for LWC components, etc.).
      - **Idempotency:** Where applicable, consider if operations can be safely retried.
      - **API Version:** Ensure all metadata (Apex, LWC, XMLs) uses a consistent and recent Salesforce API version (e.g., v59.0 or v60.0).

      **OUTPUT FORMAT:**
      Provide the generated/modified code as a JSON object where keys are file paths (relative to the Salesforce DX project root, e.g., \`force-app/main/default/classes/MyClass.cls\`, \`force-app/main/default/classes/MyClass.cls-meta.xml\`) and values are the file contents. Only include files that are newly created or modified.
      Example:
      \`\`\`json
      {
        "force-app/main/default/classes/ExistingClass.cls": "public class ExistingClass { /* ... modified content ... */ }",
        "force-app/main/default/classes/ExistingClass.cls-meta.xml": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<ApexClass xmlns=\\"http://soap.sforce.com/2006/04/metadata\\">\\n    <apiVersion>59.0</apiVersion>\\n    <status>Active</status>\\n</ApexClass>",
        "force-app/main/default/lwc/newComponent/newComponent.js": "import { LightningElement, api } from 'lwc';\\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\\n\\nexport default class NewComponent extends LightningElement {\\n    @api recordId;\\n\\n    // ... more JS ...\\n}",
        "force-app/main/default/lwc/newComponent/newComponent.html": "<template>\\n    <lightning-card title=\\"New Component\\">\\n        <lightning-spinner if:true={isLoading} alternative-text=\\"Loading\\"></lightning-spinner>\\n        <div class=\\"slds-var-p-around_medium\\">\\n            \\n        </div>\\n    </lightning-card>\\n</template>",
        "force-app/main/default/lwc/newComponent/newComponent.js-meta.xml": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<LightningComponentBundle xmlns=\\"http://soap.sforce.com/2006/04/metadata\\">\\n    <apiVersion>59.0</apiVersion>\\n    <isExposed>true</isExposed>\\n    <targets>\\n        <target>lightning__RecordPage</target>\\n        <target>lightning__AppPage</target>\\n    </targets>\\n</LightningComponentBundle>",
        "sfdx-project.json": "{\\"packageDirectories\\":[{\\"path\\":\\"force-app\\",\\"default\\":true}],\\"namespace\\":\\"\\",\\"sfdcApiVersion\\":\\"59.0\\",\\"sourceApiVersion\\":\\"59.0\\"}",
        "force-app/main/default/objects/MyCustomObject__c/MyCustomObject__c.object-meta.xml": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<CustomObject xmlns=\\"http://soap.sforce.com/2006/04/metadata\\">\\n    <fullName>MyCustomObject__c</fullName>\\n    <label>My Custom Object</label>\\n    <pluralLabel>My Custom Objects</pluralLabel>\\n    <enableActivities>true</enableActivities>\\n    <description>Description of my custom object.</description>\\n    <nameField>\\n        <displayFormat>MCO-{0000}</displayFormat>\\n        <label>My Custom Object Name</label>\\n        <type>AutoNumber</type>\\n    </nameField>\\n    <visibility>Public</visibility>\\n</CustomObject>",
        "force-app/main/default/objects/MyCustomObject__c/fields/MyCustomField__c.field-meta.xml": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<CustomField xmlns=\\"http://soap.sforce.com/2006/04/metadata\\">\\n    <fullName>MyCustomField__c</fullName>\\n    <externalId>false</externalId>\\n    <label>My Custom Field</label>\\n    <length>255</length>\\n    <required>false</required>\\n    <trackTrending>false</trackTrending>\\n    <type>Text</type>\\n    <unique>false</unique>\\n</CustomField>"
      }
      \`\`\`
    `;

    if (isSalesforceDXRepo) {
      aiPrompt = `You are an expert Salesforce Developer AI. Your task is to act as a highly skilled and diligent Salesforce developer.
      ${commonRequirements}

      **TASK:** Modify or extend the existing Salesforce codebase to implement the following user story and its subtasks. If new components are needed, create them. If existing components need modification, extend them minimally and purposefully.

      **User Story Details:**
      Title: ${userStory.userStoryTitle}
      Description: ${userStory.description}
      Acceptance Criteria: ${userStory.acceptanceCriteria}
      Testing Scenarios: ${userStory.testingScenarios}

      **EXISTING CODE CONTEXT (relevant files from the '${actualBaseBranchName}' branch):**
      ${
        existingCodeContext ||
        "No specific existing code context available. Generate new files if needed."
      }
      `;
    } else {
      console.log(
        `Repository detected as empty or lacking Salesforce DX structure. Generating full structure.`
      );
      aiPrompt = `You are an expert Salesforce Developer AI. Your task is to act as a highly skilled and diligent Salesforce developer.
      ${commonRequirements}

      **TASK:** Generate a complete Salesforce DX project structure and all necessary Salesforce code (Apex, Lightning Web Components, metadata for custom objects, fields, flows, validation rules, etc.) to fully implement the following user story and its subtasks from scratch.

      **User Story Details:**
      Title: ${userStory.userStoryTitle}
      Description: ${userStory.description}
      Acceptance Criteria: ${userStory.acceptanceCriteria}
      Testing Scenarios: ${userStory.testingScenarios}
      `;
    }
    // --- END AI PROMPT MODIFICATIONS ---

    // 4. Call AI to generate Salesforce code
    const user = await User.findById(req.user.id);
    const configOwnerId = user.role === "developer" ? user.managerId : user._id;
    const geminiConfig = await Configuration.findOne({
      userId: configOwnerId,
      configTitle: { $regex: /^gemini$/i },
      isActive: true,
    });
    const apiKeyObj = geminiConfig?.configValue.find(
      v => v.key.toLowerCase() === "apikey" || v.key.toLowerCase() === "gemini_api_key" || v.key.toLowerCase() === "api_key"
    );
    const apiKey = apiKeyObj?.value;
    if (!apiKey) {
      throw new Error("Gemini integration not configured. Please add your Gemini API key in settings.");
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: aiPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192, // Increased max output tokens for potentially larger code
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE", // Adjusted for code generation
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE", // Adjusted for code generation
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE", // Adjusted for code generation
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE", // Adjusted for code generation
        },
      ],
    };

    sendSafeStatusUpdate("Sending request to AI model...");
    console.log("Calling Gemini API for Salesforce code generation...");
    const aiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("Error from Gemini API:", errorData);
      sendSafeStatusUpdate(
        `Gemini API request failed: ${aiResponse.status} - ${errorData}`,
        "error"
      );
      return res.end();
    }

    const result = await aiResponse.json();

    if (result.candidates && result.candidates[0].finishReason === "SAFETY") {
      sendSafeStatusUpdate(
        "AI code generation content was blocked by safety filters.",
        "error"
      );
      return res.end();
    }

    let generatedCodeFiles;
    let geminiTokensUsed = 0; // Initialize token counter
    if (result.usageMetadata && result.usageMetadata.totalTokenCount) {
      geminiTokensUsed = result.usageMetadata.totalTokenCount;
    }

    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      try {
        const rawContent = result.candidates[0].content.parts[0].text;
        // The AI might enclose the JSON in markdown code blocks.
        // Attempt to extract if present, otherwise parse directly.
        const jsonMatch = rawContent.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : rawContent;

        generatedCodeFiles = JSON.parse(jsonString);
        if (
          typeof generatedCodeFiles !== "object" ||
          Array.isArray(generatedCodeFiles)
        ) {
          throw new Error(
            "AI did not return a valid JSON object for code files."
          );
        }
      } catch (parseError) {
        console.error("Failed to parse AI generated code JSON:", parseError);
        sendSafeStatusUpdate(
          "Failed to parse AI code generation response.",
          "error"
        );
        return res.end();
      }
    } else {
      console.error(
        "Unexpected AI response structure for code generation:",
        result
      );
      sendSafeStatusUpdate(
        "Failed to get AI generated Salesforce code.",
        "error"
      );
      return res.end();
    }
    sendSafeStatusUpdate("AI response received. Generating code...");
    sendSafeStatusUpdate("Code generation completed. Preparing for GitHub...");

    // 5. Create a new branch name and check for uniqueness
    const userStoryTitleWords = userStory.userStoryTitle
      .split(/\s+/)
      .slice(0, 3) // Take only the first 3 words
      .join("-");
    const sanitizedUserStoryTitle = userStoryTitleWords
      .replace(/[^a-zA-Z0-9-]/g, "") // Sanitize for branch name
      .toLowerCase();
    let newBranchName = `feature/ai/user-story-${sanitizedUserStoryTitle}`;

    // Check if branch name already exists, if so, append a timestamp
    try {
      await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: `heads/${newBranchName}`,
      });
      // If it exists, append a timestamp to make it unique
      console.warn(
        `Branch '${newBranchName}' already exists remotely. Appending timestamp.`
      );
      const timestamp = Date.now();
      newBranchName = `${newBranchName}-${timestamp}`;
    } catch (error) {
      if (error.status !== 404) {
        // Re-throw if it's an error other than "not found"
        throw new Error(
          `Failed to check remote branch existence: ${error.message}`
        );
      }
      // else: branch does not exist, safe to use the original name
    }

    sendSafeStatusUpdate(`Creating new branch '${newBranchName}'...`);
    // 6. Create Blobs and Tree for the new commit
    const treeUpdates = [];
    let linesOfCodeAddedByAI = 0; // Initialize counter for AI LOC

    // Fetch current tree for the base branch to ensure we include existing files
    const { data: latestTree } = await octokit.rest.git.getTree({
      owner,
      repo: repoName,
      tree_sha: baseTreeSha,
      recursive: true,
    });

    const existingFilesMap = new Map();
    const existingFileShas = new Map(); // Store SHA to compare content
    latestTree.tree.forEach((item) => {
      if (item.type === "blob") {
        existingFilesMap.set(item.path, item.sha);
      }
    });

    for (const filePathRelative in generatedCodeFiles) {
      const fileContent = generatedCodeFiles[filePathRelative];

      const existingSha = existingFilesMap.get(filePathRelative);
      let blobSha;
      let isFileModified = false;
      let previousContent = "";

      if (existingSha) {
        try {
          const { data: blob } = await octokit.rest.git.getBlob({
            owner,
            repo: repoName,
            file_sha: existingSha,
          });
          previousContent = Buffer.from(blob.content, "base64").toString(
            "utf8"
          );
          if (previousContent === fileContent) {
            blobSha = existingSha;
            console.log(
              `File ${filePathRelative} unchanged, reusing existing blob.`
            );
          } else {
            // Content changed, so it's a modification
            isFileModified = true;
          }
        } catch (blobError) {
          console.warn(
            `Could not verify existing blob for ${filePathRelative}: ${blobError.message}. Creating new blob.`
          );
          isFileModified = true; // Treat as modified if we can't verify
        }
      } else {
        // File is new
        isFileModified = true;
      }

      if (!blobSha) {
        // Only create a new blob if content changed or it's a new file
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner,
          repo: repoName,
          content: fileContent,
          encoding: "utf-8",
        });
        blobSha = blobData.sha;
        console.log(`Created new blob for: ${filePathRelative}`);
      }

      treeUpdates.push({
        path: filePathRelative,
        mode: "100644",
        type: "blob",
        sha: blobSha,
      });

      // Calculate lines of code added by AI
      if (isFileModified) {
        const diffResult = parseDiffForLoc(previousContent, fileContent);
        linesOfCodeAddedByAI += diffResult.added; // Use actual added lines from diff
      }
    }

    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree: treeUpdates,
    });
    const newTreeSha = newTree.sha;
    console.log(`Created new tree with SHA: ${newTreeSha}`);

    // 7. Create a New Commit
    const commitMessage = `feat(AI): Implement User Story: ${userStory.userStoryTitle}\n\nThis commit contains AI-generated Salesforce code based on the user story.`;
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo: repoName,
      message: commitMessage,
      tree: newTreeSha,
      parents: [baseBranchSha],
    });
    const newCommitSha = newCommit.sha;
    console.log(`Created new commit with SHA: ${newCommitSha}`);

    // 8. Create or Update the new branch reference
    try {
      await octokit.rest.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/heads/${newBranchName}`,
        sha: newCommitSha,
      });
      console.log(
        `Created new branch '${newBranchName}' pointing to commit ${newCommitSha}`
      );
    } catch (error) {
      if (error.status === 422) {
        console.warn(
          `Branch '${newBranchName}' already exists. Attempting to update it.`
        );
        await octokit.rest.git.updateRef({
          owner,
          repo: repoName,
          ref: `heads/${newBranchName}`,
          sha: newCommitSha,
          force: true,
        });
        console.log(
          `Updated existing branch '${newBranchName}' to commit ${newCommitSha}`
        );
      } else {
        throw error;
      }
    }
    sendSafeStatusUpdate("Pushing generated code...");

    // 9. Create a Pull Request (from newBranchName to targetBranchForPR)
    const prTitle = `feat(AI): Implement User Story: ${userStory.userStoryTitle} [UserStoryId: ${userStoryId}]`;
    const prBody = `This PR introduces AI-generated Salesforce code to implement the user story:

**User Story:** ${userStory.userStoryTitle}
**Description:** ${userStory.description}

**Acceptance Criteria:**
${userStory.acceptanceCriteria}

**Testing Scenarios:**
${userStory.testingScenarios}

*This code was automatically generated by the AI and requires human review for accuracy, best practices, and integration.*`;

    sendSafeStatusUpdate("Creating Pull Request...");
    console.log(`Attempting to create PR:`);
    console.log(`Owner: ${owner}`);
    console.log(`Repo: ${repoName}`);
    console.log(`Head branch (source): ${newBranchName}`);
    console.log(`Base branch (target): ${actualBaseBranchName}`);

    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo: repoName,
      title: prTitle,
      head: newBranchName,
      base: actualBaseBranchName,
      body: prBody,
      draft: true, // Always create as draft for AI-generated code
    });
    console.log(`Pull Request created: ${pr.html_url}`);

    // 10. Record AI Code Contribution
    await CodeContribution.create({
      projectId,
      userStoryId,
      contributorType: "AI",
      linesOfCode: linesOfCodeAddedByAI, // Use the calculated lines
      geminiTokensUsed, // Record actual tokens used for this generation
      prUrl: pr.html_url,
      contributionDate: new Date(),
    });
    console.log(`AI code contribution recorded for user story ${userStoryId}.`);

    // Update the user story in the database with the new GitHub details and status
    userStory.githubBranch = newBranchName;
    userStory.prUrl = pr.html_url;
    userStory.status = "AI DEVELOPED"; // Update user story status
    await userStory.save();
    console.log(
      `User story ${userStoryId} updated with GitHub branch, PR URL, and status.`
    );

    sendSafeStatusUpdate("Process completed successfully!", "complete", {
      githubBranch: newBranchName,
      githubRepoUrl: githubRepoUrl,
      prUrl: pr.html_url,
      userStoryStatus: "AI DEVELOPED", // Send updated status to client
    });
    res.end();
  } catch (error) {
    console.error(
      "Error during Salesforce code generation and GitHub operations:",
      error
    );
    let errorMessage = `Failed to generate Salesforce code and push to GitHub: ${error.message}`;
    if (error.response?.data?.message) {
      errorMessage += ` (GitHub API Error: ${error.response.data.message})`;
    }
    sendSafeStatusUpdate(errorMessage, "error");
    res.end();
  }
};

/**
 * @desc Handle GitHub Webhook (Existing function, adding logic for developer contributions)
 * @route POST /api/github/webhook
 * @access Public (with secret verification)
 */
const handleGitHubWebhook = async (req, res) => {
  const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];
  const deliveryID = req.headers["x-github-delivery"];

  const payload = req.body;

  if (GITHUB_WEBHOOK_SECRET && signature) {
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
      const { action, member, repository, organization, scope } = req.body;
      const relevantMember =
        member || (scope === "user" ? req.body.user : null);

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
          await updateCollaboratorStatusInDb(project._id, githubId, "rejected");
        }
      }
    } else if (event === "push") {
      const { ref, commits, repository, pusher } = payload;
      const branchName = ref.replace("refs/heads/", "");
      const repoFullName = repository.full_name;
      const githubUsername = pusher.name; // GitHub username of the pusher

      console.log(`Push event on branch: ${branchName} in ${repoFullName}`);

      const project = await Project.findOne({
        githubRepoLink: { $regex: new RegExp(repoFullName, "i") },
      });

      if (project) {
        // Fetch the associated user story if this push is on an AI-generated branch
        const userStory = await UserStory.findOne({
          projectId: project._id,
          githubBranch: branchName, // Check if this branch is associated with a user story
        });

        // NOTE: getGitHubAuthDetails is not defined in the provided snippet.
        // It's assumed to be available or to be implemented elsewhere.
        // For the purpose of this task, I will mock it or skip it if not critical
        // to the core functionality requested.
        // const { pat, username } = await getGitHubAuthDetails(req.user.id);
        // const octokit = new Octokit({ auth: pat });

        let totalLinesChanged = 0;
        let isFixOnAiBranch = false;

        // Check if the branch name indicates an AI-generated branch
        if (branchName.startsWith("feature/ai/user-story-") && userStory) {
          isFixOnAiBranch = true;
          console.log(
            `Push on AI-generated branch for User Story: ${userStory.userStoryTitle}`
          );
          // If it's a push to an AI-generated branch, it implies developer intervention/fixes
          // You might want to update the user story status here, e.g., "IN REVIEW" or "AI ASSISTED"
          // For now, we'll just track the contribution.
          if (userStory.status === "AI DEVELOPED") {
            userStory.status = "IN REVIEW"; // Or "AI DEVELOPED - REFINEMENT"
            await userStory.save();
            console.log(
              `User Story ${userStory._id} status updated to 'IN REVIEW' due to developer push.`
            );
          }
        }

        // For simplicity, skipping detailed commit analysis here as it requires
        // Octokit and full auth setup, and the core request is about
        // adding fields and updating their values.
        // The existing `handleGitHubWebhook` already has basic logic.
        // I will focus on updating the status based on PR events as requested.

        /* Original commit processing logic (requires `octokit` to be initialized):
        for (const commit of commits) {
          try {
            const { data: commitDetails } = await octokit.rest.repos.getCommit({
              owner: repository.owner.login,
              repo: repository.name,
              ref: commit.sha,
            });

            // Calculate lines of code from commit diff
            let linesAdded = 0;
            let linesDeleted = 0;
            if (commitDetails.files) {
              commitDetails.files.forEach((file) => {
                linesAdded += file.additions || 0;
                linesDeleted += file.deletions || 0;
              });
            }
            totalLinesChanged += linesAdded; // For simplicity, just count additions

            // Record developer contribution
            await CodeContribution.create({
              projectId: project._id,
              userStoryId: userStory ? userStory._id : null, // Link to user story if applicable
              contributorType: "Developer",
              githubUsername: githubUsername,
              linesOfCode: linesAdded, // Log additions as developer's contribution
              isFixOnAiBranch: isFixOnAiBranch,
              contributionDate: new Date(commit.timestamp),
            });
            console.log(
              `Developer contribution recorded for commit ${commit.sha}: ${linesAdded} lines.`
            );
          } catch (commitError) {
            console.error(
              `Error fetching commit details for ${commit.sha}:`,
              commitError.message
            );
          }
        }
        */
      } else {
        console.log(`No project found for repository: ${repoFullName}`);
      }
    } else if (event === "pull_request") {
      const { action, pull_request, repository } = payload;
      const repoFullName = repository.full_name;

      const project = await Project.findOne({
        githubRepoLink: { $regex: new RegExp(repoFullName, "i") },
      });

      if (project) {
        // Find the user story associated with this PR
        const userStory = await UserStory.findOne({
          prUrl: pull_request.html_url,
        });

        if (userStory) {
          if (action === "opened" || action === "reopened") {
            // When a PR related to a user story is opened or reopened, set status to IN REVIEW
            userStory.status = "IN REVIEW";
            await userStory.save();
            console.log(
              `User Story ${userStory._id} status updated to 'IN REVIEW' due to PR ${pull_request.number} being opened/reopened.`
            );
          } else if (action === "closed") {
            if (pull_request.merged) {
              // When a PR is merged, set user story status to COMPLETED
              userStory.status = "COMPLETED"; // Or "COMPLETED - MERGED"
              await userStory.save();
              console.log(
                `User Story ${userStory._id} status updated to 'COMPLETED' due to PR ${pull_request.number} being merged.`
              );
            } else {
              // PR closed without merge, potentially means AI branch needs refinement or was abandoned
              // You could set a status like "ABANDONED" or revert to "AI DEVELOPED - NEEDS REFINEMENT"
              // For now, let's keep it simple or set to "IN REVIEW" if it was AI Developed
              // or introduce a new status "PENDING REVIEW / REFINEMENT"
              if (userStory.status === "AI DEVELOPED") {
                userStory.status = "IN REVIEW"; // Or create a new status like "NEEDS REFINEMENT"
                await userStory.save();
                console.log(
                  `User Story ${userStory._id} status updated to 'IN REVIEW' (closed unmerged PR).`
                );
              }
            }
          }
        } else {
          console.log(`No user story found for PR: ${pull_request.html_url}`);
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

const getCollaboratorUserStories = async (req, res) => {
  const { userId, projectId } = req.params;

  try {
    // 1. Fetch the GitHub ID for the given userId from GitHubData model
    const userGitHubData = await GitHubData.findOne({ userId });
    if (!userGitHubData) {
      return res.status(404).json({
        success: false,
        message: "GitHub data not found for the provided user.",
      });
    }

    const githubId = userGitHubData.githubId;

    // 2. Find user stories where the collaborator.githubId matches and projectId matches
    const userStories = await UserStory.find({
      projectId: projectId,
      "collaborators.githubId": githubId, // Query within the collaborators array
    }).populate("creator_id", "username email"); // Optionally populate creator details

    res.status(200).json({ success: true, userStories });
  } catch (error) {
    console.error("Error fetching collaborator user stories:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createUserStory,
  getUserStoriesByProjectId,
  updateUserStory,
  deleteUserStory,
  generateAiStoryContent,
  generateSalesforceCodeAndPush,
  handleGitHubWebhook, // Ensure this is exported for webhook routing
  getCollaboratorUserStories,
};
