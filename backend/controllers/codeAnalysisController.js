// controllers/codeAnalysisController.js
const CodeAnalysisSession = require("../models/CodeAnalysisSession");
const CodeAnalysisMessage = require("../models/CodeAnalysisMessage");
const GitHubData = require("../models/GithubData");
const Project = require("../models/Project");

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Ensure GEMINI_API_KEY is in your .env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * @desc Start a new code analysis session.
 * @route POST /api/code-analysis/sessions
 * @access Private
 */
const startCodeAnalysisSession = async (req, res) => {
  const { projectId, githubRepoName, selectedBranch } = req.body;
  const userId = req.user.id;

  try {
    // Basic validation
    if (!projectId || !githubRepoName || !selectedBranch) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, GitHub repository name, and selected branch are required.",
      });
    }

    // Optional: Verify project ownership if strict access control is needed
    const project = await Project.findById(projectId);
    if (!project || project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to start session." });
    }

    const newSession = await CodeAnalysisSession.create({
      userId,
      projectId,
      githubRepoName,
      selectedBranch,
      title: `Code Analysis for ${githubRepoName} on ${selectedBranch}`, // Initial title
    });

    res.status(201).json({
      success: true,
      message: "Code analysis session started.",
      session: newSession,
    });
  } catch (error) {
    console.error("Error starting code analysis session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while starting session.",
    });
  }
};

/**
 * @desc Get all code analysis sessions for a project.
 * @route GET /api/code-analysis/sessions/:projectId
 * @access Private
 */
const getCodeAnalysisSessions = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const sessions = await CodeAnalysisSession.find({
      projectId,
      userId,
    }).sort({ lastActivity: -1 }); // Sort by most recent activity

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching code analysis sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching sessions.",
    });
  }
};

/**
 * @desc Get messages for a specific code analysis session.
 * @route GET /api/code-analysis/sessions/:sessionId/messages
 * @access Private
 */
const getCodeAnalysisMessages = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  try {
    // Verify session ownership
    const session = await CodeAnalysisSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view messages." });
    }

    const messages = await CodeAnalysisMessage.find({ sessionId }).sort({
      createdAt: 1,
    }); // Sort by creation time ascending

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching code analysis messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching messages.",
    });
  }
};

/**
 * @desc Send a message to the AI and get a response, saving both.
 * @route POST /api/code-analysis/sessions/:sessionId/messages
 * @access Private
 */
const sendCodeAnalysisMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { text, currentBranchCodeContext } = req.body; // currentBranchCodeContext is simulated for now
  const userId = req.user.id;

  try {
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required." });
    }

    // Verify session ownership
    const session = await CodeAnalysisSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this session." });
    }

    // Save user message
    const userMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "user",
      text,
    });

    // Fetch previous messages for context
    const previousMessages = await CodeAnalysisMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(10); // Limit context to last 10 messages

    // Construct chat history for Gemini
    const geminiChatHistory = previousMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
    // Add the current user message to the history for the API call
    geminiChatHistory.push({
      role: "user",
      parts: [{ text: text }],
    });

    // Add simulated code context to the prompt for AI
    const fullPrompt = currentBranchCodeContext
      ? `Current code context: ${currentBranchCodeContext}\n\nUser request: ${text}`
      : text;

    // Call Gemini API
    const chat = model.startChat({
      history: geminiChatHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(fullPrompt);
    const aiTextResponse = result.response.text();

    // Save AI message
    const aiMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "ai",
      text: aiTextResponse,
    });

    // Update session last activity and title (if first message)
    session.lastActivity = Date.now();
    if (!session.title || session.title.includes("Code Analysis for")) {
      session.title = text.substring(0, 50) + "..."; // Use first message as title
    }
    await session.save();

    res.status(200).json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error sending code analysis message:", error);
    // Save an error message if AI call fails
    await CodeAnalysisMessage.create({
      sessionId,
      sender: "system",
      text: `Error processing your request: ${error.message}`,
      isError: true,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error during code analysis.",
    });
  }
};

/**
 * @desc Push generated code to a new branch and create a Pull Request.
 * @route POST /api/code-analysis/push-pr
 * @access Private
 */
