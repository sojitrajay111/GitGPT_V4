const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // References the Project model
      required: true,
    },
    documentTitle: {
      type: String,
      required: true,
      trim: true,
    },
    documentShortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    createdUser: {
      // Store username for easier display
      type: String,
      required: true,
      trim: true,
    },
    // Google Drive fields
    googleDriveFileId: {
      type: String,
      required: false,
      trim: true,
    },
    googleDriveLink: {
      type: String,
      required: false,
      trim: true,
    },
    googleDriveViewLink: {
      type: String,
      required: false,
      trim: true,
    },
    // Legacy Cloudinary fields (for backward compatibility)
    cloudinaryLink: {
      type: String,
      required: false,
      trim: true,
    },
    cloudinaryPublicId: { 
      type: String, 
      required: false,
      trim: true,
    },
    size: {
      type: Number,
      required: false,
    },
    originalFileName: {
      type: String,
      required: false,
      trim: true,
    },
    // For generated documents, you might store the full content directly
    // If you plan to generate very large documents, consider storing them
    // as files in Google Drive or similar, and saving the link here.
    // For now, we'll assume short descriptions are enough, or a separate
    // field for generated content if not a file.
    // documentFullContent: {
    //   type: String,
    //   required: false,
    // },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
module.exports = Document;
