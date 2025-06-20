// components/DeleteProjectConfirmationDialog.js
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
import DeleteIcon from "@mui/icons-material/Delete";
import { alpha } from "@mui/system";

/**
 * DeleteProjectConfirmationDialog Component
 * Dialog for the first phase of project deletion, confirming deletion from the database.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {object} props.project - The project data object.
 * @param {boolean} props.deleteProjectLoading - Loading state for delete project mutation.
 * @param {boolean} props.deleteProjectIsError - Error state for delete project mutation.
 * @param {object} props.deleteProjectError - Error object for delete project mutation.
 * @param {function} props.handleConfirmProjectDelete - Callback to confirm and execute the project deletion.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 */
const DeleteProjectConfirmationDialog = ({
  open,
  onClose,
  project,
  deleteProjectLoading,
  deleteProjectIsError,
  deleteProjectError,
  handleConfirmProjectDelete,
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
            activeTheme.palette.error.dark,
            0.6
          )}`,
          border: `1px solid ${alpha(activeTheme.palette.error.main, 0.5)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: activeTheme.palette.error.dark,
          color: "white",
          borderBottom: `1px solid ${activeTheme.palette.divider}`,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          fontSize: "1.2rem",
          p: 2.5,
        }}
      >
        <DeleteIcon sx={{ mr: 1 }} /> Confirm Project Deletion
      </DialogTitle>
      <DialogContent
        sx={{ py: 3, bgcolor: activeTheme.palette.background.default }}
      >
        <Box className="text-center py-2">
          <DeleteIcon
            sx={{
              fontSize: 60,
              color: activeTheme.palette.error.main,
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            gutterBottom
            className="font-semibold"
            sx={{ color: activeTheme.palette.text.primary }}
          >
            Are you sure you want to delete "{project?.projectName}"?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: activeTheme.palette.text.secondary }}
          >
            This action will permanently remove the project from your database.
          </Typography>
        </Box>
        {deleteProjectIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {deleteProjectError.data?.message ||
              "Error deleting project from database."}
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
        <Button onClick={onClose} variant="outlined" size="medium">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmProjectDelete}
          color="error"
          variant="contained"
          disabled={deleteProjectLoading}
          size="medium"
        >
          {deleteProjectLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Yes, Delete Project"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectConfirmationDialog;
