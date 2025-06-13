const GPT = require('../models/gptModel');
const asyncHandler = require('express-async-handler');
const axios = require('axios');

// @desc    Verify GPT API key
// @route   POST /api/gpt/verify
// @access  Private
const verifyApiKey = asyncHandler(async (req, res) => {
  console.log('Verifying API key:', { gptName: req.body.gptName });
  
  const { gptName, apiKey } = req.body;

  if (!gptName || !apiKey) {
    return res.status(400).json({
      success: false,
      message: 'GPT name and API key are required'
    });
  }

  try {
    let isValid = false;
    let message = '';

    switch (gptName) {
      case 'ChatGPT':
        // Verify OpenAI API key
        const openaiResponse = await axios.get('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        isValid = openaiResponse.status === 200;
        message = isValid ? 'OpenAI API key is valid' : 'Invalid OpenAI API key';
        break;

      case 'Gemini':
        // Verify Google API key
        const geminiResponse = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        isValid = geminiResponse.status === 200;
        message = isValid ? 'Google API key is valid' : 'Invalid Google API key';
        break;

      case 'Claude':
        // Verify Anthropic API key
        const claudeResponse = await axios.get('https://api.anthropic.com/v1/messages', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        });
        isValid = claudeResponse.status === 200;
        message = isValid ? 'Anthropic API key is valid' : 'Invalid Anthropic API key';
        break;

      case 'Copilot':
        // GitHub Copilot API verification
        const copilotResponse = await axios.get('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        isValid = copilotResponse.status === 200;
        message = isValid ? 'GitHub Copilot API key is valid' : 'Invalid GitHub Copilot API key';
        break;

      default:
        isValid = false;
        message = 'Unsupported GPT service';
    }

    console.log('Verification result:', { isValid, message });
    res.json({
      success: isValid,
      message
    });
  } catch (error) {
    console.error('API key verification error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.error?.message || 'API key verification failed'
    });
  }
});

// @desc    Add or update GPT details
// @route   POST /api/gpt
// @access  Private
const addGptDetails = asyncHandler(async (req, res) => {
  console.log('Adding/updating GPT details:', { userId: req.user.id });
  
  const { gptName, gptModel, apiKey, userId } = req.body;

  if (!gptName || !gptModel || !apiKey) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Check if GPT details already exist for this user
    let gptDetails = await GPT.findOne({ userId });

    if (gptDetails) {
      // Update existing details
      gptDetails.gptName = gptName;
      gptDetails.gptModel = gptModel;
      gptDetails.apiKey = apiKey;
      gptDetails.isVerified = true;
      await gptDetails.save();
    } else {
      // Create new GPT details
      gptDetails = await GPT.create({
        userId,
        gptName,
        gptModel,
        apiKey,
        isVerified: true
      });
    }

    console.log('GPT details saved successfully:', { id: gptDetails._id });
    res.status(201).json({
      success: true,
      message: gptDetails ? 'GPT details updated successfully' : 'GPT details added successfully',
      data: gptDetails
    });
  } catch (error) {
    console.error('Error saving GPT details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save GPT details'
    });
  }
});

// @desc    Get user's GPT details
// @route   GET /api/gpt
// @access  Private
const getGptDetails = asyncHandler(async (req, res) => {
  console.log('Getting GPT details for user:', req.user.id);
  
  try {
    const gptDetails = await GPT.findOne({ userId: req.user.id });

    if (!gptDetails) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: gptDetails
    });
  } catch (error) {
    console.error('Error getting GPT details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get GPT details'
    });
  }
});

// @desc    Delete GPT details
// @route   DELETE /api/gpt/:id
// @access  Private
const deleteGptDetails = asyncHandler(async (req, res) => {
  console.log('Deleting GPT details:', { id: req.params.id });
  
  try {
    const gptDetails = await GPT.findById(req.params.id);

    if (!gptDetails) {
      res.status(404);
      throw new Error('GPT details not found');
    }

    // Check if user owns the GPT details
    if (gptDetails.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to delete these GPT details');
    }

    await gptDetails.deleteOne();

    res.json({
      success: true,
      message: 'GPT details removed'
    });
  } catch (error) {
    console.error('Error deleting GPT details:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to delete GPT details'
    });
  }
});

module.exports = {
  verifyApiKey,
  addGptDetails,
  getGptDetails,
  deleteGptDetails
}; 