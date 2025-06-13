const express = require('express');
const router = express.Router();
const jiraController = require('../controllers/jiraController');
const protect = require('../middleware/authMiddleware'); // Assuming you have an authentication middleware

// Route to add/update Jira details. userId is expected in the request body.
router.post('/add', jiraController.addJiraDetails); // Added 'protect' middleware here

// Route to get Jira details for a specific user. userId is in the URL parameter.
// Use protect middleware to ensure only the authenticated user can access their details
router.get('/details/:userId', jiraController.getJiraDetails);

// Route to delete Jira details for a specific user. userId is in the URL parameter.
// Use protect middleware to ensure only the authenticated user can delete their details
router.delete('/delete/:userId', jiraController.deleteJiraDetails);

module.exports = router;
