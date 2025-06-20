const Document = require("../models/Document");
const User = require("../models/User");
const Project = require("../models/Project");
const cloudinary = require("cloudinary").v2;
const googleDriveService = require("../services/googleDriveService");
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
 * Helper function to upload a buffer to Cloudinary (Legacy support)
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
        resource_type: "raw",
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
 * Helper function to upload file to Google Drive
 * @param {Buffer} buffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} mimeType - The MIME type
 * @returns {Promise<object>} - Google Drive upload result
 */
const uploadToGoogleDrive = async (buffer, fileName, mimeType) => {
  try {
    // Get the main folder ID (this ensures the 'GitGPT documents' folder exists)
    const folderId = await googleDriveService.createOrGetMainFolder(); // CHANGED HERE
    // Upload file to the main folder
    const result = await googleDriveService.uploadFile(buffer, fileName, mimeType, folderId);
    return result;
  } catch (error) {
    console.error("Google Drive upload error:", error);
    throw error;
  }
};

/**
 * @desc Upload a new document to Google Drive and save its details to MongoDB
 * @route POST /api/documents/upload
 * @access Private
 */
const uploadDocument = async (req, res) => {
  try {
    console.log('DEBUG: req.file =', req.file);
    if (req.file && req.file.buffer) {
      console.log('DEBUG: req.file.buffer type =', req.file.buffer.constructor.name);
    }
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
        .json({ success: false, message: "No file uploaded (req.file missing)." });
    }
    if (!req.file.buffer || !req.file.originalname) {
      return res
        .status(400)
        .json({ success: false, message: "File buffer or originalname missing in req.file." });
    }
    if (!(req.file.buffer instanceof Buffer)) {
      return res
        .status(400)
        .json({ success: false, message: "File buffer is not a Buffer. Check frontend upload logic." });
    }

    // Use user's Google Drive tokens for this upload
    let isGoogleDriveAvailable = false;
    if (user.googleDriveTokens) {
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3001/api/google/oauth-callback'
      );
      oauth2Client.setCredentials(user.googleDriveTokens);
      googleDriveService.initializeWithOAuth2Client(oauth2Client);
      isGoogleDriveAvailable = await googleDriveService.checkAccess();
    } else {
      // If no user.googleDriveTokens, rely on existing initialization (e.g., service account)
      // or assume it's not available. For user-based OAuth, this path might not be relevant.
      isGoogleDriveAvailable = await googleDriveService.checkAccess();
    }

    let documentData = {
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      size: req.file.size,
      originalFileName: req.file.originalname,
    };

    if (isGoogleDriveAvailable) {
      // Upload to Google Drive
      const result = await uploadToGoogleDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      documentData.googleDriveFileId = result.fileId;
      documentData.googleDriveLink = result.downloadLink;
      documentData.googleDriveViewLink = result.viewLink;
    } else {
      // Fallback to Cloudinary if Google Drive is not available
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        `project_documents/${projectId}`
      );

      documentData.cloudinaryLink = result.secure_url;
      documentData.cloudinaryPublicId = result.public_id;
    }

    const newDocument = await Document.create(documentData);

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

    const project = await Project.findOne({ _id: projectId });
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
    // If you want to upload generated content as a file to Google Drive:
    // 1. Create a buffer from documentFullDescription.
    // 2. Call uploadToGoogleDrive.
    // 3. Save googleDriveFileId and googleDriveLink.

    // This example saves metadata only, assuming no file for 'generated' docs.
    // If 'generated' docs should also be files on Google Drive, adjust this.
    // For simplicity, let's assume generated docs don't have a Google Drive file for now.
    // If they should, you'd need a placeholder or upload the generated text.
    const newDocument = await Document.create({
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      // documentFullDescription, // Add to schema if storing directly
      // If you generate a file and upload it:
      // googleDriveFileId: generatedFileResult.fileId,
      // googleDriveLink: generatedFileResult.downloadLink,
      // googleDriveViewLink: generatedFileResult.viewLink,
      // For now, let's make these non-mandatory if it's a generated doc without a file.
      // You'll need to adjust your model if googleDriveFileId/Link are not always required.
      // A better approach: always upload something, even if it's a .txt of the description.
      googleDriveFileId: "N/A (Generated Document)", // Placeholder
      googleDriveLink: "N/A (Generated Document)", // Placeholder
      googleDriveViewLink: "N/A (Generated Document)", // Placeholder
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
      return res.status(403).json({
        success: false,
        message: "User not authorized to update this document.",
      });
    }

    const updateData = {};
    if (documentTitle) updateData.documentTitle = documentTitle;
    if (documentShortDescription)
      updateData.documentShortDescription = documentShortDescription;

    // If a new file is uploaded, replace the old one
    if (req.file) {
      // Check if Google Drive is available
      const isGoogleDriveAvailable = await googleDriveService.checkAccess();
      
      if (isGoogleDriveAvailable) {
        // Delete old file from Google Drive if it exists
        if (document.googleDriveFileId && document.googleDriveFileId !== "N/A (Generated Document)") {
          try {
            await googleDriveService.deleteFile(document.googleDriveFileId);
          } catch (deleteError) {
            console.warn(
              "Failed to delete old file from Google Drive, proceeding with update:",
              deleteError.message
            );
          }
        }

        // Upload new file to Google Drive
        const result = await uploadToGoogleDrive(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        updateData.googleDriveFileId = result.fileId;
        updateData.googleDriveLink = result.downloadLink;
        updateData.googleDriveViewLink = result.viewLink;
        
        // Clear old Cloudinary data if it exists
        updateData.cloudinaryLink = null;
        updateData.cloudinaryPublicId = null;
      } else {
        // Fallback to Cloudinary
        // Delete old file from Cloudinary if it exists and has a public ID
        if (
          document.cloudinaryPublicId &&
          document.cloudinaryPublicId !== "N/A (Generated Document)"
        ) {
          try {
            await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
              resource_type: "raw",
            });
          } catch (deleteError) {
            console.warn(
              "Failed to delete old file from Cloudinary, proceeding with update:",
              deleteError.message
            );
          }
        }

        // Upload new file to Cloudinary
        const result = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname,
          `project_documents/${document.projectId}`
        );
        updateData.cloudinaryLink = result.secure_url;
        updateData.cloudinaryPublicId = result.public_id;
        
        // Clear old Google Drive data if it exists
        updateData.googleDriveFileId = null;
        updateData.googleDriveLink = null;
        updateData.googleDriveViewLink = null;
      }
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
      return res.status(403).json({
        success: false,
        message: "User not authorized to delete this document.",
      });
    }

    // Delete file from storage
    if (document.googleDriveFileId && document.googleDriveFileId !== "N/A (Generated Document)") {
      try {
        await googleDriveService.deleteFile(document.googleDriveFileId);
      } catch (deleteError) {
        console.warn(
          "Failed to delete file from Google Drive, proceeding with DB deletion:",
          deleteError.message
        );
      }
    } else if (document.cloudinaryPublicId && document.cloudinaryPublicId !== "N/A (Generated Document)") {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
          resource_type: "raw",
        });
      } catch (deleteError) {
        console.warn(
          "Failed to delete file from Cloudinary, proceeding with DB deletion:",
          deleteError.message
        );
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

/**
 * @desc Initialize Google Drive connection
 * @route POST /api/documents/init-google-drive
 * @access Private
 */
const initGoogleDrive = async (req, res) => {
  try {
    const { credentials } = req.body;
    
    if (!credentials) {
      return res.status(400).json({
        success: false,
        message: "Google Drive credentials are required.",
      });
    }

    const isInitialized = googleDriveService.initialize(credentials);
    
    if (isInitialized) {
      const hasAccess = await googleDriveService.checkAccess();
      
      if (hasAccess) {
        res.status(200).json({
          success: true,
          message: "Google Drive initialized successfully!",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Failed to access Google Drive. Please check your credentials.",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to initialize Google Drive.",
      });
    }
  } catch (error) {
    console.error("Error initializing Google Drive:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while initializing Google Drive.",
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
  initGoogleDrive,
};