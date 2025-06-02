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
        Accept: "application/vnd.github.v3.raw",
      },
    });

    if (!response.ok) {
      // Handle cases where the path might not exist or other API errors
      if (response.status === 404) {
        console.warn(`Path not found on GitHub: ${path}`);
        return fetchedFiles; // Return current fetched files if path not found
      }
      const errorData = await response.json();
      throw new Error(
        `GitHub API error fetching contents for ${path}: ${
          errorData.message || response.statusText
        }`
      );
    }

    const contents = await response.json();

    if (Array.isArray(contents)) {
      // If it's a directory (API returns an array of contents)
      for (const item of contents) {
        // Define common code/text file extensions to fetch
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
          item.name.endsWith(".txt");

        if (item.type === "file" && isCodeOrTextFile) {
          // Fetch raw content for files
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
        } else if (item.type === "dir") {
          // Recursively call for subdirectories
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
    } else if (contents.type === "file") {
      // If path points directly to a single file
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
        contents.name.endsWith(".txt");
      if (isCodeOrTextFile) {
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
            `Failed to fetch raw content for ${contents.path}: ${fileContentResponse.statusText}`
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error in fetchRepoContents for ${path}:`, error.message);
  }
  return fetchedFiles;
}

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
    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found for the user.",
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
      // Format the fetched code for the AI prompt
      currentBranchCodeContext = fetchedCodeFiles
        .map((file) => `// File: ${file.path}\n${file.content}`)
        .join("\n\n");
    } else {
      currentBranchCodeContext = `No relevant code files found in branch: ${session.selectedBranch}.`;
    }

    // Fetch previous messages for context
    const previousMessages = await CodeAnalysisMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(10); // Limit context to last 10 messages to manage token usage

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

    // Combine code context with the user's prompt for AI
    // Instruct the AI on how to respond if it generates code
    const fullPrompt = `You are an AI assistant specialized in code analysis and generation.
Current code context from the GitHub repository '${session.githubRepoName}' on branch '${session.selectedBranch}':
${currentBranchCodeContext}

User request: ${text}

Based on the provided code context and the user's request, please provide a detailed analysis or generate code changes.
If you are analyzing code, clearly list any errors, bugs, or areas for improvement, and suggest concrete solutions.
If you are generating or modifying code, provide ONLY the code block(s) within markdown, and for each code block, clearly indicate the file path it belongs to using a comment at the top of the block (e.g., \`\`\`javascript\n// path/to/file.js\nconsole.log('hello');\n\`\`\` or \`\`\`python\n# path/to/script.py\nprint('hello')\n\`\`\` ). If you are providing multiple code blocks for different files, separate them clearly.
Ensure your response is comprehensive and directly addresses the user's query, considering the full context of the project.`;

    // Call Gemini API
    const chat = model.startChat({
      history: geminiChatHistory,
      generationConfig: {
        maxOutputTokens: 2048, // Increased token limit for potentially larger code analysis/generation
        temperature: 0.7, // Adjust temperature for creativity vs. focus
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

    const project = await Project.findById(projectId);
    if (!project || project.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this project." });
    }

    const githubData = await GitHubData.findOne({ userId });
    if (!githubData || !githubData.githubPAT) {
      return res.status(400).json({
        success: false,
        message: "GitHub PAT not found for the user.",
      });
    }

    const githubPAT = githubData.githubPAT;
    const githubUsername = githubData.githubUsername;
    const repoFullName = new URL(project.githubRepoLink).pathname.substring(1); // e.g., 'owner/repo-name'
    const [owner, repo] = repoFullName.split("/");

    // 1. Get the SHA of the selected base branch (latest commit)
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
    const baseCommitSha = refData.object.sha; // SHA of the latest commit on the base branch

    // 2. Get the Tree SHA of the base commit
    const getCommitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
      {
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
        },
      }
    );

    if (!getCommitResponse.ok) {
      const errorData = await getCommitResponse.json();
      console.error("GitHub API error getting base commit tree:", errorData);
      return res.status(getCommitResponse.status).json({
        success: false,
        message: `Failed to get base commit tree: ${
          errorData.message || "Unknown error"
        }`,
      });
    }
    const commitData = await getCommitResponse.json();
    const baseTreeSha = commitData.tree.sha; // SHA of the tree associated with the base commit

    // Parse generatedCode to handle multiple files or specific file updates
    // The AI is instructed to provide file paths in comments within markdown blocks.
    const codeBlocks = [];
    const regex = /```(?:\w+)?\n\/\/ ([^\n]+)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(generatedCode)) !== null) {
      codeBlocks.push({
        filePath: match[1].trim(), // e.g., 'path/to/file.js'
        content: match[2].trim(),
      });
    }

    if (codeBlocks.length === 0) {
      // If no structured code blocks are found, treat the entire generatedCode as a single file
      // and place it in a generic AI-generated file.
      codeBlocks.push({
        filePath: `ai_generated_code/ai_changes_${Date.now()
          .toString()
          .slice(-6)}.js`,
        content: generatedCode,
      });
    }

    const treeUpdates = [];
    for (const block of codeBlocks) {
      // 3. Create a Blob for each generated code block
      const createBlobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${githubPAT}`,
            "User-Agent": githubUsername,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: block.content,
            encoding: "utf-8",
          }),
        }
      );

      if (!createBlobResponse.ok) {
        const errorData = await createBlobResponse.json();
        console.error("GitHub API error creating blob:", errorData);
        return res.status(createBlobResponse.status).json({
          success: false,
          message: `Failed to create blob for generated code: ${
            errorData.message || "Unknown error"
          }`,
        });
      }
      const blobData = await createBlobResponse.json();
      const newBlobSha = blobData.sha;

      treeUpdates.push({
        path: block.filePath,
        mode: "100644", // File mode for a regular file
        type: "blob",
        sha: newBlobSha,
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
        },
        body: JSON.stringify({
          base_tree: baseTreeSha, // Inherit from the base branch's tree
          tree: treeUpdates,
        }),
      }
    );

    if (!createTreeResponse.ok) {
      const errorData = await createTreeResponse.json();
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
    // This commit points to the new tree and has the base branch's latest commit as its parent.
    const createNewCommitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubPAT}`,
          "User-Agent": githubUsername,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [baseCommitSha], // Parent is the latest commit of the base branch
        }),
      }
    );

    if (!createNewCommitResponse.ok) {
      const errorData = await createNewCommitResponse.json();
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

    // 6. Create or Update the AI Branch Reference to point to the new commit
    // First, try to create the branch. If it already exists, update it.
    let createBranchResponse = await fetch(
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
          sha: newCommitSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      // If branch creation failed, it might be because the branch already exists.
      // Try to update the branch reference instead.
      if (createBranchResponse.status === 422) {
        // Unprocessable Entity, often means ref already exists
        console.warn(
          `Branch ${aiBranchName} already exists. Attempting to update.`
        );
        const updateRefResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${aiBranchName}`,
          {
            method: "PATCH", // Use PATCH to update an existing reference
            headers: {
              Authorization: `token ${githubPAT}`,
              "User-Agent": githubUsername,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sha: newCommitSha,
              force: true, // Force update to move the branch head
            }),
          }
        );

        if (!updateRefResponse.ok) {
          const errorData = await updateRefResponse.json();
          console.error("GitHub API error updating AI branch ref:", errorData);
          return res.status(updateRefResponse.status).json({
            success: false,
            message: `Failed to update AI branch ref: ${
              errorData.message || "Unknown error"
            }`,
          });
        }
      } else {
        const errorData = await createBranchResponse.json();
        console.error("GitHub API error creating AI branch:", errorData);
        return res.status(createBranchResponse.status).json({
          success: false,
          message: `Failed to create AI branch: ${
            errorData.message || "Unknown error"
          }`,
        });
      }
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
        },
        body: JSON.stringify({
          title: commitMessage.split("\n")[0], // Use first line of commit message as PR title
          head: aiBranchName, // The newly created/updated AI branch
          base: selectedBranch, // The original branch
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
