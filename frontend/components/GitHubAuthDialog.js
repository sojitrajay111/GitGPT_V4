// components/GitHubAuthDialog.js
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuthenticateGitHubMutation } from "@/features/githubApiSlice";

const GitHubAuthDialog = ({ open, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [authenticateGitHub, { isLoading }] = useAuthenticateGitHubMutation();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      setError("");
      const response = await authenticateGitHub(data).unwrap();

      // Call success callback with GitHub data
      onSuccess(response.data);

      // Reset form and close dialog
      reset();
      onClose();
    } catch (err) {
      setError(err.data?.message || "Failed to authenticate with GitHub");
    }
  };

  const handleClose = () => {
    setError("");
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Connect to GitHub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please provide your GitHub credentials to continue
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="GitHub Username"
              fullWidth
              variant="outlined"
              {...register("githubUsername", {
                required: "GitHub username is required",
              })}
              error={!!errors.githubUsername}
              helperText={errors.githubUsername?.message}
              disabled={isLoading}
            />

            <TextField
              label="GitHub Email"
              type="email"
              fullWidth
              variant="outlined"
              {...register("githubEmail", {
                required: "GitHub email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.githubEmail}
              helperText={errors.githubEmail?.message}
              disabled={isLoading}
            />

            <TextField
              label="GitHub Personal Access Token"
              type="password"
              fullWidth
              variant="outlined"
              {...register("githubToken", {
                required: "GitHub token is required",
              })}
              error={!!errors.githubToken}
              helperText={
                errors.githubToken?.message ||
                "Generate a token from GitHub Settings > Developer settings > Personal access tokens"
              }
              disabled={isLoading}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={isLoading} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? "Authenticating..." : "Connect GitHub"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GitHubAuthDialog;
