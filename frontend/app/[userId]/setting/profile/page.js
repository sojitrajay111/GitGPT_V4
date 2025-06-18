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
  Switch,
  FormControlLabel, // For the Dark Mode switch
  Grid, // Import Grid for layout
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useParams } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock"; // For avatar lock overlay
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Icon for readonly fields
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'; // Icon for email field
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'; // Icon for job title
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'; // Icon for department
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'; // Icon for language
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'; // Icon for notifications
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'; // Icon for security
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import { toast } from "react-toastify";
import { useUpdateUserProfileMutation, useUpdateUserPasswordMutation, useForgotPasswordMutation } from "@/features/userProfileApiSlice";
import { useGetThemeQuery, useUpdateThemeMutation } from "@/features/themeApiSlice"; // Import useUpdateThemeMutation

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
  
  // Use theme from RTK Query
  const { data: themeData, isLoading: isThemeLoading, refetch: refetchTheme } = useGetThemeQuery(userId);
  const [updateTheme] = useUpdateThemeMutation();
  const darkMode = themeData?.theme === "dark";

  // Define light and dark themes using Material-UI's createTheme
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#F5F7FA', // Light background
        paper: 'rgba(255, 255, 255, 0.98)', // White with slight transparency
      },
      text: {
        primary: '#263238', // Dark charcoal
        secondary: '#546E7A', // Medium grey
      },
      primary: {
        main: '#1976D2', // Google Blue
        dark: '#1565C0',
        contrastText: '#fff',
      },
      error: {
        main: '#D32F2F', // Standard red
        dark: '#C62828',
      },
      divider: '#E0E0E0',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&.Mui-focused fieldset': {
                borderColor: '#1976D2', // Primary blue on focus
              },
            },
            '& .MuiInputLabel-root': {
              color: '#546E7A', // Secondary text color for labels
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          },
          contained: {
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
            },
          },
          outlined: {
            borderColor: '#9E9E9E',
            color: '#546E7A',
            '&:hover': {
              borderColor: '#263238',
              backgroundColor: 'rgba(0,0,0,0.02)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 38,
            height: 20,
            padding: 0,
            display: 'flex',
            '&:active': {
              '& .MuiSwitch-thumb': {
                width: 18,
              },
            },
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#A78BFA', // Light purple for checked track
                opacity: 1,
                border: 0,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#A78BFA',
              border: '6px solid #fff',
            },
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
          },
          track: {
            borderRadius: 20 / 2,
            opacity: 1,
            backgroundColor: '#E0E0E0', // Light grey for unchecked track
            transition: 'background-color 0.3s',
            '.Mui-checked.MuiSwitch-colorPrimary + &': {
              backgroundColor: '#A78BFA',
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            paddingBottom: '12px', // Reduce padding below title
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: '8px !important', // Adjust padding top for content
          },
        },
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#263238', // Dark background
        paper: '#37474F', // Darker grey for cards/surfaces
      },
      text: {
        primary: '#ECEFF1', // Lightest grey
        secondary: '#B0BEC5', // Light grey
      },
      primary: {
        main: '#64B5F6', // Lighter blue for dark mode
        dark: '#42A5F5',
        contrastText: '#263238',
      },
      error: {
        main: '#EF5350', // Lighter red
        dark: '#E53935',
      },
      divider: '#455A64',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'rgba(55, 71, 79, 0.7)', // Darker background for input
              '&.Mui-focused fieldset': {
                borderColor: '#64B5F6', // Primary blue on focus
              },
            },
            '& .MuiInputLabel-root': {
              color: '#B0BEC5', // Secondary text color for labels
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          },
          contained: {
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
            },
          },
          outlined: {
            borderColor: '#78909C',
            color: '#B0BEC5',
            '&:hover': {
              borderColor: '#ECEFF1',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 38,
            height: 20,
            padding: 0,
            display: 'flex',
            '&:active': {
              '& .MuiSwitch-thumb': {
                width: 18,
              },
            },
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#8B5CF6', // Darker purple for checked track in dark mode
                opacity: 1,
                border: 0,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#8B5CF6',
              border: '6px solid #fff',
            },
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
          },
          track: {
            borderRadius: 20 / 2,
            opacity: 1,
            backgroundColor: '#4F4F4F', // Darker grey for unchecked track in dark mode
            transition: 'background-color 0.3s',
            '.Mui-checked.MuiSwitch-colorPrimary + &': {
              backgroundColor: '#8B5CF6',
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            paddingBottom: '12px', // Reduce padding below title
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: '8px !important', // Adjust padding top for content
          },
        },
      },
    },
  });

  const currentTheme = darkMode ? darkTheme : lightTheme;

  const Field = ({ label, value, icon, readOnlyInput = true, onChange, editableValue }) => {
    const inputId = `field-${label.toLowerCase().replace(/\s/g, '-')}`;
    const isDark = currentTheme.palette.mode === 'dark';

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: currentTheme.palette.text.secondary }}>
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && React.cloneElement(icon, { 
            sx: { 
              mr: 1, 
              color: currentTheme.palette.text.secondary, 
              position: 'absolute', 
              left: 8,
              fontSize: '1.25rem'
            } 
          })}
          <input
            id={inputId}
            type="text"
            readOnly={readOnlyInput}
            value={editableValue !== undefined ? editableValue : value}
            onChange={onChange}
            className={`w-full px-4 py-2.5 rounded-lg ${icon ? 'pl-10' : ''} ${readOnlyInput ? 'cursor-default' : 'cursor-text'} ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} ${isDark ? 'border-gray-700' : 'border-gray-200'} ${isDark ? 'text-gray-100' : 'text-gray-900'} ${isDark ? 'placeholder-gray-400' : 'placeholder-gray-500'} ${isDark ? 'focus:border-blue-500' : 'focus:border-blue-400'} ${isDark ? 'focus:ring-blue-500/20' : 'focus:ring-blue-400/20'} focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm shadow-inner`}
            style={{
              border: `1px solid ${currentTheme.palette.divider}`,
              boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
            }}
          />
        </div>
      </div>
    );
  };

  // State for Notifications (static as per request in original code)
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

  // Set initial username when data loads
  useEffect(() => {
    if (user && !isLoading) {
      setUsername(user.username);
    }
  }, [user, isLoading]);

  const handleEdit = () => {
    // Set username state to current display name for editing
    setUsername(displayUsername);
    setEditMode(true);
  };

  const handleSave = async () => {
    if (username.trim() === "") {
        setSnackbarMessage("Username cannot be empty.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
    }
    try {
      setIsSaving(true);
      // Call the mutation to update the user's profile on the backend
      await updateProfile({ userId, username }).unwrap();
      // Refetch user data to ensure UI is updated with latest backend data
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
    // Revert username state to the currently displayed/fetched username
    setUsername(displayUsername);
    setEditMode(false);
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

      // Password validation (as per your original code)
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

  const handleThemeToggle = async () => {
    try {
      const newTheme = darkMode ? "light" : "dark";
      await updateTheme({ userId, theme: newTheme }).unwrap();
      refetchTheme(); // Refetch theme to ensure UI updates
      setSnackbarMessage(`Theme changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}!`);
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating theme:", error);
      setSnackbarMessage(error.data?.message || "Failed to update theme.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          py: 4,
          px: 2,
          backgroundColor: currentTheme.palette.background.default,
          color: currentTheme.palette.text.primary,
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
            maxWidth: 600,
            width: "100%",
            background: currentTheme.palette.background.paper,
            border: `1px solid ${currentTheme.palette.mode === 'dark' ? "rgba(45, 55, 72, 0.8)" : "rgba(240, 240, 240, 0.8)"}`, // Adjusted border color
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
            sx={{ mb: 4, color: currentTheme.palette.text.primary, fontWeight: 700 }}
          >
            Profile Settings
          </Typography>

          {isLoading || isThemeLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Typography color="error" sx={{ p: 2 }}>
              Error loading profile.
            </Typography>
          ) : (
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
              <Avatar
                alt={username}
                src={displayAvatarUrl}
                onClick={handleAvatarClick}
                sx={{
                  width: 120,
                  height: 120,
                    border: `3px solid ${currentTheme.palette.primary.main}`,
                    boxShadow: `0 3px 10px ${alpha(currentTheme.palette.primary.main, 0.3)}`,
                  transition: "transform 0.2s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
                onError={(e) => {
                  e.target.onerror = null;
                    e.target.src = "https://placehold.co/150x150/d1e0fc/3b82f6?text=User";
                  }}
                />
                {!editMode && ( // Lock icon overlay
                  <LockIcon
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      fontSize: 24,
                      color: currentTheme.palette.text.secondary,
                      backgroundColor: alpha(currentTheme.palette.background.paper, 0.7),
                      borderRadius: '50%',
                      p: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  />
                )}
              </Box>

              <Typography variant="h5" sx={{ mt: 1, mb: 0.5, color: currentTheme.palette.text.primary, fontWeight: 600 }}>
                {displayUsername}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: currentTheme.palette.text.secondary }}>
                Senior Developer
              </Typography>

              {/* Profile Information Section */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonOutlineIcon sx={{ mr: 1, color: currentTheme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: currentTheme.palette.text.primary, fontWeight: 600 }}>
                  Profile Information
                </Typography>
                </Box>
                <Grid container spacing={2}> {/* Use Grid for better layout control */}
                  <Grid item xs={12} sm={6}>
                    <Field
                    label="Full Name"
                      value={displayUsername}
                      readOnlyInput={!editMode}
                    onChange={(e) => setUsername(e.target.value)}
                      editableValue={username}
                      icon={<PersonOutlineIcon />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                    label="Email Address"
                    value={displayEmail}
                      icon={<EmailOutlinedIcon />}
                      readOnlyInput={true}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                    label="Job Title"
                    value="Senior Developer" // Static
                      icon={<BusinessCenterOutlinedIcon />}
                      readOnlyInput={true}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                    label="Department"
                    value="Engineering" // Static
                      icon={<CorporateFareOutlinedIcon />}
                      readOnlyInput={true}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Preferences Section */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LanguageOutlinedIcon sx={{ mr: 1, color: currentTheme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: currentTheme.palette.text.primary, fontWeight: 600 }}>
                  Preferences
                </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, p: 1.5, borderRadius: '8px', border: `1px solid ${currentTheme.palette.divider}`, backgroundColor: alpha(currentTheme.palette.background.paper, 0.7) }}>
                  <Typography variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
                    Choose your preferred language
                  </Typography>
                  <select
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${currentTheme.palette.divider}`,
                      backgroundColor: currentTheme.palette.background.paper,
                      color: currentTheme.palette.text.primary,
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      '&:focus': {
                        borderColor: currentTheme.palette.primary.main,
                      },
                      boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
                    }}
                  >
                    <option value="english">English</option>
                    {/* Add more language options as needed */}
                  </select>
                </Box>
                {/* Dark Mode Switch */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: '8px', border: `1px solid ${currentTheme.palette.divider}`, backgroundColor: alpha(currentTheme.palette.background.paper, 0.7) }}>
                    <Typography variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
                        Dark Mode
                    </Typography>
                    <Switch
                        checked={darkMode}
                        onChange={handleThemeToggle}
                        color="primary"
                    />
                </Box>
              </Box>

              {/* Notifications Section */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsNoneOutlinedIcon sx={{ mr: 1, color: currentTheme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: currentTheme.palette.text.primary, fontWeight: 600 }}>
                  Notifications
                </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: '8px', border: `1px solid ${currentTheme.palette.divider}`, backgroundColor: alpha(currentTheme.palette.background.paper, 0.7) }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
                        Email Notifications
                      </Typography>
                      <Typography variant="body2" sx={{ color: currentTheme.palette.text.secondary }}>
                        Receive updates via email
                      </Typography>
                    </Box>
                    <Switch
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: '8px', border: `1px solid ${currentTheme.palette.divider}`, backgroundColor: alpha(currentTheme.palette.background.paper, 0.7) }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
                        Push Notifications
                      </Typography>
                      <Typography variant="body2" sx={{ color: currentTheme.palette.text.secondary }}>
                        Receive browser notifications
                      </Typography>
                    </Box>
                    <Switch
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: '8px', border: `1px solid ${currentTheme.palette.divider}`, backgroundColor: alpha(currentTheme.palette.background.paper, 0.7) }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
                        Project Updates
                      </Typography>
                      <Typography variant="body2" sx={{ color: currentTheme.palette.text.secondary }}>
                        Get notified about project changes
                      </Typography>
                    </Box>
                    <Switch
                      checked={projectUpdates}
                      onChange={() => setProjectUpdates(!projectUpdates)}
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Security Section */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: currentTheme.palette.text.primary, fontWeight: 600 }}>
                  Security
                </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      justifyContent: "flex-start",
                      border: "none",
                      color: currentTheme.palette.text.primary,
                      p: 1.5,
                      "&:hover": {
                        borderColor: currentTheme.palette.primary.main,
                        color: currentTheme.palette.primary.main,
                        backgroundColor: alpha(currentTheme.palette.primary.main, 0.05),
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
                      border: "none",
                      color: currentTheme.palette.text.primary,
                      p: 1.5,
                      "&:hover": {
                        borderColor: currentTheme.palette.primary.main,
                        color: currentTheme.palette.primary.main,
                        backgroundColor: alpha(currentTheme.palette.primary.main, 0.05),
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
                      border: "none",
                      color: currentTheme.palette.error.main,
                      p: 1.5,
                      "&:hover": {
                        borderColor: currentTheme.palette.error.dark,
                        color: currentTheme.palette.error.dark,
                        backgroundColor: alpha(currentTheme.palette.error.main, 0.05),
                      },
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, mt: 4, width: "100%", justifyContent: "flex-end" }}>
                {editMode ? (
                    <>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving}
                            startIcon={isSaving ? null : <SaveIcon />}
                  sx={{
                    backgroundColor: currentTheme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: currentTheme.palette.primary.dark,
                    },
                                py: 1.2, px: 3
                  }}
                >
                  {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                            disabled={isSaving}
                            startIcon={<CancelIcon />}
                  sx={{
                    borderColor: currentTheme.palette.text.secondary,
                    color: currentTheme.palette.text.primary,
                    "&:hover": {
                      borderColor: currentTheme.palette.text.primary,
                                    backgroundColor: alpha(currentTheme.palette.text.primary, 0.05),
                    },
                                py: 1.2, px: 3
                  }}
                >
                  Cancel
                </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleEdit}
                        startIcon={<EditIcon />}
                        sx={{
                            backgroundColor: currentTheme.palette.primary.main,
                            "&:hover": {
                                backgroundColor: currentTheme.palette.primary.dark,
                            },
                            py: 1.2, px: 3
                        }}
                    >
                        Edit Profile
                    </Button>
                )}
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
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: currentTheme.palette.background.paper,
              color: currentTheme.palette.text.primary,
              borderRadius: '12px',
            }
          }}
        >
          <DialogTitle sx={{ color: currentTheme.palette.text.primary, fontWeight: 600 }}>Change Password</DialogTitle>
          <DialogContent sx={{ pt: 2, '& .MuiTextField-root': { mb: 2 } }}>
            <TextField
              fullWidth
              margin="dense"
              label="Current Password"
              type="password"
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
              InputProps={{ style: { color: currentTheme.palette.text.primary } }}
              autoComplete="current-password"
            />
            <TextField
              fullWidth
              margin="dense"
              label="New Password"
              type="password"
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
              InputProps={{ style: { color: currentTheme.palette.text.primary } }}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Confirm New Password"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
              InputProps={{ style: { color: currentTheme.palette.text.primary } }}
              autoComplete="new-password"
            />
            {passwordError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {passwordError}
              </Typography>
            )}
            <Button
              onClick={() => {
                setPasswordDialogOpen(false); // Close current dialog
                setForgotPasswordDialogOpen(true); // Open forgot password dialog
              }}
              color="primary"
              sx={{ textTransform: "none", color: currentTheme.palette.primary.main }}
            >
              Forgot Password?
            </Button>
          </DialogContent>
          <DialogActions sx={{ pt: 2 }}>
            <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: currentTheme.palette.text.secondary }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword} variant="contained" sx={{ backgroundColor: currentTheme.palette.primary.main, "&:hover": { backgroundColor: currentTheme.palette.primary.dark } }}>
              {isUpdatingPassword ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordDialogOpen} onClose={() => setForgotPasswordDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: currentTheme.palette.background.paper,
              color: currentTheme.palette.text.primary,
              borderRadius: '12px',
            }
          }}
        >
          <DialogTitle sx={{ color: currentTheme.palette.text.primary, fontWeight: 600, textAlign: 'center', pb: 0 }}>Forgot Password</DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 0 }}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Enter your email to receive a reset link"
              type="email"
              variant="outlined"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
              InputProps={{
                style: {
                  color: currentTheme.palette.text.primary,
                  borderRadius: '8px', // Apply border-radius to the input field
                  backgroundColor: currentTheme.palette.mode === 'dark' ? 'rgba(55, 71, 79, 0.7)' : 'rgba(255,255,255,0.7)', // Match theme background
                }
              }}
            />
            {forgotPasswordError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {forgotPasswordError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ pt: 2, justifyContent: 'center' }}> {/* Center buttons */}
            <Button
              onClick={() => setForgotPasswordDialogOpen(false)}
              sx={{
                color: currentTheme.palette.text.secondary,
                borderRadius: '8px', // Apply border-radius to the button
                py: 1.2, px: 3,
                '&:hover': {
                  backgroundColor: alpha(currentTheme.palette.text.primary, 0.05),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={isSendingResetLink}
              variant="contained"
              sx={{
                backgroundColor: currentTheme.palette.primary.main,
                "&:hover": {
                  backgroundColor: currentTheme.palette.primary.dark
                },
                py: 1.2, px: 3,
                borderRadius: '8px', // Apply border-radius to the button
              }}
            >
              {isSendingResetLink ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
