const UserStory = require("../models/UserStory");
const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");
require("dotenv").config();
// Import a fetch-like library if you are not using Node.js 18+ which has native fetch
// For older Node.js versions:
// const fetch = require('node-fetch'); // You'd need to install this: npm install node-fetch

/**
 * @desc Create a new user story for a project.
 * @route POST /api/user-stories
 * @access Private (requires user authentication middleware)
 */
const createUserStory = async (req, res) => {
  const {
    projectId,
    userStoryTitle,
    description,
    acceptanceCriteria,
    testingScenarios,
    collaboratorGithubIds, // Array of githubIds of selected collaborators
    aiEnhancedUserStory, // New field from frontend
  } = req.body;
  const creator_id = req.user.id; // Get creator_id from authentication middleware

  try {
    // 1. Validate project existence
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // 2. Fetch collaborator details from ProjectCollaborator document
    const projectCollaboratorDoc = await ProjectCollaborator.findOne({
      project_id: projectId,
    });

    // It's okay if there's no collaborator doc or no collaborators,
    // just means the story won't have any assigned initially.
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

    // 3. Create the new user story
    const newUserStory = await UserStory.create({
      creator_id,
      projectId,
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaborators: selectedCollaborators,
      aiEnhancedUserStory: aiEnhancedUserStory || "", // Save the AI enhanced story, default to empty string
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
    // Find all user stories associated with the given projectId
    const userStories = await UserStory.find({ projectId }).populate(
      "creator_id",
      "username email"
    ); // Populate creator details if needed

    res.status(200).json({ success: true, userStories });
  } catch (error) {
    console.error("Error fetching user stories:", error);
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

  // Validate input
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
Ensure the user story is well-defined, follows the INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable) where possible,
and provides clear guidance for a development team. If any information seems missing or could be improved, please make reasonable assumptions or suggest additions.
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

    // Use the latest Gemini model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
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

    console.log("Making request to Gemini API...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "YourApp/1.0",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { error: { message: await response.text() } };
      }

      console.error("Error from Gemini API:", errorData);

      // Handle specific error cases
      if (response.status === 400) {
        return res.status(400).json({
          success: false,
          message: "Invalid request to AI service. Please check your input.",
        });
      } else if (response.status === 403) {
        return res.status(500).json({
          success: false,
          message:
            "AI service access denied. Please check API key permissions.",
        });
      } else if (response.status === 429) {
        return res.status(429).json({
          success: false,
          message: "AI service rate limit exceeded. Please try again later.",
        });
      }

      throw new Error(
        `Gemini API request failed with status ${response.status}: ${
          errorData?.error?.message || "Unknown error"
        }`
      );
    }

    const result = await response.json();
    console.log("API Response received:", JSON.stringify(result, null, 2));

    // Check for blocked content
    if (
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].finishReason === "SAFETY"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Content was blocked by safety filters. Please modify your input and try again.",
      });
    }

    // Extract the generated text
    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      const enhancedText = result.candidates[0].content.parts[0].text;

      if (!enhancedText || enhancedText.trim() === "") {
        return res.status(500).json({
          success: false,
          message: "AI service returned empty content.",
        });
      }

      res.status(200).json({
        success: true,
        aiEnhancedText: enhancedText.trim(),
      });
    } else {
      console.error("Unexpected API response structure from Gemini:", result);
      res.status(500).json({
        success: false,
        message:
          "Failed to generate story content due to unexpected API response.",
      });
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Handle network errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(500).json({
        success: false,
        message: "Unable to connect to AI service. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: `Error generating AI story content: ${error.message}`,
    });
  }
};

module.exports = {
  createUserStory,
  getUserStoriesByProjectId,
  generateAiStoryContent, // Export the new function
};
