const mongoose = require('mongoose');

const gptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gptName: {
    type: String,
    required: [true, 'GPT name is required'],
    enum: ['Gemini', 'ChatGPT', 'Copilot', 'Claude']
  },
  gptModel: {
    type: String,
    required: [true, 'GPT model is required']
  },
  apiKey: {
    type: String,
    required: [true, 'API key is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GPT', gptSchema); 