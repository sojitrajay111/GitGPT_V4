const User = require('../models/User'); // Import your consolidated User model
const Company = require('../models/Company'); // Import Company model
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // For generating and verifying tokens
const bcrypt = require('bcryptjs'); // For hashing passwords during reset

// Helper function to generate an authentication token for a user
const generateAuthToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '1h', // Standard token expiration
  });
};

// Configure Nodemailer to use Gmail service with Google App Password
const transporter = nodemailer.createTransport({
  service: 'gmail', // Specify Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., your_email@gmail.com)
    pass: process.env.EMAIL_PASS, // Your generated Google App Password
  },
});

// Helper function to generate a verification token
const generateVerificationToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  console.log('DEBUG (generateVerificationToken): Using JWT_SECRET:', jwtSecret);
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: '24h', // Token expires in 24 hours
  });
};

// Helper function to generate a password reset token
const generatePasswordResetToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  console.log('DEBUG (generatePasswordResetToken): Using JWT_SECRET:', jwtSecret);
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: '1h', // Reset token expires in 1 hour
  });
};


/**
 * @desc Check if a user with the given username already exists
 * @route POST /api/users/check-existence
 * @access Private (Auth required)
 */
exports.checkUserExistence = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required for existence check.' });
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ success: true, exists: true, message: 'User with this username already exists.' });
    } else {
      return res.json({ success: true, exists: false, message: 'Username is new and available.' });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ success: false, message: 'Server error during existence check.' });
  }
};

/**
 * @desc Add a new user and send invitation email
 * @route POST /api/users/:managerId/add-user
 * @access Private (Auth required for the manager)
 */
