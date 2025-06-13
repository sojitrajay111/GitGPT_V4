const express = require('express');
const router = express.Router();
const {
  verifyApiKey,
  addGptDetails,
  getGptDetails,
  deleteGptDetails
} = require('../controllers/gptController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/verify', verifyApiKey);
router.route('/')
  .post(addGptDetails)
  .get(getGptDetails);
router.delete('/:id', deleteGptDetails);

module.exports = router; 