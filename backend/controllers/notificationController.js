const Notification = require('../models/Notificationmodel');

exports.sendUserStoryAssignmentNotifications = async (req, res) => {
  try {
    const { collaboratorIds, userStoryTitle, projectId, projectName } = req.body;
    const senderId = req.user.id;

    if (!Array.isArray(collaboratorIds) || !userStoryTitle || !projectId || !projectName) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Create notifications for each collaborator
    const notifications = await Promise.all(
      collaboratorIds.map(async (receiverId) => {
        return await Notification.create({
          senderId,
          receiverId,
          message: `You have been assigned to the user story "${userStoryTitle}" in project "${projectName}".`,
          projectId,
          projectName,
        });
      })
    );

    res.status(200).json({ message: 'Notifications sent.', notifications });
  } catch (error) {
    console.error('Error sending user story assignment notifications:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

exports.getNotificationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these notifications.' });
    }
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username githubId avatarUrl')
      .select('-__v');
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    if (req.user.id !== notification.receiverId.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this notification as read.' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    if (req.user.id !== notification.receiverId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification.' });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
}; 