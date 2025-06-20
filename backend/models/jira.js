const mongoose = require('mongoose');

const JiraSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for authentication
    required: true,
    unique: true, // Each user can only have one set of Jira details
  },
  jiraUrl: {
    type: String,
    required: true,
  },
  jiraEmail: {
    type: String,
    required: true,
  },
  jiraToken: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Jira = mongoose.model('Jira', JiraSchema);

module.exports = Jira;
