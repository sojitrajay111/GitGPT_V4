const express = require('express');
const router = express.Router();
const userController = require('../controllers/userManagementController');
const authenticateUser = require("../middleware/authMiddleware");

// Route to check if a user (by email) exists - NOW VERIFIES USERNAME IN CONTROLLER
router.post('/check-existence',userController.checkUserExistence); // Note: 'protect' middleware might be needed here based on your overall auth strategy

// Route to add a new user (sends invitation email)
// The :managerId parameter is now used to identify the manager adding the user
router.post('/:managerId/add-user',userController.addUser); // Add protect here if only authenticated users can add new users

// Route to get all developers associated with a specific manager
router.get('/:managerId/developers',userController.getUsersByManager); // New route for manager-specific developers

// Route to get all users (this route will now only be used for an admin-like view if needed, or can be removed if not)
// For manager view, use the new /:managerId/developers route
router.get('/',userController.getUsers); // Keep this if you have other uses for fetching all users without manager filter

// Route to update a user (e.g., edit details, change status manually)
router.put('/:id',userController.updateUser);

// Route to delete a user
router.delete('/:id',userController.deleteUser);

// Public route for accepting an invitation (no 'protect' middleware here)
router.get('/accept-invitation/:token',userController.acceptInvitation);

// NEW ROUTE: Public route for resetting password (no 'protect' middleware here)
router.post('/auth/reset-password',userController.resetPassword);

module.exports = router;