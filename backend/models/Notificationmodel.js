const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user who receives the notification (the original userId field)
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who sent the notification (new field)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: { // This will contain the full text (e.g., "Manager X added you to Project Y")
    type: String,
    required: true,
  },
  link: { // Optional link to related resource
    type: String,
  },
  isRead: { // Status of the notification
    type: Boolean,
    default: false,
  },
  projectId: { // Stored for easy access and filtering
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true, // Making it required as per your request to include project details
  },
  projectName: { // Stored for easy display without extra lookups
    type: String,
    required: true, // Making it required
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Notificationmodel =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = Notificationmodel;
