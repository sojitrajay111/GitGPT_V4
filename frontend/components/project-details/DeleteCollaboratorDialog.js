// components/DeleteCollaboratorDialog.js
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
 * DeleteCollaboratorDialog Component
 * Dialog for confirming the deletion of a collaborator from the project.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {object} props.selectedCollaborator - The collaborator object to be deleted.
 * @param {boolean} props.deleteCollaboratorLoading - Loading state for delete collaborator mutation.
 * @param {boolean} props.deleteCollaboratorIsError - Error state for delete collaborator mutation.
 * @param {object} props.deleteCollaboratorError - Error object for delete collaborator mutation.
 * @param {function} props.handleConfirmDeleteCollaborator - Callback to confirm and execute the deletion.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 */
const DeleteCollaboratorDialog = ({
  open,
  onClose,
  selectedCollaborator,
  deleteCollaboratorLoading,
  deleteCollaboratorIsError,
  deleteCollaboratorError,
  handleConfirmDeleteCollaborator,
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
        <DeleteIcon sx={{ mr: 1 }} /> Confirm Deletion
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
            Remove {selectedCollaborator?.username}?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: activeTheme.palette.text.secondary }}
          >
            This action will permanently remove them from the project and revoke
            their GitHub repository access.
          </Typography>
        </Box>
        {deleteCollaboratorIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {deleteCollaboratorError.data?.message ||
              "Error deleting collaborator."}
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
          onClick={handleConfirmDeleteCollaborator}
          color="error"
          variant="contained"
          disabled={deleteCollaboratorLoading}
          size="medium"
        >
          {deleteCollaboratorLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Delete Collaborator"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCollaboratorDialog;
