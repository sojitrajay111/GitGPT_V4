const express = require('express'); // Make sure to import express
const router = express.Router();    // Define the router here
const { google } = require('googleapis'); // Assuming you use googleapis for OAuth2Client
const User = require('../models/User');
const authenticateUser = require('../middleware/authMiddleware');

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
    'https://gitgpt-backend.onrender.com/api/google/oauth-callback'
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in the user's record
    if (userId) {
      await User.findByIdAndUpdate(userId, { googleDriveTokens: tokens });
    }

    if (userId && projectId) {
      res.redirect(`https://gitgpt-v4.vercel.app/${userId}/create-project/${projectId}/documentation?cloud=success`);
    } else {
      res.redirect('https://gitgpt-v4.vercel.app?cloud=success');
    }
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('Authentication failed');
  }
});

router.post('/disconnect-drive', authenticateUser, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    await User.findByIdAndUpdate(userId, { $unset: { googleDriveTokens: 1 } });
    res.json({ success: true, message: 'Google Drive disconnected.' });
  } catch (err) {
    console.error('Error disconnecting Google Drive:', err);
    res.status(500).json({ success: false, message: 'Failed to disconnect Google Drive.' });
  }
});

router.get('/drive-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ connected: false });
    }
    const user = await User.findById(userId);
    if (user && user.googleDriveTokens) {
      res.json({ connected: true });
    } else {
      res.json({ connected: false });
    }
  } catch (err) {
    res.status(500).json({ connected: false });
  }
});

// All uploads now go to the 'GitGPT documents' folder in Google Drive.

module.exports = router; // Export the router