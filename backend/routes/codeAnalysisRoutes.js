const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware"); // Assuming you have an auth middleware
const {
  startCodeAnalysisSession,
  getCodeAnalysisSessions,
  getCodeAnalysisMessages,
  sendCodeAnalysisMessage,
  pushCodeAndCreatePR,
} = require("../controllers/codeAnalysisController");

// Protect all routes with authentication middleware
router.use(authenticateUser);

// Session management
router.post("/sessions", startCodeAnalysisSession);
router.get("/sessions/:projectId", getCodeAnalysisSessions);
router.get("/sessions/:sessionId/messages", getCodeAnalysisMessages);
router.post("/sessions/:sessionId/messages", sendCodeAnalysisMessage);

// GitHub interaction for AI-generated code
router.post("/push-pr", pushCodeAndCreatePR);

module.exports = router;
