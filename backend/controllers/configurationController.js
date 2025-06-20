const Configuration = require('../models/Configuration');
const Company = require('../models/Company');

// Get all configurations for a user
exports.getConfigurations = async (req, res) => {
  try {
    const { userId } = req.params;
    const configurations = await Configuration.find({ userId });
    
    res.json({
      success: true,
      data: configurations
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configurations',
      error: error.message
    });
  }
};

// Add or update a configuration
exports.addOrUpdateConfiguration = async (req, res) => {
  try {
    const { userId } = req.params;
    const { configTitle, configValue, isActive } = req.body;

    // Find existing configuration
    let configuration = await Configuration.findOne({
      userId,
      configTitle
    });

    if (configuration) {
      // Update existing configuration
      configuration.configValue = configValue;
      if (typeof isActive === 'boolean') {
        configuration.isActive = isActive;
      }
      await configuration.save();
      return res.json({
        success: true,
        message: 'Configuration updated successfully',
        data: configuration
      });
    } else {
      // Create new configuration
      configuration = new Configuration({
        userId,
        configTitle,
        configValue,
        isActive: isActive ?? true
      });
      await configuration.save();
      return res.status(201).json({
        success: true,
        message: 'Configuration created successfully',
        data: configuration
      });
    }
  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving configuration',
      error: error.message
    });
  }
};

// Delete a configuration
exports.deleteConfiguration = async (req, res) => {
  try {
    const { userId, configTitle } = req.params;

    const result = await Configuration.deleteOne({
      userId,
      configTitle
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting configuration',
      error: error.message
    });
  }
};

// Toggle configuration status
exports.toggleConfigurationStatus = async (req, res) => {
  try {
    const { userId, configTitle } = req.params;

    const configuration = await Configuration.findOne({
      userId,
      configTitle
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    configuration.isActive = !configuration.isActive;
    await configuration.save();

    res.json({
      success: true,
      message: Configuration `${configuration.isActive ? 'activated' : 'deactivated'} successfully`,
      data: configuration
    });
  } catch (error) {
    console.error('Error toggling configuration status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling configuration status',
      error: error.message
    });
  }
};