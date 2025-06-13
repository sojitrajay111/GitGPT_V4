const UserStory = require("../models/UserStory");
const Project = require("../models/Project"); // Ensure Project model is imported
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Ensure this is imported
const GitHubData = require("../models/GithubData"); // Import the GitHubData model
const path = require("path");
require("dotenv").config();

// Dynamic imports for Octokit as it might be an ES Module
let Octokit;

// Function to dynamically import modules
async function loadESModules() {
  if (!Octokit) {
    ({ Octokit } = await import("@octokit/rest"));
  }
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
          item.name.startsWith("."); // Include dotfiles

        if (item.type === "file" && isCodeOrTextFile && item.download_url) {
          try {
            const fileContentResponse = await fetch(item.download_url, {
              headers: {
                Authorization: octokit.auth, // Use Octokit's auth
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
        contents.name.startsWith(".");
      if (isCodeOrTextFile) {
        try {
          const fileContentResponse = await fetch(contents.download_url, {
            headers: {
              Authorization: octokit.auth,
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return res
        .status(500)
        .json({ success: false, message: "AI service configuration error." });
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

  try {
    // 1. Fetch project and user's GitHub data
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    const githubRepoUrl = project.githubRepoLink;
    if (!githubRepoUrl) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub repository link not found for this project. Please configure it in project settings.",
      });
    }

    const userGitHubData = await GitHubData.findOne({
      userId: authenticatedUserId,
    });
    if (!userGitHubData || !userGitHubData.githubPAT) {
      return res.status(401).json({
        success: false,
        message:
          "User's GitHub PAT not found. Please authenticate with GitHub.",
      });
    }
    const githubToken = userGitHubData.githubPAT;
    const githubUsername = userGitHubData.githubUsername;

    const octokit = new Octokit({ auth: githubToken });

    const userStory = await UserStory.findById(userStoryId);
    if (!userStory) {
      return res
        .status(404)
        .json({ success: false, message: "User story not found." });
    }

    const repoMatch = githubRepoUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/i
    );
    if (!repoMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL from project.",
      });
    }
    const owner = repoMatch[1];
    const repoName = repoMatch[2];

    let baseBranchSha;
    let actualBaseBranchName = "main"; // Default to 'main' as a safe fallback for PR base

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
            throw new Error(
              `Repository '${owner}/${repoName}' appears to be empty or uninitialized. Please create an initial commit and a 'dev' branch or a default branch (e.g., 'main') first.`
            );
          }
          throw new Error(
            `Failed to list branches or get default branch details for ${owner}/${repoName}: ${listError.message}`
          );
        }
      } else {
        throw new Error(
          `Failed to get 'dev' branch details for ${owner}/${repoName}: ${error.message}`
        );
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
          if (existingCodeContext.length > 10000) {
            // Limit context size to avoid exceeding token limits
            existingCodeContext =
              existingCodeContext.substring(0, 10000) +
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
    let aiPrompt;
    if (isSalesforceDXRepo) {
      aiPrompt = `You are an expert Salesforce Developer AI.
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

      **REQUIREMENTS:**
      - Analyze the existing codebase (if provided) to identify relevant components for modification or extension.
      - Create new Salesforce metadata files (Apex classes, LWC components, custom objects/fields via XML, Flows via XML, Validation Rules via XML, etc.) if required by the user story.
      - Modify existing Salesforce files where necessary to fulfill requirements. Prioritize extending existing files rather than rewriting them.
      - Add or update Apex test classes to cover new/modified logic, ensuring at least 75% code coverage.
      - Maintain consistency with existing code quality, style, and structure.
      - Adhere strictly to Salesforce best practices: governor limits, security (FLS, CRUD, 'with sharing' for Apex), bulkification, and proper error handling.
      - Ensure all generated/modified code seamlessly integrates with the existing codebase and is ready for deployment.

      **OUTPUT FORMAT:**
      Provide the generated/modified code as a JSON object where keys are file paths (relative to the Salesforce DX project root, e.g., 'force-app/main/default/classes/MyClass.cls') and values are the file contents. Only include files that are newly created or modified. Example:
      {
        "force-app/main/default/classes/ExistingClass.cls": "public class ExistingClass { /* ... modified content ... */ }",
        "force-app/main/default/lwc/newComponent/newComponent.js": "import { LightningElement } from 'lwc';",
        // ... more files ...
      }
      `;
    } else {
      console.log(
        `Repository detected as empty or lacking Salesforce DX structure. Generating full structure.`
      );
      aiPrompt = `You are an expert Salesforce Developer AI.
      **TASK:** Generate a complete Salesforce DX project structure and all necessary Salesforce code (Apex, Lightning Web Components, metadata for custom objects, fields, flows, validation rules, etc.) to fully implement the following user story and its subtasks from scratch.

      **User Story Details:**
      Title: ${userStory.userStoryTitle}
      Description: ${userStory.description}
      Acceptance Criteria: ${userStory.acceptanceCriteria}
      Testing Scenarios: ${userStory.testingScenarios}

      **REQUIREMENTS:**
      - Generate a standard Salesforce DX project structure (e.g., force-app/main/default/classes, force-app/main/default/lwc, etc.) including a sfdx-project.json file.
      - Create all required files for Apex classes, Lightning Web Components, metadata for custom objects, fields, flows, validation rules, etc., based on the user story.
      - Include necessary Apex test classes for all Apex code with at least 75% code coverage.
      - Adhere strictly to Salesforce best practices: governor limits, security (FLS, CRUD, 'with sharing' for Apex), bulkification, and proper error handling.
      - Ensure all generated code is functional and ready for deployment to a Salesforce org.

      **OUTPUT FORMAT:**
      Provide the generated code as a JSON object where keys are file paths (relative to the Salesforce DX project root, e.g., 'force-app/main/default/classes/MyClass.cls') and values are the file contents. Example:
      {
        "sfdx-project.json": "{\\"packageDirectories\\":[{\\"path\\":\\"force-app\\",\\"default\\":true}],\\"namespace\\":\\"\\",\\"sfdcApiVersion\\":\\"58.0\\",\\"sourceApiVersion\\":\\"58.0\\"}",
        "force-app/main/default/classes/MyApexClass.cls": "public class MyApexClass { /* ... */ }",
        "force-app/main/default/lwc/myLWC/myLWC.js": "import { LightningElement } from 'lwc';",
        // ... more files ...
      }
      `;
    }

    // 4. Call AI to generate Salesforce code
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return res
        .status(500)
        .json({ success: false, message: "AI service configuration error." });
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

    console.log("Calling Gemini API for Salesforce code generation...");
    const aiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("Error from Gemini API:", errorData);
      throw new Error(
        `Gemini API request failed with status ${aiResponse.status}: ${errorData}`
      );
    }

    const result = await aiResponse.json();

    if (result.candidates && result.candidates[0].finishReason === "SAFETY") {
      return res.status(400).json({
        success: false,
        message: "AI code generation content was blocked by safety filters.",
      });
    }

    let generatedCodeFiles;
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      try {
        generatedCodeFiles = JSON.parse(
          result.candidates[0].content.parts[0].text
        );
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
        return res.status(500).json({
          success: false,
          message: "Failed to parse AI code generation response.",
        });
      }
    } else {
      console.error(
        "Unexpected AI response structure for code generation:",
        result
      );
      return res.status(500).json({
        success: false,
        message: "Failed to get AI generated Salesforce code.",
      });
    }

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

    // 6. Create Blobs and Tree for the new commit
    const treeUpdates = [];
    // Fetch current tree for the base branch to ensure we include existing files
    const { data: latestTree } = await octokit.rest.git.getTree({
      owner,
      repo: repoName, // <--- Corrected: Using repoName here
      tree_sha: baseTreeSha,
      recursive: true, // Get all files and directories
    });

    // Map existing files to a lookup for their SHAs to avoid re-uploading unchanged files
    const existingFilesMap = new Map();
    latestTree.tree.forEach((item) => {
      if (item.type === "blob") {
        existingFilesMap.set(item.path, item.sha);
      }
    });

    for (const filePathRelative in generatedCodeFiles) {
      const fileContent = generatedCodeFiles[filePathRelative];

      // Check if the file already exists and its content is identical
      const existingSha = existingFilesMap.get(filePathRelative);
      let blobSha;
      if (existingSha) {
        try {
          const { data: blob } = await octokit.rest.git.getBlob({
            owner,
            repo: repoName, // <--- Corrected: Using repoName here
            file_sha: existingSha,
          });
          // GitHub returns content as base64 for getBlob, need to decode for comparison
          const existingContentDecoded = Buffer.from(
            blob.content,
            "base64"
          ).toString("utf8");
          if (existingContentDecoded === fileContent) {
            blobSha = existingSha; // Content is identical, reuse existing blob SHA
            console.log(
              `File ${filePathRelative} unchanged, reusing existing blob.`
            );
          }
        } catch (blobError) {
          console.warn(
            `Could not verify existing blob for ${filePathRelative}: ${blobError.message}. Creating new blob.`
          );
        }
      }

      if (!blobSha) {
        // If not reused, create new blob
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner,
          repo: repoName, // <--- Corrected: Using repoName here
          content: fileContent,
          encoding: "utf-8",
        });
        blobSha = blobData.sha;
        console.log(`Created new blob for: ${filePathRelative}`);
      }

      treeUpdates.push({
        path: filePathRelative,
        mode: "100644", // File mode (regular file)
        type: "blob",
        sha: blobSha,
      });
    }

    // Create a new tree with the new/modified blobs on top of the base tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo: repoName, // <--- Corrected: Using repoName here
      base_tree: baseTreeSha, // Base the new tree on the latest tree of the base branch
      tree: treeUpdates,
    });
    const newTreeSha = newTree.sha;
    console.log(`Created new tree with SHA: ${newTreeSha}`);

    // 7. Create a New Commit
    const commitMessage = `feat(AI): Implement User Story: ${userStory.userStoryTitle}\n\nThis commit contains AI-generated Salesforce code based on the user story.`;
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo: repoName, // <--- Corrected: Using repoName here
      message: commitMessage,
      tree: newTreeSha,
      parents: [baseBranchSha], // Parent is the latest commit on the base branch
    });
    const newCommitSha = newCommit.sha;
    console.log(`Created new commit with SHA: ${newCommitSha}`);

    // 8. Create or Update the new branch reference
    try {
      // Try to create the new branch
      await octokit.rest.git.createRef({
        owner,
        repo: repoName, // <--- Corrected: Using repoName here
        ref: `refs/heads/${newBranchName}`,
        sha: newCommitSha,
      });
      console.log(
        `Created new branch '${newBranchName}' pointing to commit ${newCommitSha}`
      );
    } catch (error) {
      if (error.status === 422) {
        // Reference already exists
        console.warn(
          `Branch '${newBranchName}' already exists. Attempting to update it.`
        );
        // If it exists, update it to the new commit SHA (force push logic)
        await octokit.rest.git.updateRef({
          owner,
          repo: repoName, // <--- Corrected: Using repoName here
          ref: `heads/${newBranchName}`,
          sha: newCommitSha,
          force: true, // Force update the branch to the new commit
        });
        console.log(
          `Updated existing branch '${newBranchName}' to commit ${newCommitSha}`
        );
      } else {
        throw error; // Re-throw other errors
      }
    }

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

    console.log(`Attempting to create PR:`);
    console.log(`Owner: ${owner}`);
    console.log(`Repo: ${repoName}`);
    console.log(`Head branch (source): ${newBranchName}`);
    console.log(`Base branch (target): ${actualBaseBranchName}`); // Use the robustly determined branch name here

    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo: repoName, // <--- Corrected: Using repoName here
      title: prTitle,
      head: newBranchName, // Our newly created feature branch
      base: actualBaseBranchName, // The determined base branch ('dev' or default)
      body: prBody,
      draft: true, // It will be a draft PR
    });
    console.log(`Pull Request created: ${pr.html_url}`);

    res.status(200).json({
      success: true,
      message: `Salesforce code generated, pushed to branch '${newBranchName}', and PR created: ${pr.html_url}`,
      githubBranch: newBranchName,
      githubRepoUrl: githubRepoUrl,
      prUrl: pr.html_url,
    });
  } catch (error) {
    console.error(
      "Error during Salesforce code generation and GitHub operations:",
      error
    );
    let errorMessage = `Failed to generate Salesforce code and push to GitHub: ${error.message}`;
    if (error.response?.data?.message) {
      errorMessage += ` (GitHub API Error: ${error.response.data.message})`;
    }
    res.status(500).json({ success: false, message: errorMessage });
  }
};

module.exports = {
  createUserStory,
  getUserStoriesByProjectId,
  updateUserStory,
  deleteUserStory,
  generateAiStoryContent,
  generateSalesforceCodeAndPush, // Export the new function
};
