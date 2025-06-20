"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useResetPasswordMutation } from "@/features/usermanagementSlice";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("");
  const [resetCompleted, setResetCompleted] = useState(false); // New state to manage form visibility

  const [
    resetPassword,
    { isLoading, isSuccess, isError, error, data: resetData },
  ] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const newPassword = watch("newPassword");

  // Effect to handle initial token check and RTK Query results
  useEffect(() => {
    if (!token) {
      setMessage(
        "No password reset token found. Please use the link from your invitation email."
      );
    }

    if (isSuccess) {
      // Simplified success handling
      setMessage(
        "Password set successfully! Please log in with your new password."
      );
      setResetCompleted(true); // Indicate successful completion

      // Clear any existing authentication tokens/user data as the user needs to log in
      if (typeof window !== "undefined") {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }

      setTimeout(() => {
        router.push("/login"); // Always redirect to login page
      }, 3000);
    }

    if (isError) {
      setMessage(
        error?.data?.message ||
          error?.message ||
          "Failed to set password. Please try again."
      );
    }
  }, [token, isSuccess, isError, error, resetData, router]); // Keep resetData in dependency array for completeness if needed elsewhere, though not directly used in the redirect logic now

  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setMessage("Setting your new password...");

    try {
      await resetPassword({ token, newPassword: data.newPassword }).unwrap();
    } catch (err) {
      console.error("Password reset mutation error:", err);
      // Error is handled by the useEffect
    }
  };

  const inputSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  };

  // Define a simple light theme for this page
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
    },
  });

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: lightTheme.palette.background.default, // Use theme background
          p: 3,
          textAlign: "center",
          color: lightTheme.palette.text.primary, // Use theme text color
          transition: "background-color 0.3s, color 0.3s", // Add transition
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4, 
            borderRadius: 3, // Match the profile page's border-radius
            maxWidth: 500,
            width: "100%",
            background: lightTheme.palette.background.paper, // Use theme paper background
            border: `1px solid ${lightTheme.palette.divider}`, // Add border
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Consistent shadow
            transition: "transform 0.2s ease-in-out, background-color 0.3s", // Add transition
            "&:hover": {
              transform: "translateY(-3px)", // Hover effect
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 700, color: lightTheme.palette.primary.main }} // Use theme primary color
          >
            Set Your Password
          </Typography>

          {message && (
            <Alert
              severity={isError ? "error" : isSuccess ? "success" : "info"}
              sx={{ mb: 2, borderRadius: '8px' }} // Apply border-radius to Alert
            >
              {message}
            </Alert>
          )}

          {isLoading && <CircularProgress sx={{ mb: 2, color: lightTheme.palette.primary.main }} />}

          {/* Show form only if not loading and not successfully completed */}
          {!isSuccess && !resetCompleted && (
            <form onSubmit={handleSubmit(handleResetPassword)}>
              <TextField
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                variant="outlined"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  validate: {
                    hasUpperCase: (value) =>
                      /[A-Z]/.test(value) ||
                      "Password must contain at least one uppercase letter",
                    hasLowerCase: (value) =>
                      /[a-z]/.test(value) ||
                      "Password must contain at least one lowercase letter",
                    hasNumber: (value) =>
                      /[0-9]/.test(value) ||
                      "Password must contain at least one number",
                    hasSpecialChar: (value) =>
                      /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                      "Password must contain at least one special character",
                  },
                })}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                sx={{ 
                  mb: 2, 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused fieldset': {
                      borderColor: lightTheme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: lightTheme.palette.text.secondary,
                  },
                  InputProps: {
                    style: { color: lightTheme.palette.text.primary }
                  }
                }}
              />
              <TextField
                margin="dense"
                label="Confirm Password"
                type="password"
                fullWidth
                variant="outlined"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused fieldset': {
                      borderColor: lightTheme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: lightTheme.palette.text.secondary,
                  },
                  InputProps: {
                    style: { color: lightTheme.palette.text.primary }
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: '8px',
                  fontWeight: 600,
                  backgroundColor: lightTheme.palette.primary.main, // Use theme primary color
                  "&:hover": {
                    backgroundColor: lightTheme.palette.primary.dark, // Use theme primary dark color
                    opacity: 1, // Remove custom opacity, use theme hover
                  },
                }}
                disabled={!isValid || isLoading}
              >
                Set Password
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
