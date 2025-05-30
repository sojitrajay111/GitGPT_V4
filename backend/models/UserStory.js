const mongoose = require("mongoose");

const userStorySchema = new mongoose.Schema(
  {
    // Reference to the User who created this user story
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: true,
    },
    // Reference to the Project this user story belongs to
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Links to the Project model
      required: true,
    },
    // Array of collaborators assigned to this user story
    collaborators: [
      {
        username: {
          type: String,
          required: true,
        },
        githubId: {
          type: String,
          required: true,
        },
        avatarUrl: {
          type: String, // Stores the collaborator's GitHub avatar URL
        },
      },
    ],
    userStoryTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    acceptanceCriteria: {
      type: String,
      required: true,
      trim: true,
    },
    testingScenarios: {
      type: String,
      required: true,
      trim: true,
    },
    // New field for AI-enhanced user story content
    aiEnhancedUserStory: {
      type: String,
      trim: true, // Good to trim whitespace
      default: "", // Default to an empty string
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// To avoid recompilation errors in Next.js
const UserStory =
  mongoose.models.UserStory || mongoose.model("UserStory", userStorySchema);

module.exports = UserStory;
