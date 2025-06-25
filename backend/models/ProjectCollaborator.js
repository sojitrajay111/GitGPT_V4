const mongoose = require("mongoose");

const projectCollaboratorSchema = new mongoose.Schema(
  {
    created_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
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
          // Added: Stores the collaborator's GitHub avatar URL
          type: String,
        },
        status: {
          // Added: Tracks the collaboration request status
          type: String,
          enum: ["pending", "accepted", "rejected"], // Possible statuses
          default: "accepted", // Default status when a collaborator is added
          required: true,
        },
        permissions: [
          // Added: Array of permissions granted to the collaborator
          {
            type: String,
            enum: [
              // Enforce specific permission values
              "Create PR",
              "Assign PR",
              "Review PR",
              "User story creation",
              "Code analysis",
              "Documentation upload",
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// To avoid recompilation errors in Next.js
const ProjectCollaborator =
  mongoose.models.ProjectCollaborator ||
  mongoose.model("ProjectCollaborator", projectCollaboratorSchema);

module.exports = ProjectCollaborator;
