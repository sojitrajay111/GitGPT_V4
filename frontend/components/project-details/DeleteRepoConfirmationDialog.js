// components/DeleteRepoConfirmationDialog.js
import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { alpha } from "@mui/system";

/**
 * DeleteRepoConfirmationDialog Component
 * Dialog for the second phase of project deletion, specifically confirming
 * the deletion of the associated GitHub repository.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {object} props.project - The project data object, containing githubRepoLink.
 * @param {boolean} props.deleteGithubRepoLoading - Loading state for GitHub repo deletion mutation.
 * @param {boolean} props.deleteGithubRepoIsError - Error state for GitHub repo deletion mutation.
 * @param {object} props.deleteGithubRepoError - Error object for GitHub repo deletion mutation.
 * @param {function} props.handleConfirmDeleteRepo - Callback to confirm and execute the GitHub repo deletion.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 */
const DeleteRepoConfirmationDialog = ({
  open,
  onClose,
  project,
  deleteGithubRepoLoading,
  deleteGithubRepoIsError,
  deleteGithubRepoError,
  handleConfirmDeleteRepo,
  activeTheme,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          bgcolor: activeTheme.palette.background.paper,
          borderRadius: "20px",
          boxShadow: `0 10px 40px ${alpha(
            activeTheme.palette.warning.dark,
            0.6
          )}`,
          border: `1px solid ${alpha(activeTheme.palette.warning.main, 0.5)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: activeTheme.palette.warning.dark,
          color: "white",
          borderBottom: `1px solid ${activeTheme.palette.divider}`,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          fontSize: "1.2rem",
          p: 2.5,
        }}
      >
        <GitHubIcon sx={{ mr: 1 }} /> Delete GitHub Repository?
      </DialogTitle>
      <DialogContent
        sx={{ py: 3, bgcolor: activeTheme.palette.background.default }}
      >
        <Box className="text-center py-2">
          <GitHubIcon
            sx={{
              fontSize: 60,
              color: activeTheme.palette.warning.main,
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            gutterBottom
            className="font-semibold"
            sx={{ color: activeTheme.palette.text.primary }}
          >
            Also delete associated GitHub repository?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: activeTheme.palette.text.secondary }}
          >
            This will permanently delete the GitHub repository linked to this
            project: <br />
            <Typography
              component="span"
              fontWeight="bold"
              sx={{ color: activeTheme.palette.primary.main }}
            >
              {project?.githubRepoLink.split("/").pop()}
            </Typography>
          </Typography>
        </Box>
        {deleteGithubRepoIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {deleteGithubRepoError.data?.message ||
              "Error deleting GitHub repository. You may need to delete it manually."}
          </Alert>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: "16px 24px",
          borderTop: `1px solid ${activeTheme.palette.divider}`,
          bgcolor: activeTheme.palette.background.paper,
        }}
      >
        <Button
          onClick={() => handleConfirmDeleteRepo(false)}
          variant="outlined"
          size="medium"
        >
          No, Keep GitHub Repo
        </Button>
        <Button
          onClick={() => handleConfirmDeleteRepo(true)}
          color="warning"
          variant="contained"
          disabled={deleteGithubRepoLoading}
          size="medium"
        >
          {deleteGithubRepoLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Yes, Delete GitHub Repo"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRepoConfirmationDialog;
