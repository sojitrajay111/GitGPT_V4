const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocumentsByProjectId,
  saveGeneratedDocument,
} = require("../controllers/documentController");
const authenticateUser = require("../middleware/authMiddleware"); // Assuming you have an authentication middleware
const multer = require("multer"); // For handling file uploads

// Configure multer for file storage
// For production, consider using 'multer-storage-cloudinary' or similar
// For local temporary storage:
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure 'uploads/' directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// @route POST /api/documents/upload
// @desc Upload a new document (with file)
// @access Private
router.post(
  "/upload",
  authenticateUser,
  upload.single("documentFile"),
  uploadDocument
);

// @route POST /api/documents/generate
// @desc Save a newly generated document (no file upload, just metadata/content)
// @access Private
router.post("/generate", authenticateUser, saveGeneratedDocument);

// @route GET /api/documents/project/:projectId
// @desc Get all documents for a specific project
// @access Private
router.get("/project/:projectId", authenticateUser, getDocumentsByProjectId);

module.exports = router;
