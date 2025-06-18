// components/EditCollaboratorPermissionsDialog.js
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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/system";

/**
 * EditCollaboratorPermissionsDialog Component
 * Dialog for editing the permissions of an existing collaborator.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {object} props.selectedCollaborator - The collaborator object whose permissions are being edited.
 * @param {Array<string>} props.permissionsToEdit - List of permissions currently selected for editing.
 * @param {boolean} props.updatePermissionsLoading - Loading state for update permissions mutation.
 * @param {boolean} props.updatePermissionsIsError - Error state for update permissions mutation.
 * @param {object} props.updatePermissionsError - Error object for update permissions mutation.
 * @param {function} props.handleEditPermissionChange - Callback to handle changes in permission checkboxes.
 * @param {function} props.handleSavePermissions - Callback to save the updated permissions.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {Array<string>} props.availablePermissions - List of all available permissions.
 */
const EditCollaboratorPermissionsDialog = ({
  open,
  onClose,
  selectedCollaborator,
  permissionsToEdit,
  updatePermissionsLoading,
  updatePermissionsIsError,
  updatePermissionsError,
  handleEditPermissionChange,
  handleSavePermissions,
  activeTheme,
  availablePermissions,
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
        <EditIcon sx={{ mr: 1 }} /> Edit Permissions for{" "}
        {selectedCollaborator?.username}
      </DialogTitle>
      <DialogContent
        sx={{ py: 3, bgcolor: activeTheme.palette.background.default }}
      >
        <Box
          className="mt-1 p-4 rounded-xl border"
          sx={{
            bgcolor: activeTheme.palette.background.paper,
            borderColor: activeTheme.palette.divider,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            className="font-semibold mb-3"
            sx={{ color: activeTheme.palette.text.primary }}
          >
            Available Permissions
          </Typography>
          <FormGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availablePermissions.map((permission) => (
              <FormControlLabel
                key={permission}
                control={
                  <Checkbox
                    name={permission}
                    checked={permissionsToEdit.includes(permission)}
                    onChange={handleEditPermissionChange}
                    color="primary"
                    size="medium"
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.95rem",
                      color: activeTheme.palette.text.primary,
                    }}
                  >
                    {permission}
                  </Typography>
                }
                sx={{ m: 0, "& .MuiFormControlLabel-label": { ml: 0.5 } }}
              />
            ))}
          </FormGroup>
        </Box>
        {updatePermissionsIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {updatePermissionsError.data?.message ||
              "Error updating permissions."}
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
          onClick={handleSavePermissions}
          variant="contained"
          color="primary"
          disabled={updatePermissionsLoading}
          size="medium"
        >
          {updatePermissionsLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCollaboratorPermissionsDialog;
