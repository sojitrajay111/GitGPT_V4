const express = require('express');
const router = express.Router();
const Notification = require('../models/Notificationmodel'); // Adjust path as needed
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have authentication middleware
const notificationController = require('../controllers/notificationController');

// @route GET /api/notifications/:userId
// @desc Get all notifications for a specific user
// @access Private (only the user themselves or an admin can access)
router.get('/:userId', authMiddleware, notificationController.getNotificationsForUser);

// @route PUT /api/notifications/:notificationId/read
// @desc Mark a notification as read
// @access Private (only the receiver can mark as read)
router.put('/:notificationId/read', authMiddleware, notificationController.markNotificationAsRead);

// @route POST /api/notifications/user-story-assignment
// @desc Send notifications to collaborators assigned to a user story
// @access Private (manager only)
router.post('/user-story-assignment', authMiddleware, notificationController.sendUserStoryAssignmentNotifications);

module.exports = router;