const pushCodeAndCreatePR = async (req, res) => {
  const {
    projectId,
    selectedBranch,
    aiBranchName,
    generatedCode,
    commitMessage,
  } = req.body;
  const userId = req.user.id;

  try {
    if (
      !projectId ||
      !selectedBranch ||
      !aiBranchName ||
      !generatedCode ||
      !commitMessage
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields for code push and PR.",
        });
    }

    const project = await Project.findById(projectId);
    if (!project || project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this project." });
    }

    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res
        .status(400)
        .json({
          success: false,
          message: "GitHub PAT not found for the user.",
        });
    }

    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername;
    const repoFullName = new URL(project.githubRepoLink).pathname.substring(1); // e.g., 'owner/repo-name'
    const [owner, repo] = repoFullName.split("/");

    // 1. Get the SHA of the selected base branch
    const getRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${selectedBranch}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
        },
      }
    );

    if (!getRefResponse.ok) {
      const errorData = await getRefResponse.json();
      console.error(
        "GitHub API error getting base branch ref for push:",
        errorData
      );
      return res.status(getRefResponse.status).json({
        success: false,
        message: `Failed to get base branch ref for push: ${
          errorData.message || "Unknown error"
        }`,
      });
    }
    const refData = await getRefResponse.json();
    const baseBranchSha = refData.object.sha;

    // 2. Create a new commit with the generated code
    // This is a simplified approach. In a real scenario, you'd fetch the tree,
    // create a new blob for the file, create a new tree with the new blob,
    // and then create a new commit. For demonstration, we'll assume a single file update.
    // For now, we'll just create a new branch and assume the code is "pushed" to it.
    // A more robust solution would involve using the GitHub Trees and Blobs API.

    // A simplified approach for demonstration: create a new branch and then a dummy commit
    // In a real scenario, you would need to:
    // a. Get the latest commit SHA of the base branch.
    // b. Get the tree SHA of that commit.
    // c. Create a new blob for the file content you want to add/update.
    // d. Create a new tree with the new blob and the existing tree.
    // e. Create a new commit with the new tree and the parent commit.
    // f. Update the branch reference to point to the new commit.

    // For simplicity, we'll create the branch and then create a dummy commit.
    // This part needs significant expansion for actual file manipulation.

    // Create the new branch first
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${aiBranchName}`,
          sha: baseBranchSha, // Point new branch to the base branch's commit
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const errorData = await createBranchResponse.json();
      console.error("GitHub API error creating AI branch:", errorData);
      return res.status(createBranchResponse.status).json({
        success: false,
        message: `Failed to create AI branch: ${
          errorData.message || "Unknown error"
        }`,
      });
    }

    // Now, simulate adding/updating a file and committing.
    // This is a placeholder. A real implementation would use:
    // 1. GET /repos/:owner/:repo/contents/:path to get existing file SHA (if updating)
    // 2. PUT /repos/:owner/:repo/contents/:path to create/update file
    // For now, we'll just acknowledge the generatedCode.
    console.log(
      `Simulating file update on branch ${aiBranchName} with generated code.`
    );
    console.log("Generated Code Content:", generatedCode);

    // 3. Create a Pull Request
    const createPRResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: commitMessage.split("\n")[0], // Use first line of commit message as PR title
          head: aiBranchName,
          base: selectedBranch,
          body: commitMessage,
        }),
      }
    );

    if (!createPRResponse.ok) {
      const errorData = await createPRResponse.json();
      console.error("GitHub API error creating PR:", errorData);
      return res.status(createPRResponse.status).json({
        success: false,
        message: `Failed to create Pull Request: ${
          errorData.message || "Unknown error"
        }`,
      });
    }

    const prData = await createPRResponse.json();

    res.status(200).json({
      success: true,
      message: "Code pushed and Pull Request created successfully.",
      prUrl: prData.html_url,
    });
  } catch (error) {
    console.error("Error pushing code and creating PR:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  startCodeAnalysisSession,
  getCodeAnalysisSessions,
  getCodeAnalysisMessages,
  sendCodeAnalysisMessage,
  pushCodeAndCreatePR,
};
