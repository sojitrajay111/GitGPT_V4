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
    console.log(`[CodeAnalysis] Starting message processing for session: ${sessionId}, user: ${userId}`);
    
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required." });
    }

    // Verify session ownership
    console.log(`[CodeAnalysis] Verifying session ownership...`);
    const session = await CodeAnalysisSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this session." });
    }
    console.log(`[CodeAnalysis] Session ownership verified`);

    // Save user message
    console.log(`[CodeAnalysis] Saving user message...`);
    const userMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "user",
      text,
    });
    console.log(`[CodeAnalysis] User message saved with ID: ${userMessage._id}`);

    // Check if the query is Salesforce-related or repository-related
    console.log(`[CodeAnalysis] Checking if query is Salesforce-related...`);
    const isSalesforceRelated = text.toLowerCase().includes("salesforce") ||
      text.toLowerCase().includes("apex") ||
      text.toLowerCase().includes("soql") ||
      text.toLowerCase().includes("visualforce") ||
      text.toLowerCase().includes("lwc") ||
      text.toLowerCase().includes("lightning") ||
      text.toLowerCase().includes("sfdc") ||
      text.toLowerCase().includes("repository") ||
      text.toLowerCase().includes("github") ||
      text.toLowerCase().includes("analyze");

    if (!isSalesforceRelated) {
      console.log(`[CodeAnalysis] Query not Salesforce-related, returning early`);
      const sorryMessage = "Sorry, I can only assist with Salesforce-related questions or repository-specific code analysis.";
      await CodeAnalysisMessage.create({
        sessionId,
        sender: "system",
        text: sorryMessage,
        isError: false,
      });
      return res.status(400).json({
        success: false,
        message: sorryMessage,
      });
    }
    console.log(`[CodeAnalysis] Query is Salesforce-related, proceeding...`);

    // Fetch GitHub data for PAT and username
    console.log(`[CodeAnalysis] Fetching GitHub data for user: ${userId}`);
    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      console.log(`[CodeAnalysis] GitHub PAT not found for user: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found. Please authenticate with GitHub.",
      });
    }
    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername;
    console.log(`[CodeAnalysis] GitHub data found for user: ${githubUsername}`);

    // Extract owner and repo from githubRepoName
    console.log(`[CodeAnalysis] Extracting repo info from: ${session.githubRepoName}`);
    const [owner, repo] = session.githubRepoName.split("/");
    console.log(`[CodeAnalysis] Owner: ${owner}, Repo: ${repo}, Branch: ${session.selectedBranch}`);

    // Fetch repository contents
    console.log(`[CodeAnalysis] Fetching repository contents...`);
    const fetchedCodeFiles = await fetchRepoContents(
      owner,
      repo,
      session.selectedBranch,
      "",
      githubPAT,
      githubUsername
    );
    console.log(`[CodeAnalysis] Fetched ${fetchedCodeFiles.length} files from repository`);

    let currentBranchCodeContext = "";
    if (fetchedCodeFiles.length > 0) {
      // Filter for Salesforce-related files (Apex, Visualforce, LWC, etc.)
      console.log(`[CodeAnalysis] Filtering for Salesforce files...`);
      const salesforceFiles = fetchedCodeFiles.filter(file =>
        file.path.endsWith(".cls") || // Apex classes
        file.path.endsWith(".trigger") || // Apex triggers
        file.path.endsWith(".page") || // Visualforce pages
        file.path.endsWith(".component") || // Visualforce components
        file.path.includes("lwc/") || // Lightning Web Components
        file.path.endsWith(".xml") // Salesforce metadata
      );
      console.log(`[CodeAnalysis] Found ${salesforceFiles.length} Salesforce files`);

      if (salesforceFiles.length > 0) {
        currentBranchCodeContext = salesforceFiles
          .map((file) => `// File: ${file.path}\n${file.content}`)
          .join("\n\n---\n\n");
      } else {
        currentBranchCodeContext = `No Salesforce-related files found in branch: ${session.selectedBranch} of repository ${owner}/${repo}.`;
      }

      if (salesforceFiles.length > 20) {
        currentBranchCodeContext =
          `// Code context from ${salesforceFiles.length} Salesforce files. Summarizing key files:\n` +
          salesforceFiles
            .slice(0, 5)
            .map((f) => `// - ${f.path}`)
            .join("\n") +
          `\n\n// Example from ${salesforceFiles[0].path}:\n${salesforceFiles[0].content.substring(0, Math.min(200, salesforceFiles[0].content.length))}...`;
      }
    } else {
      currentBranchCodeContext = `No relevant code files found in branch: ${session.selectedBranch} of repository ${owner}/${repo}.`;
    }

    // Fetch previous messages for context
    console.log(`[CodeAnalysis] Fetching previous messages for context...`);
    const previousMessages = await CodeAnalysisMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10);
    previousMessages.reverse();
    console.log(`[CodeAnalysis] Found ${previousMessages.length} previous messages`);

    // Construct chat history for Gemini
    console.log(`[CodeAnalysis] Constructing chat history for Gemini...`);
    const geminiChatHistory = previousMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Ensure the first message in history is always from user
    // If the first message is from model, we need to handle this properly
    if (geminiChatHistory.length > 0 && geminiChatHistory[0].role === "model") {
      console.log(`[CodeAnalysis] First message is from model, removing it to comply with Gemini requirements`);
      geminiChatHistory.shift(); // Remove the first model message
    }

    // Additional validation: ensure we have alternating user/model messages
    // and start with user
    const validatedHistory = [];
    for (let i = 0; i < geminiChatHistory.length; i++) {
      const message = geminiChatHistory[i];
      if (i === 0 && message.role !== "user") {
        console.log(`[CodeAnalysis] Skipping first message with role '${message.role}' to ensure user starts`);
        continue;
      }
      if (i > 0) {
        const prevMessage = validatedHistory[validatedHistory.length - 1];
        if (prevMessage.role === message.role) {
          console.log(`[CodeAnalysis] Skipping consecutive message with same role '${message.role}'`);
          continue;
        }
      }
      validatedHistory.push(message);
    }
    
    console.log(`[CodeAnalysis] Final chat history has ${validatedHistory.length} messages`);
    if (validatedHistory.length > 0) {
      console.log(`[CodeAnalysis] First message role: ${validatedHistory[0].role}`);
    }

    // Construct system instruction for Salesforce-specific analysis
    console.log(`[CodeAnalysis] Constructing system instruction...`);
    const systemInstruction = `You are an expert AI assistant specialized in Salesforce development, including Apex, SOQL, Visualforce, Lightning Web Components (LWC), and Salesforce metadata. You are analyzing code from the GitHub repository '${session.githubRepoName}', Branch: '${session.selectedBranch}'.

Code Context:
${currentBranchCodeContext}

---
User request: ${text}
---

Instructions:
1. Only respond to Salesforce-related queries or questions about the repository's code. For non-Salesforce queries, return: "Sorry, I can only assist with Salesforce-related questions or repository-specific code analysis."
2. If the user requests code analysis (e.g., contains "analyze" or "review"):
   - Identify errors, bugs, or improvements in the provided Salesforce code.
   - Specify file paths and, if possible, line numbers.
   - Provide concrete solutions with complete code snippets in Markdown format, including the file path in a comment at the top (e.g., \`\`\`apex\n// force-app/main/default/classes/MyClass.cls\npublic class MyClass {}\n\`\`\`).
   - Focus on Salesforce best practices (e.g., bulkification in Apex, secure SOQL queries, LWC performance).
3. If generating new code:
   - Provide complete code blocks in Markdown with file paths (e.g., for Apex, Visualforce, or LWC).
   - Ensure code follows Salesforce conventions (e.g., proper naming, structure, and metadata).
4. If the code context is missing or insufficient, state this clearly and suggest how the user can provide more details.
5. Be concise and avoid speculative responses.
Ensure your response directly addresses the user's query within the Salesforce or repository context.`;

    console.log(`[CodeAnalysis] Starting Gemini chat...`);
    const chat = model.startChat({
      history: validatedHistory,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.5, // Lower for precise Salesforce code analysis
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
    });

    // Send the prompt to the AI
    console.log(`[CodeAnalysis] Sending message to Gemini...`);
    const result = await chat.sendMessage(systemInstruction);
    const aiTextResponse = result.response.text();
    console.log(`[CodeAnalysis] Received response from Gemini (${aiTextResponse.length} characters)`);

    // Check if AI response is irrelevant
    if (aiTextResponse.includes("Sorry, I can only assist")) {
      console.log(`[CodeAnalysis] AI response indicates irrelevant query`);
      await CodeAnalysisMessage.create({
        sessionId,
        sender: "system",
        text: aiTextResponse,
        isError: false,
      });
      return res.status(400).json({
        success: false,
        message: aiTextResponse,
      });
    }

    // Save AI message
    console.log(`[CodeAnalysis] Saving AI message...`);
    const aiMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "ai",
      text: aiTextResponse,
    });
    console.log(`[CodeAnalysis] AI message saved with ID: ${aiMessage._id}`);

    // Update session metadata
    console.log(`[CodeAnalysis] Updating session metadata...`);
    session.lastActivity = Date.now();
    if (
      !session.title ||
      (session.title.startsWith("Analysis:") && previousMessages.length <= 1)
    ) {
      const conciseTitle =
        text.length > 40 ? text.substring(0, 37) + "..." : text;
      session.title = `Salesforce Chat: ${conciseTitle}`;
    }
    await session.save();
    console.log(`[CodeAnalysis] Session metadata updated`);

    console.log(`[CodeAnalysis] Message processing completed successfully`);
    res.status(200).json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error sending code analysis message:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    if (error.response && error.response.promptFeedback) {
      console.error("Prompt Feedback:", error.response.promptFeedback);
    }
    
    // Log additional error details
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.status) {
      console.error("Error status:", error.status);
    }
    if (error.statusText) {
      console.error("Error statusText:", error.statusText);
    }
    
    let errorMessageToSave = "Error processing your Salesforce request.";
    if (error.message.includes("SAFETY")) {
      errorMessageToSave =
        "The response was blocked due to safety settings. Please rephrase your Salesforce-related request.";
    } else if (error.message.includes("quota")) {
      errorMessageToSave = "API quota exceeded. Please try again later.";
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessageToSave = "Network error occurred. Please check your connection and try again.";
    } else if (error.message.includes("authentication") || error.message.includes("unauthorized")) {
      errorMessageToSave = "Authentication error. Please check your GitHub credentials.";
    }

    await CodeAnalysisMessage.create({
      sessionId,
      sender: "system",
      text: errorMessageToSave,
      isError: true,
    });
    res.status(500).json({
      success: false,
      message: errorMessageToSave,
      error: error.message, // Include the actual error message for debugging
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