const axios = require('axios');
const Jira = require('../models/Jira'); // Import the new Jira model
// const User = require('../models/User'); // User model might not be directly needed here

/**
 * Verifies Jira credentials by attempting to connect to the Jira API.
 * This function is used internally by addJiraDetails and can also be exposed for standalone verification.
 * @param {string} jiraUrl - The base URL of the Jira instance.
 * @param {string} jiraEmail - The Jira user's email.
 * @param {string} jiraToken - The Jira API token.
 * @returns {Promise<object>} - An object containing success status and account data on success, or an error.
 */
const verifyJiraCredentialsInternal = async (jiraUrl, jiraEmail, jiraToken) => {
  if (!jiraUrl || !jiraEmail || !jiraToken) {
    return { success: false, message: 'Missing required fields for verification.' };
  }

  const authString = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    const response = await axios.get(`${jiraUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${authString}`,
        Accept: 'application/json'
      }
    });
    return { success: true, account: response.data };
  } catch (err) {
    console.error('Jira verification failed:', err.response ? err.response.data : err.message);
    return { success: false, message: 'Invalid Jira credentials or URL.' };
  }
};

/**
 * Handles adding and verifying Jira details for a user.
 * If credentials are valid, they are stored/updated in the database.
 * @param {object} req - The request object, should contain userId, jira details in body.
 * @param {object} res - The response object.
 */
exports.addJiraDetails = async (req, res) => {
  const { userId, jiraUrl, jiraEmail, jiraToken } = req.body; // userId now comes from req.body

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required in the request body.' });
  }

  // First, verify the provided Jira credentials
  const verificationResult = await verifyJiraCredentialsInternal(jiraUrl, jiraEmail, jiraToken);

  if (!verificationResult.success) {
    return res.status(401).json(verificationResult); // Return verification error
  }

  try {
    // Check if Jira details already exist for this user
    let jiraDetails = await Jira.findOne({ userId });

    if (jiraDetails) {
      // If exists, update the existing details
      jiraDetails.jiraUrl = jiraUrl;
      jiraDetails.jiraEmail = jiraEmail;
      jiraDetails.jiraToken = jiraToken;
      await jiraDetails.save();
      return res.json({ success: true, message: 'Jira details updated successfully.', account: verificationResult.account });
    } else {
      // If not exists, create new details
      jiraDetails = new Jira({
        userId,
        jiraUrl,
        jiraEmail,
        jiraToken,
      });
      await jiraDetails.save();
      return res.status(201).json({ success: true, message: 'Jira details added successfully.', account: verificationResult.account });
    }
  } catch (err) {
    console.error('Error saving Jira details:', err);
    return res.status(500).json({ success: false, message: 'Server error while saving Jira details.' });
  }
};

/**
 * Retrieves Jira details for a specific user.
 * @param {object} req - The request object, should contain userId from params.
 * @param {object} res - The response object.
 */
exports.getJiraDetails = async (req, res) => {
  const userId = req.params.userId; // userId now comes from req.params

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required in the URL parameters.' });
  }

  try {
    const jiraDetails = await Jira.findOne({ userId }).select('-jiraToken'); // Do not send token back
    if (!jiraDetails) {
      return res.status(404).json({ success: false, message: 'Jira details not found for this user.' });
    }
    return res.json({ success: true, data: jiraDetails });
  } catch (err) {
    console.error('Error fetching Jira details:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching Jira details.' });
  }
};

/**
 * Deletes Jira details for a specific user.
 * @param {object} req - The request object, should contain userId from params.
 * @param {object} res - The response object.
 */
exports.deleteJiraDetails = async (req, res) => {
  const userId = req.params.userId; // userId now comes from req.params

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required in the URL parameters.' });
  }

  try {
    const result = await Jira.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Jira details not found for this user to delete.' });
    }
    return res.json({ success: true, message: 'Jira details deleted successfully.' });
  } catch (err) {
    console.error('Error deleting Jira details:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting Jira details.' });
  }
};
