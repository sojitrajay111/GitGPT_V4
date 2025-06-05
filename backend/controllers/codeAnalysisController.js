// controllers/codeAnalysisController.js
const CodeAnalysisSession = require("../models/CodeAnalysisSession");
const CodeAnalysisMessage = require("../models/CodeAnalysisMessage");
const GitHubData = require("../models/GithubData");
const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator"); // Import ProjectCollaborator

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Ensure GEMINI_API_KEY is in your .env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Corrected model name if it was gemini-2.0-flash

/**
 * Helper function to fetch repository contents recursively from GitHub.
 * It fetches content for common code and text file types.
 * @param {string} owner - GitHub repository owner.
 * @param {string} repo - GitHub repository name.
 * @param {string} branch - The branch to fetch contents from.
 * @param {string} path - The current path within the repository (for recursion).
 * @param {string} githubPAT - Personal Access Token for GitHub API authentication.
 * @param {string} githubUsername - GitHub username for User-Agent header.
 * @param {Array<Object>} fetchedFiles - Accumulator for fetched file objects ({ path, content }).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of fetched file objects.
 */
async function fetchRepoContents(
  owner,
  repo,
  branch,
  path = "",
  githubPAT,
  githubUsername,
  fetchedFiles = []
) {
  // Construct the URL for fetching repository contents
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${githubPAT}`,
        "User-Agent": githubUsername,
        // Accept header to get raw content directly for files, or JSON for directories
        // For fetching directory listings, JSON is preferred. Raw is for file content.
        // The logic below handles fetching raw content via download_url for files.
        Accept: "application/vnd.github.v3+json", // Request JSON for directory listing
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Path not found on GitHub: ${path} in ${owner}/${repo}`);
        return fetchedFiles;
      }
      // Try to parse error as JSON, otherwise use statusText
      let errorData = { message: response.statusText };
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      throw new Error(
        `GitHub API error fetching contents for ${path}: ${
          errorData.message || response.statusText
        }`
      );
    }

    const contents = await response.json();

    // Check if contents is an array (directory) or an object (single file)
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
          item.name.endsWith(".xml") ||
          item.name.endsWith(".html") ||
          item.name.endsWith(".css") ||
          item.name.endsWith(".scss") ||
          item.name.endsWith(".md") ||
          item.name.endsWith(".txt") ||
          item.name.endsWith(".yml") ||
          item.name.endsWith(".yaml") ||
          item.name.endsWith(".sh") ||
          item.name.endsWith(".dockerfile") ||
          item.name.startsWith("."); // Include dotfiles

        if (item.type === "file" && isCodeOrTextFile && item.download_url) {
          try {
            const fileContentResponse = await fetch(item.download_url, {
              headers: {
                Authorization: `token ${githubPAT}`,
                "User-Agent": githubUsername,
              },
            });
            if (fileContentResponse.ok) {
              const fileContent = await fileContentResponse.text();
              fetchedFiles.push({ path: item.path, content: fileContent });
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
            owner,
            repo,
            branch,
            item.path,
            githubPAT,
            githubUsername,
            fetchedFiles
          );
        }
      }
    } else if (contents && contents.type === "file" && contents.download_url) {
      // Directly fetched a file
      const isCodeOrTextFile =
        contents.name.endsWith(".js") ||
        contents.name.endsWith(".ts") ||
        // ... (include all extensions as above)
        contents.name.endsWith(".txt");
      if (isCodeOrTextFile) {
        try {
          const fileContentResponse = await fetch(contents.download_url, {
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
            },
          });
          if (fileContentResponse.ok) {
            const fileContent = await fileContentResponse.text();
            fetchedFiles.push({ path: contents.path, content: fileContent });
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
    console.error(
      `Error in fetchRepoContents for ${path} in ${owner}/${repo}:`,
      error.message
    );
    // Do not re-throw, allow to return successfully fetched files so far
  }
  return fetchedFiles;
}

/**
 * Helper function to check if a user is authorized for code analysis on a project.
 * A user is authorized if they are the project owner or a collaborator with "Code analysis" permission.
 * @param {string} userId - The MongoDB _id of the user to check (from req.user.id).
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<boolean>} True if authorized, false otherwise.
 */
const isUserAuthorizedForCodeAnalysis = async (userId, projectId) => {
  console.log(
    `[Auth Check] Initiating authorization check for userId: ${userId}, projectId: ${projectId}`
  );

  const project = await Project.findById(projectId);
  if (!project) {
    console.log(
      `[Auth Check] Project not found for ID: ${projectId}. Returning false.`
    );
    return false;
  }
  console.log(
    `[Auth Check] Project found: ${project.projectName} (Owner: ${project.userId})`
  );

  // Check if the user is the project owner
  if (project.userId.toString() === userId) {
    console.log(
      `[Auth Check] User ${userId} is project owner for project ${projectId}. Authorized.`
    );
    return true;
  }
  console.log(`[Auth Check] User ${userId} is NOT the project owner.`);

  // If not owner, check if the user is an accepted collaborator with "Code analysis" permission
  const projectCollaboratorEntry = await ProjectCollaborator.findOne({
    project_id: projectId,
  });
  if (projectCollaboratorEntry) {
    console.log(
      `[Auth Check] ProjectCollaborator entry found for project ${projectId}. Collaborators: ${JSON.stringify(
        projectCollaboratorEntry.collaborators.map((c) => ({
          username: c.username,
          githubId: c.githubId,
          status: c.status,
          permissions: c.permissions,
        }))
      )}`
    );

    // Get the GitHub ID of the requesting user
    const userGithubData = await GitHubData.findOne({ userId });
    if (!userGithubData) {
      console.log(
        `[Auth Check] GitHubData not found for user ${userId}. Cannot verify collaborator status. Returning false.`
      );
      return false;
    }
    const requestingUserGithubId = userGithubData.githubId;
    console.log(
      `[Auth Check] Requesting user ${userId} has GitHub ID: ${requestingUserGithubId}`
    );

    const collaborator = projectCollaboratorEntry.collaborators.find(
      (collab) =>
        collab.githubId === requestingUserGithubId && // Match by GitHub ID
        collab.status === "accepted" &&
        collab.permissions.includes("Code analysis")
    );

    if (collaborator) {
      console.log(
        `[Auth Check] User ${userId} (GitHub ID: ${requestingUserGithubId}) is an accepted collaborator with 'Code analysis' permission for project ${projectId}. Authorized.`
      );
      return true;
    } else {
      console.log(
        `[Auth Check] User ${userId} (GitHub ID: ${requestingUserGithubId}) is NOT an authorized collaborator for project ${projectId}.`
      );
      console.log(`[Auth Check] Reasons for not being authorized:`);
      const foundCollab = projectCollaboratorEntry.collaborators.find(
        (c) => c.githubId === requestingUserGithubId
      );
      if (!foundCollab) {
        console.log(
          `  - Collaborator with GitHub ID ${requestingUserGithubId} not found in project's collaborator list.`
        );
      } else {
        if (foundCollab.status !== "accepted") {
          console.log(
            `  - Collaborator status is '${foundCollab.status}', not 'accepted'.`
          );
        }
        if (!foundCollab.permissions.includes("Code analysis")) {
          console.log(
            `  - Collaborator does not have 'Code analysis' permission. Current permissions: ${JSON.stringify(
              foundCollab.permissions
            )}`
          );
        }
      }
    }
  } else {
    console.log(
      `[Auth Check] No ProjectCollaborator entry found for project ${projectId}. Returning false.`
    );
  }

  return false;
};

/**
 * @desc Start a new code analysis session.
 * @route POST /api/code-analysis/sessions
 * @access Private
 */
const startCodeAnalysisSession = async (req, res) => {
  const { projectId, githubRepoName, selectedBranch } = req.body;
  const userId = req.user.id; // This is the MongoDB _id of the logged-in user

  try {
    // Basic validation
    if (!projectId || !githubRepoName || !selectedBranch) {
      return res.status(400).json({
        success: false,
        message:
          "Project ID, GitHub repository name, and selected branch are required.",
      });
    }

    // Authorization check: User must be project owner or an authorized collaborator
    const authorized = await isUserAuthorizedForCodeAnalysis(userId, projectId);
    if (!authorized) {
      console.warn(
        `User ${userId} attempted to start session for project ${projectId} but is not authorized.`
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to start session for this project.",
      });
    }

    const newSession = await CodeAnalysisSession.create({
      userId,
      projectId,
      githubRepoName,
      selectedBranch,
      title: `Analysis: ${githubRepoName.split("/")[1]} (${selectedBranch})`, // Initial title
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
    // Sessions are filtered by userId on the frontend, but here we ensure
    // that only sessions belonging to the requesting user for that project are returned.
    const sessions = await CodeAnalysisSession.find({
      projectId,
      userId, // Crucial: Filter by the logged-in user's ID
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
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages for this session.",
      });
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
  const { text } = req.body;
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

    // Fetch GitHub data for PAT and username
    // This will fetch the PAT of the *currently authenticated user* (developer or manager)
    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub PAT not found for the user. Please authenticate with GitHub.",
      });
    }
    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername;

    // Extract owner and repo from githubRepoName (e.g., "owner/repo")
    const [owner, repo] = session.githubRepoName.split("/");

    // Fetch actual code context from the selected branch
    const fetchedCodeFiles = await fetchRepoContents(
      owner,
      repo,
      session.selectedBranch,
      "", // Start from the root of the repository
      githubPAT,
      githubUsername
    );

    let currentBranchCodeContext = "";
    if (fetchedCodeFiles.length > 0) {
      currentBranchCodeContext = fetchedCodeFiles
        .map((file) => `// File: ${file.path}\n${file.content}`)
        .join("\n\n---\n\n"); // Separator for clarity
    } else {
      currentBranchCodeContext = `No relevant code files found in branch: ${session.selectedBranch} of repository ${owner}/${repo}. Or, the repository might be empty or files are not of recognizable types.`;
    }
    if (fetchedCodeFiles.length > 20) {
      // Heuristic: if too many files, summarize
      currentBranchCodeContext =
        `// Code context from ${fetchedCodeFiles.length} files. Due to length, only a summary is provided unless specific files are requested. Key files included are: \n` +
        fetchedCodeFiles
          .slice(0, 5)
          .map((f) => `// - ${f.path}`)
          .join("\n") +
        `\n\n // Example from ${
          fetchedCodeFiles[0].path
        }:\n ${fetchedCodeFiles[0].content.substring(
          0,
          Math.min(200, fetchedCodeFiles[0].content.length)
        )}...`;
    }

    // Fetch previous messages for context
    const previousMessages = await CodeAnalysisMessage.find({ sessionId })
      .sort({ createdAt: -1 }) // Get most recent messages first
      .limit(10); // Limit context
    previousMessages.reverse(); // Then reverse to maintain chronological order for Gemini

    // Construct chat history for Gemini
    const geminiChatHistory = previousMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model", // 'model' for AI responses
      parts: [{ text: msg.text }],
    }));
    // Note: The current user message 'text' will be sent as the new prompt to sendMessage,
    // so it's typically not added again to 'history' when calling model.startChat if you're sending it with chat.sendMessage(text)

    const systemInstruction = `You are an expert AI assistant specialized in code analysis, code generation, and GitHub operations.
Current GitHub repository: '${session.githubRepoName}', Branch: '${session.selectedBranch}'.
Code Context:
${currentBranchCodeContext}

---
User request: ${text}
---

Instructions:
1.  Analyze the request in conjunction with the provided code context.
2.  If generating code or suggesting modifications:
    * Provide ONLY the complete code block(s) in Markdown format.
    * For each code block, **you MUST include a comment at the very top specifying the full file path** it belongs to (e.g., \`\`\`javascript\n// path/to/your/file.js\nconsole.log('hello');\n\`\`\` or \`\`\`python\n# path/to/your/script.py\nprint('hello')\n\`\`\`).
    * If creating a new file, indicate a plausible path.
    * If the changes span multiple files, provide separate, clearly marked code blocks for each.
3.  If analyzing code: Clearly list errors, bugs, or areas for improvement with specific file paths and line numbers if possible, and suggest concrete solutions.
4.  Be concise and direct. If the code context is missing or insufficient, state that clearly.
5.  If the user asks for actions beyond your capabilities (e.g., deploying the code), politely state your limitations.
Ensure your response is comprehensive and directly addresses the user's query.`;

    const chat = model.startChat({
      history: geminiChatHistory, // Pass the constructed history
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.6, // Slightly lower for more factual/code-focused responses
      },
      safetySettings: [
        // Adjust safety settings if needed, be mindful of implications
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
    });

    // Send the new user message along with the structured prompt
    const result = await chat.sendMessage(systemInstruction); // Pass the full prompt here
    const aiTextResponse = result.response.text();

    // Save AI message
    const aiMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "ai",
      text: aiTextResponse,
    });

    // Update session last activity and title (if first message and title is default)
    session.lastActivity = Date.now();
    if (
      !session.title ||
      (session.title.startsWith("Analysis:") && previousMessages.length <= 1)
    ) {
      // Update title if it's the default and very few messages
      const conciseTitle =
        text.length > 40 ? text.substring(0, 37) + "..." : text;
      session.title = `Chat: ${conciseTitle}`;
    }
    await session.save();

    res.status(200).json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error sending code analysis message:", error.message);
    if (error.response && error.response.promptFeedback) {
      console.error("Prompt Feedback:", error.response.promptFeedback);
    }
    let errorMessageToSave = `Error processing your request.`;
    if (error.message.includes("SAFETY")) {
      errorMessageToSave =
        "The response was blocked due to safety settings. Please rephrase your request or check the content guidelines.";
    } else if (error.message.includes("quota")) {
      errorMessageToSave = "API quota exceeded. Please try again later.";
    }

    await CodeAnalysisMessage.create({
      sessionId,
      sender: "system",
      text: errorMessageToSave,
      isError: true,
    });
    res.status(500).json({
      success: false,
      message:
        errorMessageToSave || "Internal server error during code analysis.",
    });
  }
};

