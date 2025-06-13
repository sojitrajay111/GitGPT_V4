// Ensure this is the very first line
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
} from "@mui/material";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useParams } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";
import { toast } from "react-toastify";

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

  const { data, isLoading, isError, refetch } = useGetUserAndGithubDataQuery(userId);

  const defaultUser = {
    username: "Loading...",
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

  const handleEdit = () => {
    setUsername(displayUsername);
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("yourAuthTokenKey");

      const response = await fetch("http://localhost:3001/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      await refetch();

      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbarMessage(error.message || "Error updating profile");
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

      if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
        return;
      }

      setIsUpdatingPassword(true);
      const token = localStorage.getItem("yourAuthTokenKey");

      const response = await fetch(
        "http://localhost:3001/api/users/update-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setSnackbarMessage("Password updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.message || "Error updating password");
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
      const response = await fetch(
        "http://localhost:3001/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotPasswordEmail }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send reset link");
      }

      const data = await response.json();
      setSnackbarMessage(
        data.message || "We've sent a password reset link to your email."
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setForgotPasswordDialogOpen(false);
      setForgotPasswordEmail("");
    } catch (error) {
      console.error("Error sending reset link:", error);
      setForgotPasswordError(
        error.message || "Error sending reset link. Please try again."
      );
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
          maxWidth: 500,
          width: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-3px)",
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ p: 2 }}>
            Error loading profile.
          </Typography>
        ) : editMode ? (
          <Box sx={{ width: "100%" }}>
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
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
              }}
              InputProps={{
                sx: {
                  fontSize: "1rem",
                  fontWeight: 500,
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={
                  isSaving ||
                  username.trim() === "" ||
                  username === displayUsername
                }
                startIcon={
                  isSaving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  background: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                  "&:hover": {
                    background: `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`,
                    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)",
                  },
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderColor: "#e5e7eb",
                  color: "#4b5563",
                  "&:hover": {
                    borderColor: "#d1d5db",
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Avatar
              alt={displayUsername}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                mb: 1,
                textAlign: "center",
              }}
            >
              {displayUsername}
            </Typography>
            {displayGithubUsername && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  color: "#64748b",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                @{displayGithubUsername}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: "#64748b",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {displayEmail}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  "&:hover": {
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(59, 130, 246, 0.04)",
                  },
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setPasswordDialogOpen(true)}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderColor: "#10b981",
                  color: "#10b981",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "rgba(16, 185, 129, 0.04)",
                  },
                }}
              >
                Change Password
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Password Update Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1e40af",
            textAlign: "center",
            pt: 3,
          }}
        >
          Change Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!passwordError}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!passwordError}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              setPasswordError("");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            sx={{
              color: "#64748b",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordUpdate}
            disabled={
              isUpdatingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 6
            }
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, #059669 0%, #047857 100%)`,
              },
            }}
          >
            {isUpdatingPassword ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update Password"
            )}
          </Button>
        </DialogActions>
        <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              setForgotPasswordDialogOpen(true);
            }}
            sx={{
              color: "#3b82f6",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
                backgroundColor: "transparent",
              },
            }}
          >
            Forgot your password?
          </Button>
        </Box>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordDialogOpen}
        onClose={() => {
          setForgotPasswordDialogOpen(false);
          setForgotPasswordError("");
          setForgotPasswordEmail("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1e40af",
            textAlign: "center",
            pt: 3,
          }}
        >
          Forgot Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 1, textAlign: "center" }}
            >
              Enter your email address to receive a password reset link.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              error={!!forgotPasswordError}
              helperText={forgotPasswordError}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setForgotPasswordDialogOpen(false);
              setForgotPasswordError("");
              setForgotPasswordEmail("");
            }}
            sx={{
              color: "#64748b",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={
              isSendingResetLink ||
              !forgotPasswordEmail ||
              !forgotPasswordEmail.includes("@")
            }
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`,
              },
            }}
          >
            {isSendingResetLink ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: 1.5,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
