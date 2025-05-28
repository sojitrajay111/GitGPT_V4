const mongoose = require("mongoose");

const githubDataSchema = new mongoose.Schema({
  // Reference to the User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  githubUsername: {
    type: String,
    required: true,
  },
  githubToken: {
    type: String,
    required: true,
  },
  githubEmail: {
    type: String,
  },
});

const GithubData =
  mongoose.models.GithubData || mongoose.model("GithubData", githubDataSchema);

module.exports = GithubData;
