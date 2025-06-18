// routes/metricsRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have auth middleware
const { getProjectMetrics } = require("../controllers/metricsController");

// @route   GET /api/metrics/:projectId
// @desc    Get project metrics, including AI/Developer collaboration data
// @access  Private (requires authentication)
router.get("/:projectId", authMiddleware, getProjectMetrics);

module.exports = router;
