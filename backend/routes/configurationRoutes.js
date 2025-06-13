const express = require('express');
const router = express.Router();
const configurationController = require('../controllers/configurationController');
const protect = require('../middleware/authMiddleware');

// All routes are protected and require authentication
router.use(protect);

// Get all configurations for a user
router.get('/:userId', configurationController.getConfigurations);

// Add or update a configuration
router.post('/:userId', configurationController.addOrUpdateConfiguration);

// Delete a configuration
router.delete('/:userId/:configTitle', configurationController.deleteConfiguration);

// Toggle configuration status
router.patch('/:userId/:configTitle/toggle', configurationController.toggleConfigurationStatus);

module.exports = router;