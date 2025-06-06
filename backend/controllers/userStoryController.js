const UserStory = require("../models/UserStory");
const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");
require("dotenv").config();
// Using native fetch available in Node.js 18+
// const fetch = require('node-fetch'); // for older Node.js versions

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
    return res
      .status(400)
      .json({
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
      return res
        .status(400)
        .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: `Error generating AI story content: ${error.message}`,
      });
  }
};

module.exports = {
  createUserStory,
  getUserStoriesByProjectId,
  updateUserStory,
  deleteUserStory,
  generateAiStoryContent,
};
