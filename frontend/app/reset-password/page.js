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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        p: 3,
        textAlign: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2, maxWidth: 500, width: "100%" }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: 700, color: "#1e40af" }}
        >
          Set Your Password
        </Typography>

        {message && (
          <Alert
            severity={isError ? "error" : isSuccess ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        {isLoading && <CircularProgress sx={{ mb: 2 }} />}

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
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              sx={inputSx}
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
              sx={inputSx}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 2,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 600,
                background: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
                "&:hover": {
                  opacity: 0.9,
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
  );
}
