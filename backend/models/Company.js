// server/models/Company.js

const mongoose = require("mongoose");

// Define the Company Schema
const CompanySchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: [true, "Creator ID is required"],
      unique: true, // Assuming one company per creator ID
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
    companyUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Simple URL validation
          return /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    companyLogoUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create the Company Model
const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
