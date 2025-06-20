const mongoose = require("mongoose");

const CodeAnalysisMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeAnalysisSession",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "ai", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Optional fields for AI-generated code or PR links
    generatedCode: {
      type: String,
    },
    prUrl: {
      type: String,
    },
    isError: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model(
  "CodeAnalysisMessage",
  CodeAnalysisMessageSchema
);
