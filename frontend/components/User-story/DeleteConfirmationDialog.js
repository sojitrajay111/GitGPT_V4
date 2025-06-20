// components/DeleteConfirmationDialog.jsx
import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";

/**
 * Renders a confirmation dialog for deleting a user story.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {object} props.storyToDelete - The story object to be deleted.
 * @param {function} props.onConfirmDelete - Callback to confirm the deletion.
 * @param {boolean} props.isDeleting - Loading state for the deletion process.
 */
const DeleteConfirmationDialog = ({
  open,
  onClose,
  storyToDelete,
  onConfirmDelete,
  isDeleting,
}) => {
  const theme = useTheme(); // Access the current theme for styling

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: theme.palette.background.paper, // Dialog background
          color: theme.palette.text.primary, // Dialog text color
          borderRadius: "20px", // Rounded corners
          boxShadow: theme.palette.custom.depthShadow, // Depth shadow
          border: `1px solid ${theme.palette.divider}`, // Border
          transformStyle: "preserve-3d", // Enable 3D transforms
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
        Confirm Deletion
      </DialogTitle>
      {/* Dialog Content */}
      <DialogContent>
        <Typography sx={{ color: theme.palette.text.secondary }}>
          Are you sure you want to delete the story "
          <strong>{storyToDelete?.userStoryTitle}</strong>"? This action cannot
          be undone.
        </Typography>
      </DialogContent>
      {/* Dialog Actions (Cancel and Delete buttons) */}
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ color: theme.palette.text.primary }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirmDelete} // Trigger deletion
          variant="contained"
          color="error" // Error color for delete action
          disabled={isDeleting} // Disable button while deleting
        >
          {isDeleting ? (
            <CircularProgress size={24} color="inherit" /> // Loading spinner
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
