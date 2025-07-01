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

// Helper to fetch and validate Jira config for a user
async function getUserJiraConfig(userId) {
  const jiraConfig = await Configuration.findOne({ userId, configTitle: "Jira", isActive: true });
  if (!jiraConfig) throw new Error("Jira integration not configured.");
  const apiUrl = jiraConfig.configValue.find(v => v.key === "apiUrl")?.value;
  const email = jiraConfig.configValue.find(v => v.key === "email")?.value;
  const apiToken = jiraConfig.configValue.find(v => v.key === "apiToken")?.value;
  const projectKey = jiraConfig.configValue.find(v => v.key === "projectKey")?.value;
  if (!apiUrl || !email || !apiToken || !projectKey) throw new Error("Incomplete Jira configuration.");
  return { apiUrl, email, apiToken, projectKey };
}

// Example: Fetch Jira issues using user configuration
const fetchJiraIssues = async (req, res) => {
  try {
    const userId = req.user.id;
    const { apiUrl, email, apiToken, projectKey } = await getUserJiraConfig(userId);
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const response = await fetch(`${apiUrl}/rest/api/3/search?jql=project=${projectKey}`, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ success: false, message: `Jira API error: ${errorData}` });
    }
    const data = await response.json();
    return res.json({ success: true, issues: data.issues });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.fetchJiraIssues = fetchJiraIssues;