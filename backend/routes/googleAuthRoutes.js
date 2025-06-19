const express = require('express'); // Make sure to import express
const router = express.Router();    // Define the router here
const { google } = require('googleapis'); // Assuming you use googleapis for OAuth2Client
const User = require('../models/User');

router.get('/oauth-callback', async (req, res) => {
  const code = req.query.code;
  let userId, projectId;
  if (req.query.state) {
    try {
      const stateObj = JSON.parse(req.query.state);
      userId = stateObj.userId;
      projectId = stateObj.projectId;
    } catch (e) {
      // fallback
    }
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3001/api/google/oauth-callback'
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in the user's record
    if (userId) {
      await User.findByIdAndUpdate(userId, { googleDriveTokens: tokens });
    }

    if (userId && projectId) {
      res.redirect(`http://localhost:3000/${userId}/create-project/${projectId}/documentation?cloud=success`);
    } else {
      res.redirect('http://localhost:3000?cloud=success');
    }
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('Authentication failed');
  }
});

// All uploads now go to the 'GitGPT documents' folder in Google Drive.

module.exports = router; // Export the router