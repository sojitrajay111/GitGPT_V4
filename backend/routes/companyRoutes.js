// server/routes/companyRoutes.js

const express = require("express");
const multer = require("multer");
const {
  addOrUpdateCompanyDetails,
  getCompanyDetails,
} = require("../controllers/companyController");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Route to add or update company details with file upload
router.post("/add-or-update/:userId", upload.single('companyLogo'), addOrUpdateCompanyDetails);

// Route to get company details by userId
router.get("/:userId", getCompanyDetails);

module.exports = router;
