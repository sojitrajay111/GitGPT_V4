// models/CodeContribution.js
const mongoose = require("mongoose");

const codeContributionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true, // Index for faster lookups by project
    },
    userStoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStory",
      required: false, // Optional if general code contribution
      index: true,
    },
    contributorType: {
      type: String,
      enum: ["AI", "Developer"],
      required: true,
    },
    githubUsername: {
      type: String,
      trim: true,
      required: function () {
        return this.contributorType === "Developer"; // Required only for developers
      },
    },
    linesOfCode: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // For AI contributions, track token usage
    geminiTokensUsed: {
      type: Number,
      default: 0,
    },
    // For AI contributions, track if it resulted in a PR
    prUrl: {
      type: String,
      trim: true,
    },
    // For developer contributions on AI branches (e.g., bug fixes)
    isFixOnAiBranch: {
      type: Boolean,
      default: false,
    },
    // Timestamp for when the contribution occurred
    contributionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const CodeContribution =
  mongoose.models.CodeContribution ||
  mongoose.model("CodeContribution", codeContributionSchema);

module.exports = CodeContribution;