/**
 * @desc Delete a code analysis session and its messages.
 * @route DELETE /api/code-analysis/sessions/:sessionId
 * @access Private
 */
const deleteCodeAnalysisSession = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  try {
    const session = await CodeAnalysisSession.findById(sessionId);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }

    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this session.",
      });
    }

    // Delete all messages associated with the session
    await CodeAnalysisMessage.deleteMany({ sessionId });

    // Delete the session itself
    await CodeAnalysisSession.findByIdAndDelete(sessionId);

    res.status(200).json({
      success: true,
      message: "Session and associated messages deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting code analysis session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting session.",
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
    selectedBranch, // This is the base branch for the PR
    aiBranchName, // This is the new branch to be created for the AI's changes
    generatedCode, // This is the code content generated by the AI
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
      return res.status(400).json({
        success: false,
        message: "Missing required fields for code push and PR.",
      });
    }

    // Authorization check: User must be project owner or an authorized collaborator
    const authorized = await isUserAuthorizedForCodeAnalysis(userId, projectId);
    if (!authorized) {
      console.warn(
        `User ${userId} attempted to push code/create PR for project ${projectId} but is not authorized.`
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to push code or create PR for this project.",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      // Redundant check, but good for clarity if auth check is bypassed
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found for the user.",
      });
    }

    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername; // User's GitHub username
    const repoFullName = new URL(project.githubRepoLink).pathname
      .substring(1)
      .replace(/\.git$/, "");
    const [owner, repo] = repoFullName.split("/");

    // 1. Get the SHA of the selected base branch (latest commit)
    const getRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${selectedBranch}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername, // Use the user's GitHub username as User-Agent
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getRefResponse.ok) {
      const errorData = await getRefResponse
        .json()
        .catch(() => ({ message: getRefResponse.statusText }));
      console.error(
        "GitHub API error getting base branch ref for push:",
        errorData
      );
      return res.status(getRefResponse.status).json({
        success: false,
        message: `Failed to get base branch ref ('${selectedBranch}'): ${
          errorData.message || "Unknown error"
        }. Ensure the branch exists and the token has permissions.`,
      });
    }
    const refData = await getRefResponse.json();
    const baseCommitSha = refData.object.sha;

    // 2. Get the Tree SHA of the base commit
    const getCommitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getCommitResponse.ok) {
      const errorData = await getCommitResponse
        .json()
        .catch(() => ({ message: getCommitResponse.statusText }));
      console.error("GitHub API error getting base commit tree:", errorData);
      return res.status(getCommitResponse.status).json({
        success: false,
        message: `Failed to get base commit tree: ${
          errorData.message || "Unknown error"
        }`,
      });
    }
    const commitData = await getCommitResponse.json();
    const baseTreeSha = commitData.tree.sha;

    // Parse generatedCode to handle multiple files.
    // The regex should match comments like // path/to/file.js or # path/to/script.py
    const codeBlocks = [];
    const regex = /```(?:\w+)?\n(?:\/\/|#)\s*([^\n]+)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(generatedCode)) !== null) {
      codeBlocks.push({
        filePath: match[1].trim(),
        content: match[2].trim(),
      });
    }

    if (codeBlocks.length === 0) {
      // Fallback if the AI didn't provide the expected comment format
      console.warn(
        "AI response did not contain structured code blocks with file paths. Attempting to push as a single file."
      );
      codeBlocks.push({
        filePath: `ai_generated_changes/response_${Date.now()
          .toString()
          .slice(-6)}.txt`, // Default path
        content: generatedCode,
      });
    }

    const treeUpdates = [];
    for (const block of codeBlocks) {
      if (!block.filePath || !block.content) {
        console.warn(
          "Skipping a code block due to missing filePath or content:",
          block
        );
        continue;
      }
      const createBlobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${githubPAT}`,
            "User-Agent": githubUsername,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            content: block.content,
            encoding: "utf-8",
          }),
        }
      );

      if (!createBlobResponse.ok) {
        const errorData = await createBlobResponse
          .json()
          .catch(() => ({ message: createBlobResponse.statusText }));
        console.error(
          "GitHub API error creating blob for file:",
          block.filePath,
          errorData
        );
        return res.status(createBlobResponse.status).json({
          success: false,
          message: `Failed to create blob for ${block.filePath}: ${
            errorData.message || "Unknown error"
          }`,
        });
      }
      const blobData = await createBlobResponse.json();
      treeUpdates.push({
        path: block.filePath,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      });
    }

    if (treeUpdates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid code blocks with file paths were found in the AI's response to commit.",
      });
    }

    // 4. Create a New Tree with the new blobs
    const createTreeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeUpdates,
        }),
      }
    );

    if (!createTreeResponse.ok) {
      const errorData = await createTreeResponse
        .json()
        .catch(() => ({ message: createTreeResponse.statusText }));
      console.error("GitHub API error creating tree:", errorData);
      return res.status(createTreeResponse.status).json({
        success: false,
        message: `Failed to create new tree: ${
          errorData.message || "Unknown error"
        }`,
      });
    }
    const treeData = await createTreeResponse.json();
    const newTreeSha = treeData.sha;

    // 5. Create a New Commit
    const createNewCommitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [baseCommitSha],
        }),
      }
    );

    if (!createNewCommitResponse.ok) {
      const errorData = await createNewCommitResponse
        .json()
        .catch(() => ({ message: createNewCommitResponse.statusText }));
      console.error("GitHub API error creating new commit:", errorData);
      return res.status(createNewCommitResponse.status).json({
        success: false,
        message: `Failed to create new commit: ${
          errorData.message || "Unknown error"
        }`,
      });
    }
    const newCommitData = await createNewCommitResponse.json();
    const newCommitSha = newCommitData.sha;

    // 6. Create the AI Branch Reference to point to the new commit
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
          ref: `refs/heads/${aiBranchName}`,
          sha: newCommitSha,
        }),
      }
    );

    // If branch creation failed (e.g. 422 if it exists), we typically want to stop or handle it.
    // Forcing an update to an existing branch can be dangerous if not intended.
    // The current logic will attempt a PATCH if it's 422.
    if (!createBranchResponse.ok) {
      if (createBranchResponse.status === 422) {
        // Ref already exists
        console.warn(
          `Branch ${aiBranchName} already exists. Attempting to update (force push).`
        );
        const updateRefResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${aiBranchName}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              sha: newCommitSha,
              force: true, // Force update the branch to the new commit
            }),
          }
        );
        if (!updateRefResponse.ok) {
          const errorData = await updateRefResponse
            .json()
            .catch(() => ({ message: updateRefResponse.statusText }));
          console.error("GitHub API error updating AI branch ref:", errorData);
          return res.status(updateRefResponse.status).json({
            success: false,
            message: `Failed to update existing AI branch '${aiBranchName}': ${
              errorData.message || "Unknown error"
            }. It may have diverged.`,
          });
        }
        console.log(`Branch ${aiBranchName} updated to new commit.`);
      } else {
        const errorData = await createBranchResponse
          .json()
          .catch(() => ({ message: createBranchResponse.statusText }));
        console.error("GitHub API error creating AI branch:", errorData);
        return res.status(createBranchResponse.status).json({
          success: false,
          message: `Failed to create AI branch '${aiBranchName}': ${
            errorData.message || "Unknown error"
          }`,
        });
      }
    } else {
      console.log(`Branch ${aiBranchName} created successfully.`);
    }

    // 7. Create a Pull Request
    const createPRResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title: `AI Changes: ${commitMessage.split("\n")[0]}`,
          head: aiBranchName,
          base: selectedBranch,
          body: `AI-generated changes based on the following prompt:\n\n> ${
            commitMessage.split("\n\nPrompt: ")[1]?.split("\nResponse:")[0] ||
            "User prompt"
          }\n\nBranch '${aiBranchName}' includes the proposed modifications. Please review carefully.`,
          maintainer_can_modify: true,
        }),
      }
    );

    if (!createPRResponse.ok) {
      const errorData = await createPRResponse
        .json()
        .catch(() => ({ message: createPRResponse.statusText }));
      console.error("GitHub API error creating PR:", errorData);
      // Check for specific error: PR already exists
      if (
        errorData.errors &&
        errorData.errors.some(
          (e) =>
            e.message && e.message.includes("A pull request already exists")
        )
      ) {
        return res.status(422).json({
          success: false,
          message: `A pull request already exists for ${aiBranchName}.`,
          // Potentially include link to existing PR if API provides it, or instruct user to check GitHub.
        });
      }
      return res.status(createPRResponse.status).json({
        success: false,
        message: `Failed to create Pull Request from '${aiBranchName}' to '${selectedBranch}': ${
          errorData.message || "Unknown error"
        }`,
      });
    }

    const prData = await createPRResponse.json();

    res.status(200).json({
      success: true,
      message:
        "Code pushed to new branch and Pull Request created successfully.",
      prUrl: prData.html_url,
      branchName: aiBranchName,
    });
  } catch (error) {
    console.error("Error in pushCodeAndCreatePR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during push and PR creation.",
    });
  }
};

module.exports = {
  startCodeAnalysisSession,
  getCodeAnalysisSessions,
  getCodeAnalysisMessages,
  sendCodeAnalysisMessage,
  pushCodeAndCreatePR,
  deleteCodeAnalysisSession, // Export the new function
};
