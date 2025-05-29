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
