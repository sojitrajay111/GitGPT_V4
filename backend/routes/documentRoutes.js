const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocumentsByProjectId,
  saveGeneratedDocument,
  updateDocument, // Added
  deleteDocument, // Added
  initGoogleDrive, // Added
} = require("../controllers/documentController");
const authenticateUser = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for memory storage
// This stores the file in memory as req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: Limit file size (e.g., 10MB)
  fileFilter: function (req, file, cb) {
    // Optional: Filter file types (e.g., only PDFs)
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, DOCX, and TXT are allowed."),
        false
      );
    }
  },
});

// @route POST /api/documents/init-google-drive
// @desc Initialize Google Drive connection
// @access Private
router.post("/init-google-drive", authenticateUser, initGoogleDrive);

// @route POST /api/documents/upload
// @desc Upload a new document (with file)
// @access Private
router.post(
  "/upload",
  authenticateUser,
  upload.single("documentFile"), // 'documentFile' should match the FormData key from frontend
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

// @route PUT /api/documents/:documentId
// @desc Update an existing document (metadata and/or file)
// @access Private
router.put(
  "/:documentId",
  authenticateUser,
  upload.single("documentFile"), // For optional new file upload
  updateDocument
);

// @route DELETE /api/documents/:documentId
// @desc Delete a document
// @access Private
router.delete("/:documentId", authenticateUser, deleteDocument);

module.exports = router;
