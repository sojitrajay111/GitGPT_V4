const express = require('express');
const router = express.Router();
const Notification = require('../models/Notificationmodel'); // Adjust path as needed
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// @route GET /api/notifications/:userId
// @desc Get all notifications for a specific user
// @access Private (only the user themselves or an admin can access)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the authenticated user is accessing their own notifications
    // Or, if you want an admin to view, add an isAdmin check
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these notifications.' });
    }

    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('senderId', 'username githubId avatarUrl') // Populate sender details if needed
      .select('-__v'); // Exclude the version key

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// @route PUT /api/notifications/:notificationId/read
// @desc Mark a notification as read
// @access Private (only the receiver can mark as read)
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // Ensure the authenticated user is the receiver of this notification
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
});

module.exports = router;
