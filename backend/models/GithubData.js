const mongoose = require("mongoose");

const githubDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  githubUsername: {
    type: String,
    required: true
  },
  githubEmail: {
    type: String,
    required: true
  },
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  githubPAT: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  authenticatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const GitHubData = mongoose.models.GitHubData || mongoose.model("GitHubData", githubDataSchema);
module.exports = GitHubData;