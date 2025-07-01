const ProjectCollaborator = require('../models/ProjectCollaborator');
const Notification = require('../models/Notificationmodel'); // Ensure this path is correct
const User = require('../models/User'); // Assuming User model for sender/receiver ID lookup
const Project = require('../models/Project'); // Assuming you have a Project model to get projectName
const GithubData = require('../models/GithubData'); // Import GithubData model

exports.addCollaborator = async (req, res) => {
  const { created_user_id, project_id, collaborator } = req.body; // created_user_id is the manager's ID (sender)

  try {
    // 1. Find the project to get its name
    const project = await Project.findById(project_id); // Assuming 'Project' is your Mongoose model for projects
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // 2. Find the developer (receiver) by GitHub ID in GithubData
    const githubData = await GithubData.findOne({ githubId: String(collaborator.githubId) });
    if (!githubData) {
      return res.status(404).json({ message: 'Collaborator (GitHub developer account) not found in the system. They must sign up first.' });
    }
    const developer = await User.findById(githubData.userId);
    if (!developer) {
      return res.status(404).json({ message: 'User not found for this GitHub account.' });
    }

    // 3. Add or update the collaborator in ProjectCollaborator
    // Check if the collaborator already exists for this project created by this manager
    let existingProjectCollaborator = await ProjectCollaborator.findOne({ created_user_id, project_id });

    if (!existingProjectCollaborator) {
      // Create new entry if it doesn't exist
      existingProjectCollaborator = new ProjectCollaborator({
        created_user_id,
        project_id,
        collaborators: [],
      });
    }

    // Check if the specific collaborator (by username or githubId) is already in the project's collaborators array
    const isCollaboratorAlreadyAdded = existingProjectCollaborator.collaborators.some(
      (col) => col.githubId === collaborator.githubId
    );

    if (isCollaboratorAlreadyAdded) {
      return res.status(409).json({ message: 'This collaborator is already part of the project.' });
    }

    existingProjectCollaborator.collaborators.push({
      username: collaborator.username,
      githubId: collaborator.githubId,
      avatarUrl: collaborator.avatarUrl,
      permissions: collaborator.permissions,
      status: 'pending', // Or 'accepted' if auto-approved
    });

    await existingProjectCollaborator.save();

    // 4. Create and send a notification
    // The manager (created_user_id) is the sender, the developer is the receiver.
    const notificationMessage =
      `You have been added to the project "${project.projectName}" by a project manager.`;

    const notification = await Notification.create({
      senderId: created_user_id, // Manager's ID
      receiverId: developer._id, // Developer's ID
      message: notificationMessage,
      projectId: project_id,
      projectName: project.projectName,
    });

    // 5. Send GitHub invitation
    try {
      const repoFullName = project.githubRepoLink
        .replace('https://github.com/', '')
        .replace(/\.git$/, '');
      const managerGithubData = await GithubData.findOne({ userId: created_user_id });
      if (managerGithubData && managerGithubData.githubPAT) {
        const response = await fetch(
          `https://api.github.com/repos/${repoFullName}/collaborators/${collaborator.username}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `token ${managerGithubData.githubPAT}`,
              'User-Agent': managerGithubData.githubUsername || 'GitGPT-App',
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ permission: 'push' }), // Optional: set permission
          }
        );
        if (![201, 204].includes(response.status)) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to invite collaborator on GitHub:', errorData);
          // Optionally, handle this error (e.g., notify the manager)
        }
      }
    } catch (err) {
      console.error('Error sending GitHub invitation:', err);
    }

    // Send real-time notification via Socket.IO if available
    // const io = getIO?.();
    // if (io) {
    //   // Emit to the specific developer's socket
    //   io.to(developer._id.toString()).emit('new-notification', notification);
    // }

    res.status(200).json({
      message: 'Collaborator added and notified successfully',
      projectCollaborator: existingProjectCollaborator, // Return the updated collaborator entry
    });
  } catch (err) {
    console.error('Error in addCollaborator:', err);
    // Provide a more specific error message if possible
    res.status(500).json({ error: 'Error adding collaborator', details: err.message });
  }
};

// You would add similar logic for other actions that generate notifications, e.g.:
// - Manager assigns PR to developer: senderId (manager), receiverId (developer)
// - Developer submits PR: senderId (developer), receiverId (manager)
// - Developer requests review: senderId (developer), receiverId (reviewer)
// - PR approved/rejected: senderId (reviewer), receiverId (PR creator)
