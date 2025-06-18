// components/EditProjectDialog.js
import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/system";

/**
 * EditProjectDialog Component
 * Dialog for editing the project's name and description.
 * The GitHub repository link is displayed but remains disabled for editing.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {string} props.editProjectName - Current value of the project name input.
 * @param {function} props.setEditProjectName - Callback to set the project name.
 * @param {string} props.editProjectDescription - Current value of the project description input.
 * @param {function} props.setEditProjectDescription - Callback to set the project description.
 * @param {string} props.editGithubRepoLink - Current value of the GitHub repo link (disabled).
 * @param {boolean} props.updateProjectLoading - Loading state for update project mutation.
 * @param {boolean} props.updateProjectIsError - Error state for update project mutation.
 * @param {object} props.updateProjectError - Error object for update project mutation.
 * @param {function} props.handleSaveProjectChanges - Callback to save the project changes.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 */
const EditProjectDialog = ({
  open,
  onClose,
  editProjectName,
  setEditProjectName,
  editProjectDescription,
  setEditProjectDescription,
  editGithubRepoLink,
  updateProjectLoading,
  updateProjectIsError,
  updateProjectError,
  handleSaveProjectChanges,
  activeTheme,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: activeTheme.palette.background.paper,
          borderRadius: "20px",
          boxShadow: `0 10px 40px ${alpha(
            activeTheme.palette.primary.dark,
            0.6
          )}`,
          border: `1px solid ${alpha(activeTheme.palette.primary.main, 0.5)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: activeTheme.palette.background.paper,
          color: activeTheme.palette.primary.main,
          borderBottom: `1px solid ${activeTheme.palette.divider}`,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          fontSize: "1.2rem",
          p: 2.5,
        }}
      >
        <EditIcon sx={{ mr: 1 }} /> Edit Project Details
      </DialogTitle>
      <DialogContent
        sx={{ py: 3, bgcolor: activeTheme.palette.background.default }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Project Title"
          type="text"
          fullWidth
          variant="outlined"
          value={editProjectName}
          onChange={(e) => setEditProjectName(e.target.value)}
          sx={{ mb: 2 }}
          size="medium"
        />
        <TextField
          margin="dense"
          label="Project Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={editProjectDescription}
          onChange={(e) => setEditProjectDescription(e.target.value)}
          sx={{ mb: 2 }}
          size="medium"
        />
        <TextField
          margin="dense"
          label="GitHub Repository Link"
          type="url"
          fullWidth
          variant="outlined"
          value={editGithubRepoLink}
          disabled
          sx={{ mb: 2 }}
          size="medium"
          InputProps={{ readOnly: true }}
        />
        {updateProjectIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {updateProjectError.data?.message ||
              "Error updating project. Please try again."}
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
          onClick={handleSaveProjectChanges}
          variant="contained"
          color="primary"
          disabled={updateProjectLoading}
          size="medium"
        >
          {updateProjectLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
