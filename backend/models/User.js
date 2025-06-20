const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    
    password: { type: String, required: false }, // Password is not required initially for invited users
    role: {
      type: String,
      enum: ["manager", "developer"],
      default: "manager",
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive"], // Simplified statuses: Pending (initial invite), Active (password set), Inactive (disabled)
      default: "Pending", // New users default to 'Pending'
    },
    isAuthenticatedToGithub: {
      type: Boolean,
      default: false,
    },
    verificationToken: String, // Field to store the JWT for email verification
    verificationTokenExpires: Date, // Field for token expiry
    passwordResetToken: String, // Field for a password reset token
    passwordResetExpires: Date, // Field for password reset token expiry
    // New fields for developers:
    managerId: {
      // The ID of the manager who added this developer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model itself
      required: function () {
        return this.role === "developer";
      }, // Required only if role is 'developer'
      default: null, // Default to null for non-developers or if not set
    },
    companyId: {
      // The ID of the company the developer belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // Reference to the Company model
      required: function () {
        return this.role === "developer";
      }, // Required only if role is 'developer'
      default: null, // Default to null for non-developers or if not set
    },
    // Optional job role for developers (e.g., Senior Developer, Analyst, etc.)
    jobRole: {
      type: String,
      default: "",
    },
    // Timestamp for the user's last successful login
    lastLogin: {
      type: Date,
      default: null, // Default to null if never logged in
    },
    googleDriveTokens: {
      type: Object, // Store the OAuth tokens object
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Add method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add method to update password (useful for direct password changes or reset flows)
userSchema.methods.updatePassword = async function (newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  return this.save();
};

// Use mongoose.models.User to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
