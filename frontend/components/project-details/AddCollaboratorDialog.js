// components/AddCollaboratorDialog.js
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
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GitHubIcon from "@mui/icons-material/GitHub";
import { alpha } from "@mui/system";

/**
 * AddCollaboratorDialog Component
 * Dialog for adding a new collaborator to the project.
 * Allows searching GitHub users and setting their permissions.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {string} props.searchTerm - Current search term for GitHub users.
 * @param {function} props.setSearchTerm - Callback to set the search term.
 * @param {object} props.selectedUser - The currently selected GitHub user from search results.
 * @param {function} props.setSelectedUser - Callback to set the selected GitHub user.
 * @param {Array<string>} props.selectedPermissions - List of permissions selected for the new collaborator.
 * @param {function} props.setSelectedPermissions - Callback to set the selected permissions.
 * @param {boolean} props.addCollaboratorLoading - Loading state for adding collaborator mutation.
 * @param {boolean} props.addCollaboratorIsError - Error state for adding collaborator mutation.
 * @param {object} props.addCollaboratorError - Error object for adding collaborator mutation.
 * @param {function} props.handleAddCollaborator - Callback to handle the addition of a collaborator.
 * @param {function} props.handlePermissionChange - Callback to handle changes in permission checkboxes.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {object} props.searchResults - Search results from GitHub user query.
 * @param {boolean} props.searchLoading - Loading state for GitHub user search.
 * @param {boolean} props.searchIsError - Error state for GitHub user search.
 * @param {object} props.searchError - Error object for GitHub user search.
 * @param {Array<string>} props.availablePermissions - List of all available permissions.
 */
const AddCollaboratorDialog = ({
  open,
  onClose,
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser,
  selectedPermissions,
  setSelectedPermissions,
  addCollaboratorLoading,
  addCollaboratorIsError,
  addCollaboratorError,
  handleAddCollaborator,
  handlePermissionChange,
  activeTheme,
  searchResults,
  searchLoading,
  searchIsError,
  searchError,
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
        <AddIcon sx={{ mr: 1 }} /> Add New Collaborator
      </DialogTitle>
      <DialogContent
        sx={{ py: 3, bgcolor: activeTheme.palette.background.default }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Search GitHub Username"
          type="text"
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          helperText="Type at least 3 characters to search GitHub users"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <GitHubIcon
                sx={{ color: activeTheme.palette.action.active, mr: 1 }}
              />
            ),
          }}
          size="medium"
        />

        {searchLoading && (
          <Box className="flex justify-center py-2">
            <CircularProgress
              size={28}
              sx={{ color: activeTheme.palette.primary.main }}
            />
          </Box>
        )}
        {searchIsError && (
          <Alert severity="error" className="rounded-xl mt-2">
            {searchError?.data?.message || "Search error"}
          </Alert>
        )}
        {!searchLoading &&
          !searchIsError &&
          searchTerm.length >= 3 &&
          searchResults?.users?.length === 0 && (
            <Box className="text-center py-2">
              <Typography
                variant="body2"
                sx={{ color: activeTheme.palette.text.secondary }}
              >
                No users found matching your search.
              </Typography>
            </Box>
          )}

        {searchResults?.users && searchResults.users.length > 0 && (
          <List
            className="max-h-72 overflow-auto mt-2"
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            {searchResults.users.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => setSelectedUser(user)}
                selected={selectedUser?.id === user.id}
                className="rounded-lg py-2 mx-1 my-0.5"
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.avatar_url}
                    alt={user.login}
                    sx={{
                      width: 44,
                      height: 44,
                      border: `2px solid ${activeTheme.palette.secondary.main}`,
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.login}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: activeTheme.palette.text.primary,
                  }}
                  secondary={`GitHub ID: ${user.id}`}
                  secondaryTypographyProps={{
                    fontSize: "0.85rem",
                    color: activeTheme.palette.text.secondary,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {selectedUser && (
          <Box
            className="mt-6 p-4 rounded-xl border"
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
              Set Permissions for {selectedUser.login}
            </Typography>
            <FormGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePermissions.map((permission) => (
                <FormControlLabel
                  key={permission}
                  control={
                    <Checkbox
                      name={permission}
                      checked={selectedPermissions.includes(permission)}
                      onChange={handlePermissionChange}
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
        )}
        {addCollaboratorIsError && (
          <Alert severity="error" className="rounded-xl mt-4">
            {addCollaboratorError.data?.message ||
              "Error adding collaborator. Please try again."}
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
          onClick={handleAddCollaborator}
          disabled={!selectedUser || addCollaboratorLoading}
          variant="contained"
          color="primary"
          size="medium"
        >
          {addCollaboratorLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Add Collaborator"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
