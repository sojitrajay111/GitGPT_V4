"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch, // Re-added Switch for notifications
} from "@mui/material";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useParams } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";
import { toast } from "react-toastify";
import { useUpdateUserProfileMutation, useUpdateUserPasswordMutation, useForgotPasswordMutation } from "@/features/userProfileApiSlice";

export default function ProfileSettings() {
  const { userId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSaving, setIsSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [darkMode, setDarkMode] = useState(false); // Keep darkMode state for theme application based on localStorage

  // State for Notifications (static as per request)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(true);

  const { data, isLoading, isError, refetch } = useGetUserAndGithubDataQuery(userId);
  const [updateProfile] = useUpdateUserProfileMutation();
  const [updatePassword] = useUpdateUserPasswordMutation();
  const [forgotPassword] = useForgotPasswordMutation();

  const defaultUser = {
    username: "Loading... ",
    email: "Loading...",
    avatarUrl: "https://placehold.co/150x150/d1e0fc/3b82f6?text=User",
    githubUsername: "loading",
  };

  const user = data?.user || defaultUser;
  const githubData = data?.githubData || {};

  const displayUsername = user.username;
  const displayEmail = githubData.githubEmail || user.email;
  const displayAvatarUrl = githubData.avatarUrl || user.avatarUrl || "https://placehold.co/150x150/d1e0fc/3b82f6?text=User";
  const displayGithubUsername = githubData.githubUsername;

  useEffect(() => {
    if (user && !isLoading) {
      setUsername(user.username);
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Load theme from localStorage on component mount and listen for changes
    const updateThemeFromStorage = () => {
      const savedTheme = localStorage.getItem("theme");
      setDarkMode(savedTheme === "dark");
    };

    updateThemeFromStorage(); // Initial load

    // Listen for storage changes from other tabs/windows (including sidebar)
    window.addEventListener("storage", updateThemeFromStorage);

    return () => {
      window.removeEventListener("storage", updateThemeFromStorage);
    };
  }, []);

  useEffect(() => {
    // Apply theme to body class based on darkMode state to ensure global styles are applied
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);


  const handleEdit = () => {
    setUsername(displayUsername);
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ userId, username }).unwrap();
      await refetch();
      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbarMessage(error.data?.message || "Error updating profile");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setUsername(displayUsername);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePasswordUpdate = async () => {
    try {
      setPasswordError("");

      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      // Password validation
      if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long");
        return;
      }

      if (!/[A-Z]/.test(newPassword)) {
        setPasswordError("Password must contain at least one uppercase letter");
        return;
      }

      if (!/[a-z]/.test(newPassword)) {
        setPasswordError("Password must contain at least one lowercase letter");
        return;
      }

      if (!/[0-9]/.test(newPassword)) {
        setPasswordError("Password must contain at least one number");
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        setPasswordError("Password must contain at least one special character");
        return;
      }

      setIsUpdatingPassword(true);
      await updatePassword({ userId, currentPassword, newPassword }).unwrap();

      setSnackbarMessage("Password updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.data?.message || "Error updating password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordError("");
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address.");
      return;
    }

    setIsSendingResetLink(true);
    try {
      await forgotPassword(forgotPasswordEmail).unwrap();
      setSnackbarMessage("We've sent a password reset link to your email.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setForgotPasswordDialogOpen(false);
      setForgotPasswordEmail("");
    } catch (error) {
      console.error("Error sending reset link:", error);
      setForgotPasswordError(error.data?.message || "Error sending reset link. Please try again.");
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const handleAvatarClick = () => {
    toast.info("Avatar upload functionality coming soon!");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        py: 4,
        px: 2,
        backgroundColor: darkMode ? "#1a202c" : "#f7fafc", // Tailwind dark:bg-gray-900 / light:bg-gray-50
        color: darkMode ? "#e2e8f0" : "#2d3748", // Tailwind dark:text-gray-200 / light:text-gray-800
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 600, // Increased max width for more fields
          width: "100%",
          background: darkMode ? "#2d3748" : "rgba(255, 255, 255, 0.95)", // Tailwind dark:bg-gray-800 / light:bg-white
          border: `1px solid ${darkMode ? "rgba(45, 55, 72, 0.8)" : "rgba(255, 255, 255, 0.8)"}`,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s ease-in-out, background-color 0.3s",
          "&:hover": {
            transform: "translateY(-3px)",
          },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 4, color: darkMode ? "#edf2f7" : "#1a202c" }} // Tailwind dark:text-gray-100 / light:text-gray-900
        >
          Profile Settings
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ p: 2 }}>
            Error loading profile.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              alt={username}
              src={displayAvatarUrl}
              onClick={handleAvatarClick}
              sx={{
                width: 120,
                height: 120,
                mb: 3,
                border: "3px solid #3b82f6",
                boxShadow: "0 3px 10px rgba(59, 130, 246, 0.3)",
                transition: "transform 0.2s ease-in-out",
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/150x150/d1e0fc/3b82f6?text=User";
              }}
            />
            <Typography variant="h5" sx={{ mt: 1, mb: 0.5, color: darkMode ? "#edf2f7" : "#1a202c" }}>
              {displayUsername}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: darkMode ? "#a0aec0" : "#4a5568" }}>
              Senior Developer
            </Typography>

            {/* Profile Information Section */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? "#edf2f7" : "#1a202c" }}>
                Profile Information
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  value={editMode ? username : displayUsername}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  InputProps={{
                    readOnly: !editMode,
                    style: { color: darkMode ? "#e2e8f0" : "#2d3748" },
                  }}
                  InputLabelProps={{
                    style: { color: darkMode ? "#a0aec0" : "#4a5568" },
                  }}
                />
                <TextField
                  label="Email Address"
                  variant="outlined"
                  value={displayEmail}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: { color: darkMode ? "#e2e8f0" : "#2d3748" },
                  }}
                  InputLabelProps={{
                    style: { color: darkMode ? "#a0aec0" : "#4a5568" },
                  }}
                />
                <TextField
                  label="Job Title"
                  variant="outlined"
                  value="Senior Developer" // Static
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: { color: darkMode ? "#e2e8f0" : "#2d3748" },
                  }}
                  InputLabelProps={{
                    style: { color: darkMode ? "#a0aec0" : "#4a5568" },
                  }}
                />
                <TextField
                  label="Department"
                  variant="outlined"
                  value="Engineering" // Static
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: { color: darkMode ? "#e2e8f0" : "#2d3748" },
                  }}
                  InputLabelProps={{
                    style: { color: darkMode ? "#a0aec0" : "#4a5568" },
                  }}
                />
              </Box>
            </Box>

            {/* Preferences Section - Language only */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? "#edf2f7" : "#1a202c" }}>
                Preferences
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="body1" sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
                  Choose your preferred language
                </Typography>
                <select
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${darkMode ? '#4a5568' : '#cbd5e0'}`, // Tailwind dark:border-gray-600 / light:border-gray-300
                    backgroundColor: darkMode ? '#2d3748' : '#fff',
                    color: darkMode ? '#e2e8f0' : '#2d3748',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="english">English</option>
                  {/* Add more language options as needed */}
                </select>
              </Box>
            </Box>

            {/* Notifications Section */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? "#edf2f7" : "#1a202c" }}>
                Notifications
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: darkMode ? "#e2e8f0" : "#2d3748" }}>
                      Email Notifications
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
                      Receive updates via email
                    </Typography>
                  </Box>
                  <Switch
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: darkMode ? "#e2e8f0" : "#2d3748" }}>
                      Push Notifications
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
                      Receive browser notifications
                    </Typography>
                  </Box>
                  <Switch
                    checked={pushNotifications}
                    onChange={() => setPushNotifications(!pushNotifications)}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: darkMode ? "#e2e8f0" : "#2d3748" }}>
                      Project Updates
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
                      Get notified about project changes
                    </Typography>
                  </Box>
                  <Switch
                    checked={projectUpdates}
                    onChange={() => setProjectUpdates(!projectUpdates)}
                  />
                </Box>
              </Box>
            </Box>

            {/* Security Section */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? "#edf2f7" : "#1a202c" }}>
                Security
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{
                    justifyContent: "flex-start",
                    borderColor: darkMode ? "#4a5568" : "#cbd5e0",
                    color: darkMode ? "#e2e8f0" : "#2d3748",
                    "&:hover": {
                      borderColor: darkMode ? "#a0aec0" : "#a0aec0",
                      color: darkMode ? "#e2e8f0" : "#2d3748",
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  Change Password
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    justifyContent: "flex-start",
                    borderColor: darkMode ? "#4a5568" : "#cbd5e0",
                    color: darkMode ? "#e2e8f0" : "#2d3748",
                    "&:hover": {
                      borderColor: darkMode ? "#a0aec0" : "#a0aec0",
                      color: darkMode ? "#e2e8f0" : "#2d3748",
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  Two-Factor Authentication
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    justifyContent: "flex-start",
                    borderColor: "#ef4444", // Tailwind red-500
                    color: "#ef4444",
                    "&:hover": {
                      borderColor: "#dc2626", // Tailwind red-600
                      color: "#dc2626",
                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                    },
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 4, width: "100%", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving}
                sx={{
                  backgroundColor: "#3b82f6", // Tailwind blue-500
                  "&:hover": {
                    backgroundColor: "#2563eb", // Tailwind blue-600
                  },
                }}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderColor: darkMode ? "#4a5568" : "#cbd5e0", // Tailwind dark:border-gray-600 / light:border-gray-300
                  color: darkMode ? "#a0aec0" : "#4a5568", // Tailwind dark:text-gray-400 / light:text-gray-700
                  "&:hover": {
                    borderColor: darkMode ? "#a0aec0" : "#a0aec0",
                    color: darkMode ? "#e2e8f0" : "#2d3748",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc", color: darkMode ? "#e2e8f0" : "#2d3748" }}>Change Password</DialogTitle>
        <DialogContent sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc", pt: 2 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Current Password"
            type="password"
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: darkMode ? "#a0aec0" : "#4a5568" } }}
            InputProps={{ style: { color: darkMode ? "#e2e8f0" : "#2d3748" } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="New Password"
            type="password"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: darkMode ? "#a0aec0" : "#4a5568" } }}
            InputProps={{ style: { color: darkMode ? "#e2e8f0" : "#2d3748" } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm New Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: darkMode ? "#a0aec0" : "#4a5568" } }}
            InputProps={{ style: { color: darkMode ? "#e2e8f0" : "#2d3748" } }}
          />
          {passwordError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {passwordError}
            </Typography>
          )}
          <Button onClick={() => setForgotPasswordDialogOpen(true)} color="primary" sx={{ textTransform: "none", color: "#3b82f6" }}>
            Forgot Password?
          </Button>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc" }}>
          <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
            Cancel
          </Button>
          <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword} variant="contained" sx={{ backgroundColor: "#3b82f6", "&:hover": { backgroundColor: "#2563eb" } }}>
            {isUpdatingPassword ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordDialogOpen} onClose={() => setForgotPasswordDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc", color: darkMode ? "#e2e8f0" : "#2d3748" }}>Forgot Password</DialogTitle>
        <DialogContent sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc", pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Enter your email to receive a reset link"
            type="email"
            variant="outlined"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: darkMode ? "#a0aec0" : "#4a5568" } }}
            InputProps={{ style: { color: darkMode ? "#e2e8f0" : "#2d3748" } }}
          />
          {forgotPasswordError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? "#2d3748" : "#f7fafc" }}>
          <Button onClick={() => setForgotPasswordDialogOpen(false)} sx={{ color: darkMode ? "#a0aec0" : "#4a5568" }}>
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} disabled={isSendingResetLink} variant="contained" sx={{ backgroundColor: "#3b82f6", "&:hover": { backgroundColor: "#2563eb" } }}>
            {isSendingResetLink ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}