const Document = require("../models/Document");
const User = require("../models/User");
const Project = require("../models/Project");
const cloudinary = require("cloudinary").v2;
// const fs = require('fs'); // No longer needed for local unlinking with memoryStorage
// const path = require('path'); // If you were constructing paths, also likely not needed

// Ensure Cloudinary is configured. Best practice is to have this once at app start.
// However, if it's only used here, this is okay.
// Make sure .env variables are loaded (e.g., require('dotenv').config() in your main server file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to upload a buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer
 * @param {string} originalname - The original file name for context
 * @param {string} folder - The Cloudinary folder to upload to
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, originalname, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        // public_id: originalname.split('.')[0] // Optional: set a public_id based on filename
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * @desc Upload a new document to Cloudinary and save its details to MongoDB
 * @route POST /api/documents/upload
 * @access Private
 */
const uploadDocument = async (req, res) => {
  try {
    const { documentTitle, documentShortDescription, projectId } = req.body;
    const creatorId = req.user.id;

    if (!documentTitle || !documentShortDescription || !projectId) {
      return res.status(400).json({
        success: false,
        message:
          "Document title, short description, and project ID are required.",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: creatorId,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission.",
      });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Creator user not found." });
    }
    const createdUser = user.username;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    // Upload file to Cloudinary from buffer
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      `project_documents/${projectId}`
    );

    const newDocument = await Document.create({
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      cloudinaryLink: result.secure_url,
      cloudinaryPublicId: result.public_id, // Save public_id
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully!",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    // Handle multer file filter error
    if (error.message && error.message.startsWith("Invalid file type")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading document.",
      error: error.message,
    });
  }
};

/**
 * @desc Get all documents for a specific project
 * @route GET /api/documents/project/:projectId
 * @access Private
 */
const getDocumentsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: projectId, userId: userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission.",
      });
    }

    const documents = await Document.find({ projectId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

/**
 * @desc Save a newly generated document (without file upload)
 * @route POST /api/documents/generate
 * @access Private
 */
const saveGeneratedDocument = async (req, res) => {
  try {
    const {
      documentTitle,
      documentShortDescription,
      documentFullDescription, // Assuming this is content for a generated doc
      projectId,
    } = req.body;
    const creatorId = req.user.id;

    if (!documentTitle || !documentShortDescription || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title, short description, and project ID are required.",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: creatorId,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not have permission.",
      });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Creator user not found." });
    }
    const createdUser = user.username;

    // For generated documents, you might create a text file and upload it,
    // or store content differently. Here, we assume no direct file upload.
    // If you want to upload generated content as a file to Cloudinary:
    // 1. Create a buffer from documentFullDescription.
    // 2. Call uploadToCloudinary.
    // 3. Save cloudinaryLink and cloudinaryPublicId.

    // This example saves metadata only, assuming no file for 'generated' docs.
    // If 'generated' docs should also be files on Cloudinary, adjust this.
    // For simplicity, let's assume generated docs don't have a Cloudinary file for now.
    // If they should, you'd need a placeholder or upload the generated text.
    const newDocument = await Document.create({
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      // documentFullDescription, // Add to schema if storing directly
      // If you generate a file and upload it:
      // cloudinaryLink: generatedFileResult.secure_url,
      // cloudinaryPublicId: generatedFileResult.public_id,
      // For now, let's make these non-mandatory if it's a generated doc without a file.
      // You'll need to adjust your model if cloudinaryLink/PublicId are not always required.
      // A better approach: always upload something, even if it's a .txt of the description.
      cloudinaryLink: "N/A (Generated Document)", // Placeholder
      cloudinaryPublicId: "N/A (Generated Document)", // Placeholder
    });

    res.status(201).json({
      success: true,
      message: "Generated document saved successfully!",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error saving generated document:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

/**
 * @desc Update an existing document
 * @route PUT /api/documents/:documentId
 * @access Private
 */
const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { documentTitle, documentShortDescription } = req.body;
    const userId = req.user.id;

    if (!documentTitle && !documentShortDescription && !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided." });
    }

    let document = await Document.findById(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    // Check if the user is the creator of the document
    if (document.creatorId.toString() !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "User not authorized to update this document.",
        });
    }

    const updateData = {};
    if (documentTitle) updateData.documentTitle = documentTitle;
    if (documentShortDescription)
      updateData.documentShortDescription = documentShortDescription;

    // If a new file is uploaded, replace the old one in Cloudinary
    if (req.file) {
      // Delete old file from Cloudinary if it exists and has a public ID
      if (
        document.cloudinaryPublicId &&
        document.cloudinaryPublicId !== "N/A (Generated Document)"
      ) {
        try {
          // Determine resource_type. If you only upload PDFs, it's 'raw' or 'image' based on how you treat them.
          // For general files, 'raw' is safer unless they are images/videos.
          // If you stored PDFs as 'image' type in Cloudinary (e.g. for transformations), use 'image'.
          // If you stored them as 'raw', use 'raw'. 'auto' usually works for upload_stream.
          // For deletion, you need the correct resource_type if it's not 'image'.
          // Let's assume 'raw' for non-image files like PDF/DOCX unless specified otherwise.
          // If your PDFs are treated as images by Cloudinary (e.g. for page previews), it might be 'image'.
          // For simplicity, if `resource_type` was 'auto' on upload, Cloudinary figures it out.
          // Deletion might need explicit type if not 'image'.
          // Let's try with just public_id. If errors, specify resource_type.
          await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
            resource_type: "raw",
          });
          // If you upload various types and used 'auto', deletion might also work with 'auto' or try specific types.
          // For PDFs specifically, if they are not treated as images, resource_type 'raw' is common.
        } catch (deleteError) {
          console.warn(
            "Failed to delete old file from Cloudinary, proceeding with update:",
            deleteError.message
          );
          // Decide if this is a critical error. For now, we'll log and continue.
        }
      }

      // Upload new file
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        `project_documents/${document.projectId}` // Use existing project ID
      );
      updateData.cloudinaryLink = result.secure_url;
      updateData.cloudinaryPublicId = result.public_id;
    }

    updateData.updatedAt = Date.now(); // Explicitly set updatedAt

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Document updated successfully!",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    // Handle multer file filter error
    if (error.message && error.message.startsWith("Invalid file type")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error while updating document.",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a document
 * @route DELETE /api/documents/:documentId
 * @access Private
 */
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    // Check if the user is the creator of the document
    if (document.creatorId.toString() !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "User not authorized to delete this document.",
        });
    }

    // Delete file from Cloudinary if it exists and has a public ID
    if (
      document.cloudinaryPublicId &&
      document.cloudinaryPublicId !== "N/A (Generated Document)"
    ) {
      try {
        // Similar to update, specify resource_type if needed. 'raw' is a good default for general files.
        await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
          resource_type: "raw",
        });
      } catch (deleteError) {
        console.warn(
          "Failed to delete file from Cloudinary, proceeding with DB deletion:",
          deleteError.message
        );
        // Decide if this is critical. For now, log and continue.
      }
    }

    await Document.findByIdAndDelete(documentId);

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting document.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByProjectId,
  saveGeneratedDocument,
  updateDocument,
  deleteDocument,
};
