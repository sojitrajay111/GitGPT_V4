// routes/themeRoutes.js
const express = require("express");
// Assuming you have an auth middleware
const {
  getThemePreference,
  updateThemePreference,
} = require("../controllers/themeController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all theme routes
router.use(authenticateUser); // This middleware should populate req.user based on the token

router.route("/:userId").get(getThemePreference).put(updateThemePreference);

module.exports = router;
