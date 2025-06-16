// models/ThemePreference.js
const mongoose = require("mongoose");

const themePreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to your User model
      required: true,
      unique: true, // Each user can only have one theme preference entry
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light", // Default theme
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const ThemePreference =
  mongoose.models.ThemePreference ||
  mongoose.model("ThemePreference", themePreferenceSchema);
module.exports = ThemePreference;
