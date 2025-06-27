const CodeAnalysisSession = require("../models/CodeAnalysisSession");
const CodeAnalysisMessage = require("../models/CodeAnalysisMessage");
const GitHubData = require("../models/GithubData");
const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");
const Configuration = require("../models/Configuration");

/**
 * Recursively fetches code/text files from a GitHub repository branch using the GitHub API.
 * Filters for code and text file types, including Salesforce-specific extensions.
 * @param {string} owner - GitHub repository owner
 * @param {string} repo - GitHub repository name
 * @param {string} branch - Branch name
 * @param {string} [path] - Path within the repository (default: "")
 * @param {string} githubPAT - GitHub Personal Access Token
 * @param {string} githubUsername - GitHub username
 * @param {Array} [fetchedFiles] - Accumulator for fetched files (default: [])
 * @returns {Promise<Array<{path: string, content: string}>>} Array of file objects with path and content
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
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${githubPAT}`,
        "User-Agent": githubUsername,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Path not found on GitHub: ${path} in ${owner}/${repo}`);
        return fetchedFiles;
      }
      let errorData = { message: response.statusText };
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(
        `GitHub API error fetching contents for ${path}: ${
          errorData.message || response.statusText
        }`
      );
    }
    const contents = await response.json();
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
          item.name.endsWith(".cls") || // Salesforce Apex
          item.name.endsWith(".trigger") || // Salesforce Trigger
          item.name.endsWith(".page") || // Visualforce
          item.name.endsWith(".component") || // Visualforce Component
          item.name.startsWith(".") ||
          item.name === '.gitkeep';
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
      const isCodeOrTextFile =
        contents.name.endsWith(".js") ||
        contents.name.endsWith(".ts") ||
        contents.name.endsWith(".cls") ||
        contents.name.endsWith(".trigger") ||
        contents.name.endsWith(".page") ||
        contents.name.endsWith(".component") ||
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
    // console.log('Fetched files:', fetchedFiles.map(f => f.path));
  } catch (error) {
    console.error(
      `Error in fetchRepoContents for ${path} in ${owner}/${repo}:`,
      error.message
    );
  }
  return fetchedFiles;
}

/**
 * Checks if a user is authorized to perform code analysis on a project.
 * Authorization is granted if the user is the project owner or an accepted collaborator with the "Code analysis" permission.
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} True if authorized, false otherwise
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
  if (project.userId.toString() === userId) {
    console.log(
      `[Auth Check] User ${userId} is project owner for project ${projectId}. Authorized.`
    );
    return true;
  }
  console.log(`[Auth Check] User ${userId} is NOT the project owner.`);
  const projectCollaboratorEntry = await ProjectCollaborator.findOne({
    project_id: projectId,
  });
  if (projectCollaboratorEntry) {
    console.log(
      `[Auth Check] ProjectCollaborator entry found for project ${projectId}.`
    );
    const userGithubData = await GitHubData.findOne({ userId });
    if (!userGithubData) {
      console.log(
        `[Auth Check] GitHubData not found for user ${userId}. Returning false.`
      );
      return false;
    }
    const requestingUserGithubId = userGithubData.githubId;
    console.log(
      `[Auth Check] Requesting user ${userId} has GitHub ID: ${requestingUserGithubId}`
    );
    const collaborator = projectCollaboratorEntry.collaborators.find(
      (collab) =>
        collab.githubId === requestingUserGithubId &&
        collab.permissions.includes("Code analysis")
    );
    if (collaborator) {
      console.log(`[Auth Check] User ${userId} is an authorized collaborator.`);
      return true;
    } else {
      console.log(
        `[Auth Check] User ${userId} is NOT an authorized collaborator.`
      );
    }
  } else {
    console.log(
      `[Auth Check] No ProjectCollaborator entry found for project ${projectId}.`
    );
  }
  return false;
};

/**
 * Starts a new code analysis session for a user and project.
 * Requires projectId, GitHub repository name, and branch.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const startCodeAnalysisSession = async (req, res) => {
  const { projectId, githubRepoName, selectedBranch } = req.body;
  const userId = req.user.id;
  try {
    if (!projectId || !githubRepoName || !selectedBranch) {
      return res.status(400).json({
        success: false,
        message: "Project ID, GitHub repository name, and branch are required.",
      });
    }
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
      title: `Analysis: ${githubRepoName.split("/")[1]} (${selectedBranch})`,
    });
    res.status(201).json({
      success: true,
      message: "Code analysis session started.",
      session: newSession,
    });
  } catch (error) {
    console.error("Error starting code analysis session:", error);
    const message = error?.message || "Internal server error";
    res.status(500).json({
      success: false,
      message,
      error: error,
    });
  }
};

/**
 * Retrieves all code analysis sessions for a given project and user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getCodeAnalysisSessions = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const sessions = await CodeAnalysisSession.find({
      projectId,
      userId,
    }).sort({ lastActivity: -1 });
    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching code analysis sessions:", error);
    const message = error?.message || "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * Retrieves all messages for a given code analysis session, ensuring user authorization.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getCodeAnalysisMessages = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  try {
    const session = await CodeAnalysisSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages for this session.",
      });
    }
    const messages = await CodeAnalysisMessage.find({ sessionId }).sort({
      createdAt: 1,
    });
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching code analysis messages:", error);
    const message = error?.message || "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * Handles a user message in a code analysis session, generates an AI response using Google Gemini,
 * and saves both user and AI messages. Validates query relevance and builds code context from GitHub.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const sendCodeAnalysisMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    console.log(
      `[CodeAnalysis] Starting message processing for session: ${sessionId}, user: ${userId}`
    );
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required." });
    }
    console.log(`[CodeAnalysis] Verifying session ownership...`);
    const session = await CodeAnalysisSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this session." });
    }
    console.log(`[CodeAnalysis] Session ownership verified`);
    console.log(`[CodeAnalysis] Saving user message...`);
    const userMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "user",
      text,
    });
    console.log(
      `[CodeAnalysis] User message saved with ID: ${userMessage._id}`
    );
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
    console.log(
      `[CodeAnalysis] Extracting repo info from: ${session.githubRepoName}`
    );
    const [owner, repo] = session.githubRepoName.split("/");
    console.log(
      `[CodeAnalysis] Owner: ${owner}, Repo: ${repo}, Branch: ${session.selectedBranch}`
    );
    console.log(`[CodeAnalysis] Fetching repository contents...`);
    const fetchedCodeFiles = await fetchRepoContents(
      owner,
      repo,
      session.selectedBranch,
      "",
      githubPAT,
      githubUsername
    );
    console.log(
      `[CodeAnalysis] Fetched ${fetchedCodeFiles.length} files from repository`
    );

    // Enhanced query validation
    console.log(`[CodeAnalysis] Validating query relevance...`);
    const lowerText = text.toLowerCase();
    const isSalesforceRelated =
      lowerText.includes("salesforce") ||
      lowerText.includes("apex") ||
      lowerText.includes("soql") ||
      lowerText.includes("visualforce") ||
      lowerText.includes("lwc") ||
      lowerText.includes("lightning") ||
      lowerText.includes("sfdc") ||
      lowerText.includes("repository") ||
      lowerText.includes("github") ||
      lowerText.includes("analyze");

    // Check if query references a file or function in the repository
    let isRepoRelated = isSalesforceRelated;
    let relevantFiles = fetchedCodeFiles;
    if (!isSalesforceRelated) {
      const filePaths = fetchedCodeFiles.map((file) => file.path.toLowerCase());
      const queryWords = lowerText.split(/\s+/);
      const mentionsFile = queryWords.some((word) =>
        filePaths.some((path) => path.includes(word))
      );
      if (mentionsFile) {
        isRepoRelated = true;
        relevantFiles = fetchedCodeFiles.filter((file) =>
          queryWords.some((word) => file.path.toLowerCase().includes(word))
        );
        console.log(
          `[CodeAnalysis] Query references repository file(s): ${relevantFiles
            .map((f) => f.path)
            .join(", ")}`
        );
      } else {
        // Check for function names (basic regex for common function declarations)
        const functionRegex =
          /\b(?:function|def|public|private|protected|static|void|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/;
        for (const file of fetchedCodeFiles) {
          const matches = file.content.match(functionRegex);
          if (matches) {
            const functionNames = matches
              .slice(1)
              .map((name) => name.toLowerCase());
            if (queryWords.some((word) => functionNames.includes(word))) {
              isRepoRelated = true;
              relevantFiles = [file];
              console.log(
                `[CodeAnalysis] Query references function in file: ${file.path}`
              );
              break;
            }
          }
        }
      }
    }

    // --- DYNAMIC APEX CLASS USAGE LOGIC ---
    // Try to extract any Apex class name from the user's query
    let apexClassName = null;
    // Look for patterns like 'AccountController apex class', 'apex class AccountController', or 'use AccountController'
    const apexClassPatterns = [
      /([a-zA-Z_][a-zA-Z0-9_]*)\s+apex\s+class/, // e.g. 'AccountController apex class'
      /apex\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/, // e.g. 'apex class AccountController'
      /use\s+([a-zA-Z_][a-zA-Z0-9_]*)/, // e.g. 'use AccountController'
      /([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/ // e.g. 'AccountController.methodName'
    ];
    for (const pattern of apexClassPatterns) {
      const match = text.match(pattern);
      if (match) {
        apexClassName = match[1];
        break;
      }
    }
    // If not found, try to find any class name ending with 'Controller', 'Service', 'Manager', etc.
    if (!apexClassName) {
      const genericClassMatch = text.match(/([A-Z][A-Za-z0-9_]+)(?:\s+class)?/);
      if (genericClassMatch) {
        apexClassName = genericClassMatch[1];
      }
    }
    if (apexClassName) {
      // Filter LWC files that reference this Apex class
      const lwcFilesUsingApex = fetchedCodeFiles.filter(file =>
        file.path.includes('force-app/main/default/lwc/') &&
        (file.content.includes(apexClassName) || file.content.includes(`${apexClassName}.`))
      );
      if (lwcFilesUsingApex.length > 0) {
        relevantFiles = lwcFilesUsingApex;
        isRepoRelated = true;
        console.log(`[CodeAnalysis] Found LWC files using Apex class ${apexClassName}: ${lwcFilesUsingApex.map(f => f.path).join(', ')}`);
      }
    }
    // --- END DYNAMIC APEX CLASS USAGE LOGIC ---

    const isLwcAnalysisRequest = /analyze\s+(all\s+)?lwc/i.test(lowerText) || /lwc\s+analysis/i.test(lowerText);

    if (isLwcAnalysisRequest) {
      // Find all LWC component folders and their files
      const lwcFiles = fetchedCodeFiles.filter(file =>
        file.path.includes('force-app/main/default/lwc/') &&
        (file.path.endsWith('.js') || file.path.endsWith('.html') || file.path.endsWith('.xml'))
      );
      if (lwcFiles.length > 0) {
        isRepoRelated = true;
        relevantFiles = lwcFiles;
        console.log(`[CodeAnalysis] Auto-selected all LWC component files for analysis.`);
      }
    }

    const filePathMatch = lowerText.match(/([a-z0-9_\\/-]+\\.[a-z0-9]+)/i);
    const fileName = filePathMatch ? filePathMatch[1] : null;
    let file = null;
    if (fileName) {
      // Try exact match first
      file = fetchedCodeFiles.find(f => f.path.toLowerCase() === fileName.toLowerCase());
      // Fallback to endsWith if no exact match
      if (!file) {
        file = fetchedCodeFiles.find(f => f.path.toLowerCase().endsWith(fileName.toLowerCase()));
      }
    }
    if (file) {
      isRepoRelated = true;
      relevantFiles = [file];
      console.log(`[CodeAnalysis] Query references file: ${file.path}`);
    }

    let currentBranchCodeContext = "";

    const isFolderStructureRequest = /folder structure|directory tree|list files|repo structure/i.test(lowerText);
    if (isFolderStructureRequest) {
      isRepoRelated = true;
      relevantFiles = fetchedCodeFiles;
      // Build the directory tree string
      currentBranchCodeContext = "Repository folder structure:\n" + buildDirectoryTree(fetchedCodeFiles);
    }

    // --- GENERAL CODEBASE-WIDE PATTERN SEARCH LOGIC ---
    // 1. Detect codebase-wide pattern queries
    const codebaseWidePatterns = [
      /any test use/i,
      /find all/i,
      /which files/i,
      /list all/i,
      /show all/i,
      /are there any/i,
      /do any/i,
      /detect/i,
      /search for/i,
      /where is .* used/i,
      /files that use/i,
      /files with/i,
      /classes with/i,
      /methods with/i,
      /tests with/i,
    ];
    const isCodebaseWideQuery = codebaseWidePatterns.some(pattern => pattern.test(text));

    // 2. Try to extract the keyword/pattern (simple version: look for quoted string or after 'use', 'with', etc.)
    let searchPattern = null;
    const quoted = text.match(/["'`]{1}([^"'`]+)["'`]{1}/);
    if (quoted) {
      searchPattern = quoted[1];
    } else {
      // Try to extract after 'use', 'with', etc.
      const useMatch = text.match(/use ([a-zA-Z0-9_@=]+)/i);
      if (useMatch) searchPattern = useMatch[1];
      else {
        const withMatch = text.match(/with ([a-zA-Z0-9_@=]+)/i);
        if (withMatch) searchPattern = withMatch[1];
        else {
          // Try to extract after 'for', 'about', etc.
          const forMatch = text.match(/for ([a-zA-Z0-9_@=]+)/i);
          if (forMatch) searchPattern = forMatch[1];
        }
      }
    }

    if (isCodebaseWideQuery && searchPattern) {
      // 3. Search all relevant files for the pattern
      const matchingFiles = fetchedCodeFiles.filter(file =>
        file.content && file.content.toLowerCase().includes(searchPattern.toLowerCase())
      );
      if (matchingFiles.length > 0) {
        relevantFiles = matchingFiles;
        isRepoRelated = true;
        console.log(`[CodeAnalysis] Found files matching pattern '${searchPattern}': ${matchingFiles.map(f => f.path).join(', ')}`);
      } else {
        relevantFiles = [];
        isRepoRelated = true;
        currentBranchCodeContext = `No files in this repository match the pattern: ${searchPattern}`;
        console.log(`[CodeAnalysis] No files found matching pattern '${searchPattern}'.`);
      }
    }
    // --- END GENERAL CODEBASE-WIDE PATTERN SEARCH LOGIC ---

    if (!isRepoRelated) {
      console.log(
        `[CodeAnalysis] Query not relevant to Salesforce or repository`
      );
      const sorryMessage =
        "Sorry, I can only assist with questions about files or code in this repository.";
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
    console.log(`[CodeAnalysis] Query is relevant, proceeding...`);

    // Build code context with priority for relevant files
    if (relevantFiles.length > 0) {
      console.log(
        `[CodeAnalysis] Building code context from ${relevantFiles.length} relevant files`
      );
      const salesforceFiles = relevantFiles.filter(
        (file) =>
          file.path.endsWith(".cls") ||
          file.path.endsWith(".trigger") ||
          file.path.endsWith(".page") ||
          file.path.endsWith(".component") ||
          file.path.includes("lwc/") ||
          file.path.endsWith(".xml") ||
          file.path.endsWith(".js") || // Include JS for LWC
          file.path.endsWith(".html") // Include HTML for LWC
      );
      if (salesforceFiles.length > 0) {
        currentBranchCodeContext = salesforceFiles
          .map((file) => `// File: ${file.path}\n${file.content}`)
          .join("\n\n---\n\n");
      } else {
        // Include non-Salesforce files if explicitly referenced
        currentBranchCodeContext = relevantFiles
          .map((file) => `// File: ${file.path}\n${file.content}`)
          .join("\n\n---\n\n");
      }
      // if (relevantFiles.length > 20) {
      //   currentBranchCodeContext =
      //     `// Code context from ${relevantFiles.length} files. Summarizing key files:\n` +
      //     relevantFiles
      //       .slice(0, 5)
      //       .map((f) => `// - ${f.path}`)
      //       .join("\n") +
      //     `\n\n// Example from ${
      //       relevantFiles[0].path
      //     }:\n${relevantFiles[0].content.substring(
      //       0,
      //       Math.min(200, relevantFiles[0].content.length)
      //     )}...`;
      // }
    } else {
      currentBranchCodeContext = `No relevant files found in branch: ${session.selectedBranch} of repository ${owner}/${repo}.`;
    }

    console.log(`[CodeAnalysis] Constructing system instruction...`);
    const systemInstruction = `You are an expert AI assistant for code analysis and explanation of any file in a GitHub repository. You are analyzing code from the GitHub repository '${session.githubRepoName}', Branch: '${session.selectedBranch}'.

Code Context:
${currentBranchCodeContext}

---
User request: ${text}
---

Instructions:
1. Respond to any queries about files or code in the repository, including but not limited to Salesforce, JavaScript, CSS, HTML, configuration, or documentation files. If the user asks about a specific file, always attempt to explain its content, regardless of file type.
2. For queries unrelated to the repository or its files, return: "Sorry, I can only assist with questions about files or code in this repository."
3. If the user asks to explain a function or code element (e.g., "explain", "describe", or mentions a function name):
   - Identify the function or code element in the provided context.
   - Provide a detailed explanation including:
     - Purpose of the function.
     - Parameters and return values.
     - Usage within the file or project.
     - Include the function's code in a Markdown code block with the file path (e.g., \`\`\`apex\n// force-app/main/default/classes/MyClass.cls\npublic void myFunction() {}\n\`\`\`).
   - If the function is not found, list possible matches or suggest the user verify the name/file path.
4. If the user requests code analysis (e.g., contains "analyze" or "review"):
   - Identify errors, bugs, or improvements in the provided code.
   - Specify file paths and, if possible, line numbers.
   - Provide concrete solutions with complete code snippets in Markdown format, including the file path.
   - Focus on best practices for the relevant language or framework.
5. If generating new code:
   - Provide complete code blocks in Markdown with file paths.
   - Ensure code follows conventions for the relevant language or framework.
6. If the code context is missing or insufficient, state this clearly and suggest how the user can provide more details.
7. Be concise, structured, and avoid speculative responses.`;

    console.log(`[CodeAnalysis] Starting Gemini chat...`);
    const geminiConfig = await Configuration.findOne({ userId, configTitle: "Gemini", isActive: true });
    const apiKey = geminiConfig?.configValue.find(v => v.key.toLowerCase() === "apikey")?.value;
    if (!apiKey) {
      throw new Error("Gemini integration not configured. Please add your Gemini API key in settings.");
    }
    console.log('Looking for Gemini config for user:', userId);
    console.log('Gemini config found:', geminiConfig);
    console.log('Gemini API key:', apiKey);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: systemInstruction }] }],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.5,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      // handle error
    }
    const result = await response.json();
    const aiTextResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiTextResponse) {
      // handle error, log result for debugging
      console.error("Unexpected Gemini API response:", result);
      throw new Error("Failed to parse Gemini API response.");
    }
    console.log(
      `[CodeAnalysis] Received response from Gemini (${aiTextResponse.length} characters)`
    );
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
    console.log(`[CodeAnalysis] Saving AI message...`);
    const aiMessage = await CodeAnalysisMessage.create({
      sessionId,
      sender: "ai",
      text: aiTextResponse,
    });
    console.log(`[CodeAnalysis] AI message saved with ID: ${aiMessage._id}`);
    console.log(`[CodeAnalysis] Updating session metadata...`);
    session.lastActivity = Date.now();
    // if (
    //   !session.title ||
    //   (session.title.startsWith("Analysis:") && previousMessages.length <= 1)
    // ) {
     if (!session.title || session.title.startsWith("Analysis:")) {
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
    const message = error?.message || "Internal server error";
    await CodeAnalysisMessage.create({
      sessionId,
      sender: "system",
      text: message,
      isError: true,
    });
    res.status(500).json({
      success: false,
      message,
      error: error,
    });
  }
};

/**
 * Deletes a code analysis session and all associated messages, ensuring user authorization.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
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
    await CodeAnalysisMessage.deleteMany({ sessionId });
    await CodeAnalysisSession.findByIdAndDelete(sessionId);
    res.status(200).json({
      success: true,
      message: "Session and associated messages deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting code analysis session:", error);
    const message = error?.message || "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * Pushes AI-generated code to a new branch in the GitHub repository and creates a pull request.
 * Handles branch creation/updating, commit creation, and PR creation via the GitHub API.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
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
      return res.status(400).json({
        success: false,
        message: "Missing required fields for code push and PR.",
      });
    }
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
    const githubUsername = githubData.githubUsername;
    const repoFullName = new URL(project.githubRepoLink).pathname
      .substring(1)
      .replace(/\.git$/, "");
    const [owner, repo] = repoFullName.split("/");
    const getRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${selectedBranch}`,
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
      console.error(
        "GitHub API error getting base branch ref for push:",
        errorData
      );
      return res.status(getRefResponse.status).json({
        success: false,
        message: `Failed to get base branch ref ('${selectedBranch}'): ${
          errorData.message || "Unknown error"
        }.`,
      });
    }
    const refData = await getRefResponse.json();
    const baseCommitSha = refData.object.sha;
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
      console.warn(
        "AI response did not contain structured code blocks with file paths."
      );
      codeBlocks.push({
        filePath: `ai_generated_changes/response_${Date.now()
          .toString()
          .slice(-6)}.txt`,
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
        message: "No valid code blocks with file paths were found to commit.",
      });
    }
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
    if (!createBranchResponse.ok) {
      if (createBranchResponse.status === 422) {
        console.warn(
          `Branch ${aiBranchName} already exists. Attempting to update.`
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
              force: true,
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
            message: `Failed to update AI branch '${aiBranchName}': ${
              errorData.message || "Unknown error"
            }.`,
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
          }\n\nBranch '${aiBranchName}' includes the proposed modifications.`,
          maintainer_can_modify: true,
        }),
      }
    );
    if (!createPRResponse.ok) {
      const errorData = await createPRResponse
        .json()
        .catch(() => ({ message: createPRResponse.statusText }));
      console.error("GitHub API error creating PR:", errorData);
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
    const message = error?.message || "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

function buildDirectoryTree(files) {
  const tree = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    parts.forEach((part, idx) => {
      if (!current[part]) {
        current[part] = (idx === parts.length - 1) ? null : {};
      }
      current = current[part];
    });
  });

  function printTree(node, prefix = '') {
    return Object.entries(node)
      .map(([name, child]) => {
        if (child === null) {
          return `${prefix}- ${name}`;
        }
        // Do NOT skip folders that are empty or only contain .gitkeep
        return `${prefix}- ${name}/\n${printTree(child, prefix + '  ')}`;
      })
      .join('\n');
  }

  return printTree(tree);
}

module.exports = {
  startCodeAnalysisSession,
  getCodeAnalysisSessions,
  getCodeAnalysisMessages,
  sendCodeAnalysisMessage,
  pushCodeAndCreatePR,
  deleteCodeAnalysisSession,
};