exports.addUser = async (req, res) => {
  const { username, email, role = 'developer', jobRole = '' } = req.body; // Accept jobRole if provided
  const { managerId } = req.params; // Get the managerId from the URL params

  if (!username || !email || !managerId) {
    return res.status(400).json({ success: false, message: 'Please enter all required fields: username, email, and manager ID.' });
  }

  try {
    // Verify that the managerId corresponds to an existing manager
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Invalid manager ID or user is not a manager.' });
    }

    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(409).json({ success: false, message: 'A user with this username already exists.' });
    }

    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    let companyId = null;
    if (role === 'developer') {
      // Find the company associated with the manager (creatorId)
      const company = await Company.findOne({ creatorId: managerId });
      if (!company) {
        return res.status(404).json({ success: false, message: 'No company found associated with this manager. Developers must be linked to a company.' });
      }
      companyId = company._id;
    }

    // Create user with 'Pending' status and no password initially
    const newUser = new User({
      username,
      email,
      role: role,
      status: 'Pending',
      password: '', // Password will be set via the reset-password flow
      // Conditionally add managerId and companyId if the role is 'developer'
      ...(role === 'developer' && { managerId: managerId, companyId: companyId }),
      ...(role === 'developer' && { jobRole }),
    });

    // Generate and save verification token
    const verificationToken = generateVerificationToken(newUser._id);
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await newUser.save();

    // The invitation link will point to the backend route which then redirects to the frontend reset page
    const invitationLink = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/accept-invitation/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitation to Join Our Platform',
      html: `
        <p>Dear ${username},</p>
        <p>You have been invited to join our platform. Please click the button below to accept your invitation and set up your password:</p>
        <p><a href="${invitationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Accept Invitation & Set Password</a></p>
        <p>This invitation link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending invitation email:', error);
      } else {
        console.log('Invitation email sent: ' + info.response);
      }
    });

    res.status(201).json({ success: true, message: 'User added and invitation email sent.', user: { id: newUser._id, username: newUser.username, email: newUser.email, status: newUser.status, role: newUser.role, managerId: newUser.managerId, companyId: newUser.companyId, jobRole: newUser.jobRole } });

  } catch (error) {
    console.error('Error adding user:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A user with this username or email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error while adding user.' });
  }
};

/**
 * @desc Accept user invitation and update status, then redirect to password reset
 * @route GET /api/users/accept-invitation/:token
 * @access Public
 */
exports.acceptInvitation = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    console.error('AcceptInvitation: No token received in params.');
    return res.status(400).send('No invitation token found.');
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    console.log('DEBUG (acceptInvitation): Using JWT_SECRET:', jwtSecret);

    const decoded = jwt.verify(token, jwtSecret);
    console.log('DEBUG (acceptInvitation): Token decoded successfully. Decoded ID:', decoded.id);

    const user = await User.findById(decoded.id);

    if (!user) {
      console.error('ERROR (acceptInvitation): User not found for decoded ID:', decoded.id);
      return res.status(404).send('User not found.');
    }

    // CRITICAL DEBUG LOG: This is the value actually retrieved from the database
    console.log('DEBUG (acceptInvitation): User found in DB. User verificationToken from DB:', user.verificationToken);
    console.log('DEBUG (acceptInvitation): Token from URL:', token);

    // This is the line that was expected to fail on reuse
    // Check if token exists in DB and matches the one received
    if (!user.verificationToken || user.verificationToken !== token) {
      console.error('ERROR (acceptInvitation): Token mismatch or already used. DB token:', user.verificationToken, 'Received token:', token);
      return res.status(400).send('This invitation link has already been used or is invalid.');
    }

    const now = new Date();
    if (user.verificationTokenExpires < now) {
      console.error('ERROR (acceptInvitation): Invitation link has expired. User ID:', user._id, 'Expiry:', user.verificationTokenExpires, 'Now:', now);
      return res.status(400).send('Invitation link has expired. Please request a new invitation.');
    }

    user.status = 'Active'; // Set status to 'Active'
    user.verificationToken = undefined; // This invalidates the token in DB
    user.verificationTokenExpires = undefined; // This invalidates the token expiry in DB

    const resetToken = generatePasswordResetToken(user._id);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();
    console.log('SUCCESS (acceptInvitation): User status updated and reset token generated for user ID:', user._id);

    res.redirect(`${process.env.NEXT_FRONTEND_URL}/reset-password?token=${resetToken}`);

  } catch (error) {
    console.error('FATAL ERROR in AcceptInvitation:', error.message, error.name, error.stack);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).send('Invitation link has expired.');
    }
    if (error.name === 'JsonWebTokenError') {
      // This could mean the JWT_SECRET is inconsistent or the token is malformed/invalid
      return res.status(400).send('Invalid invitation token. The link might be malformed or invalid.');
    }
    res.status(500).send('Server error while accepting invitation.');
  }
};

/**
 * @desc Reset user password using a reset token
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if the reset token exists and matches
    if (!user.passwordResetToken || user.passwordResetToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Check if the reset token has expired
    const now = new Date();
    if (user.passwordResetExpires < now) {
      return res.status(400).json({ success: false, message: 'Password reset token has expired. Please request a new one.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear the reset token fields after successful password update
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.status = 'Active'; // Set status to 'Active' after password is set

    await user.save();

    // Generate a new authentication token for the user who just reset their password
    const authToken = generateAuthToken(user._id);

    res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now log in.', token: authToken });

  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
};


/**
 * @desc Get all users (This route is kept for general use, but for manager-specific view, use getUsersByManager)
 * @route GET /api/users
 * @access Private (Auth required)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

/**
 * @desc Get all developers associated with a specific manager
 * @route GET /api/user-management/:managerId/developers
 * @access Private (Auth required for the manager)
 */
exports.getUsersByManager = async (req, res) => {
  const { managerId } = req.params;

  try {
    // Find users where role is 'developer' and managerId matches the provided managerId
    const developers = await User.find({ role: 'developer', managerId: managerId }).select('username email status role managerId companyId jobRole lastLogin');
    res.status(200).json({ success: true, data: developers });
  } catch (error) {
    console.error('Error fetching developers by manager ID:', error);
    res.status(500).json({ success: false, message: 'Server error fetching developers.' });
  }
};

/**
 * @desc Update a user
 * @route PUT /api/users/:id
 * @access Private (Auth required)
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, status, jobRole } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.status = status || user.status; // Allow status update
    user.jobRole = jobRole || user.jobRole; // Allow jobRole update

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A user with this username or email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error updating user.' });
  }
};

/**
 * @desc Delete a user
 * @route DELETE /api/users/:id
 * @access Private (Auth required)
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
};