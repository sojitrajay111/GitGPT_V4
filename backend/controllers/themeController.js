// controllers/themeController.js
const ThemePreference = require("../models/ThemePreference");
const asyncHandler = require("express-async-handler"); // Assuming you use express-async-handler

/**
 * @desc    Get user's theme preference
 * @route   GET /api/theme/:userId
 * @access  Private (user must be authenticated)
 */
const getThemePreference = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Ensure the authenticated user is requesting their own theme or has appropriate permissions
  // In a real application, you'd verify req.user.id === userId
  // For this example, we'll assume userId from params is sufficient for demo purposes
  if (!req.user || req.user.id !== userId) {
    return res
      .status(403)
      .json({ message: "Not authorized to access this theme preference." });
  }

  const themePreference = await ThemePreference.findOne({ userId });

  if (themePreference) {
    res.status(200).json(themePreference);
  } else {
    // If no preference found, return default
    res.status(200).json({ userId, theme: "light" });
  }
});

/**
 * @desc    Update user's theme preference
 * @route   PUT /api/theme/:userId
 * @access  Private (user must be authenticated)
 */
const updateThemePreference = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { theme } = req.body;

  // Ensure the authenticated user is updating their own theme or has appropriate permissions
  // In a real application, you'd verify req.user.id === userId
  // For this example, we'll assume userId from params is sufficient for demo purposes
  if (!req.user || req.user.id !== userId) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this theme preference." });
  }

  if (!theme || !["light", "dark"].includes(theme)) {
    return res
      .status(400)
      .json({ message: "Invalid theme value. Must be 'light' or 'dark'." });
  }

  const themePreference = await ThemePreference.findOneAndUpdate(
    { userId },
    { theme },
    { new: true, upsert: true, setDefaultsOnInsert: true } // upsert: create if not exists
  );

  res.status(200).json(themePreference);
});

module.exports = {
  getThemePreference,
  updateThemePreference,
};
