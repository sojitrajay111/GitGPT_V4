const Document = require("../models/Document");
const User = require("../models/User"); // To fetch user details if needed
const Project = require("../models/Project"); // To validate project existence
const cloudinary = require("cloudinary").v2; // Ensure you have cloudinary configured

// Cloudinary configuration (replace with your actual credentials or environment variables)
// You should load these from environment variables in a real application
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloudinary_cloud_name",
  api_key: process.env.CLOUDINARY_API_KEY || "your_cloudinary_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "your_cloudinary_api_secret",
});

/**
 * @desc Upload a new document to Cloudinary and save its details to MongoDB
 * @route POST /api/documents/upload
 * @access Private (requires authentication middleware)
 */
const uploadDocument = async (req, res) => {
  try {
    const { documentTitle, documentShortDescription, projectId } = req.body;
    const creatorId = req.user.id; // Assuming userId from authentication middleware

    // Validate required fields
    if (!documentTitle || !documentShortDescription || !projectId) {
      return res.status(400).json({
        success: false,
        message:
          "Document title, short description, and project ID are required.",
      });
    }

    // Check if project exists and belongs to the user (optional, but good for security)
    const project = await Project.findOne({
      _id: projectId,
      userId: creatorId,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have permission to add documents to it.",
      });
    }

    // Get the user's username for the 'createdUser' field
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Creator user not found.",
      });
    }
    const createdUser = user.username;

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `project_documents/${projectId}`, // Organize uploads by project
      resource_type: "auto", // Automatically detect file type
    });

    // Create new document in the database
    const newDocument = await Document.create({
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      cloudinaryLink: result.secure_url, // Store the secure Cloudinary URL
    });

    // Remove the temporary file after upload
    // fs.unlinkSync(req.file.path); // You'll need 'fs' module for this

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully!",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
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
 * @access Private (requires authentication middleware)
 */
const getDocumentsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; // Authenticated user ID

    // Optional: Verify if the user has access to this project
    const project = await Project.findOne({ _id: projectId, userId: userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have permission to view its documents.",
      });
    }

    const documents = await Document.find({ projectId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching documents.",
      error: error.message,
    });
  }
};

/**
 * @desc Save a newly generated document (without file upload)
 * @route POST /api/documents/generate
 * @access Private (requires authentication middleware)
 */
const saveGeneratedDocument = async (req, res) => {
  try {
    const {
      documentTitle,
      documentShortDescription,
      documentFullDescription,
      projectId,
    } = req.body;
    const creatorId = req.user.id; // Assuming userId from authentication middleware

    // Validate required fields
    if (
      !documentTitle ||
      !documentShortDescription ||
      !documentFullDescription ||
      !projectId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Document title, short description, full description, and project ID are required.",
      });
    }

    // Check if project exists and belongs to the user
    const project = await Project.findOne({
      _id: projectId,
      userId: creatorId,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you do not have permission to add documents to it.",
      });
    }

    // Get the user's username
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Creator user not found.",
      });
    }
    const createdUser = user.username;

    // Create new document in the database
    const newDocument = await Document.create({
      creatorId,
      projectId,
      documentTitle,
      documentShortDescription,
      createdUser,
      // For generated documents, you might store the full content directly
      // or process it into a file and upload to Cloudinary.
      // For this example, we'll just save the metadata.
      // If you want to store the full content, add a 'documentFullContent' field to your model.
      // documentFullContent: documentFullDescription,
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
      message: "Internal server error while saving generated document.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByProjectId,
  saveGeneratedDocument,
};
