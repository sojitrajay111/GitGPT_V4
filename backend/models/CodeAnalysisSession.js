const mongoose = require("mongoose");

const CodeAnalysisSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    githubRepoName: {
      type: String,
      required: true,
    },
    selectedBranch: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      // A short descriptive title for the session, e.g., "Bug fix in login module"
      // This can be generated from the first message or updated later.
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model(
  "CodeAnalysisSession",
  CodeAnalysisSessionSchema
);
