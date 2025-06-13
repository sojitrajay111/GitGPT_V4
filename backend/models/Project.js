const mongoose = require("mongoose");

// Define the schema for a Project
const projectSchema = new mongoose.Schema(
  {
    // Reference to the User who owns this project
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: true,
    },
    // Name of the project
    projectName: {
      type: String,
      required: true,
      trim: true, // Remove whitespace from both ends of a string
    },
    // Short description of the project
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    // Link to the GitHub repository associated with the project
    githubRepoLink: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    // Add createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

// Create and export the Project model
// Use existing model if it's already defined to prevent OverwriteModelError
const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
module.exports = Project;
