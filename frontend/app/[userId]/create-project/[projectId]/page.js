"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton, // Import IconButton for delete/edit icons
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete icon
import EditIcon from "@mui/icons-material/Edit"; // Import Edit icon
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  useGetCollaboratorsQuery,
  useGetProjectByIdQuery,
} from "@/features/projectApiSlice";
import {
  useAddCollaboratorMutation,
  useSearchGithubUsersQuery,
  useDeleteCollaboratorMutation, // Import the new mutation
  useUpdateCollaboratorPermissionsMutation, // Import the new mutation
} from "@/features/githubApiSlice"; // Assuming these are in githubApiSlice

const defaultTheme = createTheme();

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: "bold",
  margin: theme.spacing(1),
}));

const ProjectDetailPage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const router = useRouter();

  const [openAddDialog, setOpenAddDialog] = useState(false); // Renamed for clarity
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // New state for delete dialog
  const [openEditDialog, setOpenEditDialog] = useState(false); // New state for edit dialog

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null); // New state for current collaborator to edit/delete
  const [permissionsToEdit, setPermissionsToEdit] = useState([]); // New state for managing permissions in edit dialog

  // Define the available permissions
  const availablePermissions = [
    "Create PR",
    "Assign PR",
    "Review PR",
    "User story creation",
    "Code analysis",
    "Documentation upload",
  ];

  // Fetch project details
  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  // Fetch collaborators for the project
  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // Search for GitHub users
  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchIsError,
    error: searchError,
  } = useSearchGithubUsersQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  // Mutation to add a collaborator
  const [
    addCollaborator,
    {
      isLoading: addCollaboratorLoading,
      isSuccess: addCollaboratorSuccess,
      isError: addCollaboratorIsError,
      error: addCollaboratorError,
      reset: resetAddCollaboratorMutation,
    },
  ] = useAddCollaboratorMutation();

  // New: Mutation to delete a collaborator
  const [
    deleteCollaborator,
    {
      isLoading: deleteCollaboratorLoading,
      isSuccess: deleteCollaboratorSuccess,
      isError: deleteCollaboratorIsError,
      error: deleteCollaboratorError,
      reset: resetDeleteCollaboratorMutation,
    },
  ] = useDeleteCollaboratorMutation();

  // New: Mutation to update collaborator permissions
  const [
    updateCollaboratorPermissions,
    {
      isLoading: updatePermissionsLoading,
      isSuccess: updatePermissionsSuccess,
      isError: updatePermissionsIsError,
      error: updatePermissionsError,
      reset: resetUpdatePermissionsMutation,
    },
  ] = useUpdateCollaboratorPermissionsMutation();

  // Effect to handle successful collaborator addition
  useEffect(() => {
    if (addCollaboratorSuccess) {
      setOpenAddDialog(false);
      setSearchTerm("");
      setSelectedUser(null);
      setSelectedPermissions([]);
      refetchCollaborators();
      resetAddCollaboratorMutation();
    }
  }, [
    addCollaboratorSuccess,
    refetchCollaborators,
    resetAddCollaboratorMutation,
  ]);

  // Effect to handle successful collaborator deletion
  useEffect(() => {
    if (deleteCollaboratorSuccess) {
      setOpenDeleteDialog(false);
      setSelectedCollaborator(null);
      refetchCollaborators();
      resetDeleteCollaboratorMutation();
    }
  }, [
    deleteCollaboratorSuccess,
    refetchCollaborators,
    resetDeleteCollaboratorMutation,
  ]);

  // Effect to handle successful permission update
  useEffect(() => {
    if (updatePermissionsSuccess) {
      setOpenEditDialog(false);
      setSelectedCollaborator(null);
      setPermissionsToEdit([]);
      refetchCollaborators();
      resetUpdatePermissionsMutation();
    }
  }, [
    updatePermissionsSuccess,
    refetchCollaborators,
    resetUpdatePermissionsMutation,
  ]);

  // Handlers for Add Collaborator Dialog
  const handleOpenAddDialog = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedPermissions([]);
    resetAddCollaboratorMutation();
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedPermissions([]);
  };

  const handleButtonClick = (button) => {
    // Handle button clicks for user story creation, code analysis, and documentation
    switch (button) {
      case "userStory":
        console.log("User Story Creation clicked");
        router.push(`/${userId}/create-project/${projectId}/user-story`);
        break;
      case "codeAnalysis":
        console.log("Code Analysis clicked");
        router.push(`/${userId}/create-project/${projectId}/code-analysis`);
        break;
      case "documentation":
        console.log("Documentation clicked");
        router.push(`/${userId}/create-project/${projectId}/documentation`);
        break;
      default:
        console.error("Unknown button clicked:", button);
    }
  };

  const handleAddCollaborator = async () => {
    if (selectedUser && projectId) {
      try {
        await addCollaborator({
          projectId,
          githubUsername: selectedUser.login,
          permissions: selectedPermissions,
        }).unwrap();
      } catch (err) {
        console.error("Failed to add collaborator:", err);
      }
    }
  };

  // Handler for permission checkbox changes (Add dialog)
  const handlePermissionChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedPermissions((prev) => [...prev, name]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== name));
    }
  };

  // NEW: Handlers for Delete Collaborator Dialog
  const handleOpenDeleteDialog = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCollaborator(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedCollaborator && projectId) {
      try {
        await deleteCollaborator({
          projectId,
          githubUsername: selectedCollaborator.username,
        }).unwrap();
      } catch (err) {
        console.error("Failed to delete collaborator:", err);
      }
    }
  };

  // NEW: Handlers for Edit Collaborator Permissions Dialog
  const handleOpenEditDialog = (collaborator) => {
    setSelectedCollaborator(collaborator);
    // Initialize permissionsToEdit with existing permissions of the collaborator
    setPermissionsToEdit(collaborator.permissions || []);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedCollaborator(null);
    setPermissionsToEdit([]);
  };

  const handleEditPermissionChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setPermissionsToEdit((prev) => [...prev, name]);
    } else {
      setPermissionsToEdit((prev) => prev.filter((p) => p !== name));
    }
  };

  const handleSavePermissions = async () => {
    if (selectedCollaborator && projectId) {
      try {
        await updateCollaboratorPermissions({
          projectId,
          githubUsername: selectedCollaborator.username,
          permissions: permissionsToEdit,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update permissions:", err);
      }
    }
  };

  const project = projectData?.project;
  const collaborators = collaboratorsData?.collaborators || [];

  if (projectLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (projectIsError) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Failed to load project details:{" "}
          {projectError?.data?.message ||
            projectError?.status ||
            "Unknown error"}
        </Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={4}>
        <Alert severity="warning">Project not found.</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000, margin: "auto" }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {project?.projectName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {project?.projectDescription}
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Project Details
            </Typography>
            {project?.githubRepoLink ? (
              <Link
                href={project.githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ wordBreak: "break-all" }}
              >
                {project.githubRepoLink}
              </Link>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No GitHub repository linked.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick("userStory")}
          >
            User Story Creation
          </StyledButton>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={() => handleButtonClick("codeAnalysis")}
          >
            Code Analysis
          </StyledButton>
          <StyledButton
            variant="contained"
            sx={{
              backgroundColor: "success.main",
              "&:hover": { backgroundColor: "success.dark" },
            }}
            onClick={() => handleButtonClick("documentation")}
          >
            Documentation
          </StyledButton>
        </Box>

        {/* Collaborators Section */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Collaborators
              </Typography>
              <StyledButton
                variant="outlined"
                color="primary"
                onClick={handleOpenAddDialog}
                size="small"
              >
                Add Participants
              </StyledButton>
            </Box>
            {collaboratorsLoading ? (
              <CircularProgress size={24} />
            ) : collaboratorsIsError ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                Failed to load collaborators:{" "}
                {collaboratorsError?.data?.message || "Error"}
              </Alert>
            ) : collaborators.length > 0 ? (
              <List dense>
                {collaborators.map((collab) => (
                  <ListItem
                    key={collab.githubId || collab.username}
                    disablePadding
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenEditDialog(collab)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleOpenDeleteDialog(collab)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={collab.avatarUrl} alt={collab.username} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {collab.username}
                          <Typography
                            component="span"
                            variant="body2"
                            color={
                              collab.status === "accepted"
                                ? "success.main"
                                : collab.status === "pending"
                                ? "warning.main"
                                : "error.main"
                            }
                            sx={{ ml: 1, fontWeight: "bold" }}
                          >
                            ({collab.status})
                          </Typography>
                        </>
                      }
                      secondary={
                        collab.permissions && collab.permissions.length > 0
                          ? `Permissions: ${collab.permissions.join(", ")}`
                          : "No specific permissions assigned"
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No collaborators yet.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Add New Collaborator Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add New Collaborator</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="github-username-search"
              label="Search GitHub Username"
              type="text"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              helperText="Type at least 3 characters to search."
              sx={{ mb: 2 }}
            />
            {searchLoading && (
              <CircularProgress
                size={24}
                sx={{ display: "block", margin: "auto" }}
              />
            )}
            {searchIsError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Error searching users:{" "}
                {searchError?.data?.message || "Failed to search"}
              </Alert>
            )}
            {!searchLoading &&
              !searchIsError &&
              searchTerm.length >= 3 &&
              searchResults?.users?.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  No users found.
                </Typography>
              )}
            {searchResults?.users && searchResults.users.length > 0 && (
              <List
                sx={{
                  maxHeight: 300,
                  overflow: "auto",
                  mt: 1,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                }}
              >
                {searchResults.users.map((user) => (
                  <ListItemButton
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    selected={selectedUser?.id === user.id}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatar_url} alt={user.login} />
                    </ListItemAvatar>
                    <ListItemText primary={user.login} />
                  </ListItemButton>
                ))}
              </List>
            )}

            {selectedUser && (
              <Box
                sx={{
                  mt: 3,
                  mb: 2,
                  p: 2,
                  border: "1px solid #eee",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Set Permissions for {selectedUser.login}
                </Typography>
                <FormGroup>
                  {availablePermissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          name={permission}
                          checked={selectedPermissions.includes(permission)}
                          onChange={handlePermissionChange}
                        />
                      }
                      label={permission}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {addCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to add collaborator:{" "}
                {addCollaboratorError.data?.message ||
                  "An unknown error occurred"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseAddDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddCollaborator}
              disabled={!selectedUser || addCollaboratorLoading}
              variant="contained"
            >
              {addCollaboratorLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Add Collaborator"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NEW: Delete Collaborator Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove{" "}
              <Typography component="span" fontWeight="bold">
                {selectedCollaborator?.username}
              </Typography>{" "}
              as a collaborator from this project and its GitHub repository?
            </Typography>
            {deleteCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to delete collaborator:{" "}
                {deleteCollaboratorError.data?.message ||
                  "An unknown error occurred"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteCollaboratorLoading}
            >
              {deleteCollaboratorLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NEW: Edit Collaborator Permissions Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Edit Permissions for {selectedCollaborator?.username}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                mt: 1,
                mb: 2,
                p: 2,
                border: "1px solid #eee",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <FormGroup>
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        name={permission}
                        checked={permissionsToEdit.includes(permission)}
                        onChange={handleEditPermissionChange}
                      />
                    }
                    label={permission}
                  />
                ))}
              </FormGroup>
            </Box>
            {updatePermissionsIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to update permissions:{" "}
                {updatePermissionsError.data?.message ||
                  "An unknown error occurred"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseEditDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              variant="contained"
              disabled={updatePermissionsLoading}
            >
              {updatePermissionsLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectDetailPage;
