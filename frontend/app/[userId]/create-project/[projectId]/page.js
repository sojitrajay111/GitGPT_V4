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
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import GitHubIcon from "@mui/icons-material/GitHub";
import AddIcon from "@mui/icons-material/Add";
import AccountTreeIcon from "@mui/icons-material/AccountTree"; // Icon for PR/Branch Management
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  useGetCollaboratorsQuery,
  useGetProjectByIdQuery,
} from "@/features/projectApiSlice";
import {
  useAddCollaboratorMutation,
  useSearchGithubUsersQuery,
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useGetUserAndGithubDataQuery,
} from "@/features/githubApiSlice";
import { useGetCollaboratorPermissionsQuery } from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

// Light and iterative color theme (assuming this theme is defined as in your original file)
const lightTheme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5", // Vibrant indigo
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0ea5e9", // Sky blue
    },
    success: {
      main: "#22c55e", // Emerald green
    },
    background: {
      default: "#f9fafb", // Very light gray
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937", // Dark gray
      secondary: "#6b7280", // Medium gray
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.15rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.2s ease",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#d1d5db",
            transform: "translateY(-2px)",
          },
        },
      },
    },
  },
});

// Custom styled components (assuming these are defined as in your original file)
const LightHeader = styled("div")(({ theme }) => ({
  background: "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)",
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: "12px",
  marginBottom: theme.spacing(3),
  border: "1px solid #e5e7eb",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "10px",
  padding: theme.spacing(2),
  minWidth: "180px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "130px",
  transition: "all 0.2s ease",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  "&:hover": {
    backgroundColor: "#f9fafb",
    borderColor: theme.palette.primary.light, // Lighter primary color on hover
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  "& .MuiButton-startIcon": {
    margin: 0,
    marginBottom: theme.spacing(1),
    fontSize: "2.2rem",
    // color will be inherited or can be set per button
  },
}));

const CollaboratorCard = styled(Card)(({ theme }) => ({
  borderLeft: "2px solid #4f46e5",
  transition: "all 0.2s ease",
  "&:hover": {
    borderLeftColor: "#0ea5e9",
  },
}));

const PermissionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.3),
  backgroundColor: "#f0f9ff",
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: "0.75rem",
}));

const ProjectDetailPage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const router = useRouter();

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [permissionsToEdit, setPermissionsToEdit] = useState([]);

  const { data: userData } = useGetUserAndGithubDataQuery(userId);

  const user_role = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    projectId && githubId && user_role === "developer"
      ? { projectId, githubId }
      : skipToken
  );

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

  // Fetch collaborators
  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // Search GitHub users
  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchIsError,
    error: searchError,
  } = useSearchGithubUsersQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  // Mutations
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

  // Effects for mutation success handling
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

  // Dialog handlers
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
    switch (button) {
      case "userStory":
        router.push(`/${userId}/create-project/${projectId}/user-story`);
        break;
      case "codeAnalysis":
        router.push(`/${userId}/create-project/${projectId}/code-analysis`);
        break;
      case "documentation":
        router.push(`/${userId}/create-project/${projectId}/documentation`);
        break;
      // START: Added for PR/Branch Management
      case "managePrBranches":
        router.push(
          `/${userId}/create-project/${projectId}/manager-pr-branches`
        );
        break;
      // END: Added for PR/Branch Management
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

  const handlePermissionChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedPermissions((prev) => [...prev, name]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== name));
    }
  };

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

  const handleOpenEditDialog = (collaborator) => {
    setSelectedCollaborator(collaborator);
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
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (projectIsError) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
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
        <Alert severity="warning" sx={{ borderRadius: "12px" }}>
          Project not found.
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, padding: 4, margin: "0 auto" }}>
        {/* Light Header */}
        <LightHeader>
          <Box display="flex" alignItems="center" mb={1.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {project?.projectName}
            </Typography>
            <Chip
              label="Active"
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography variant="body1" sx={{ maxWidth: "800px", mb: 1.5 }}>
            {project?.projectDescription}
          </Typography>

          {project?.githubRepoLink && (
            <Box display="flex" alignItems="center">
              <GitHubIcon sx={{ mr: 1, color: "primary.main" }} />
              <Link
                href={project.githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                }}
              >
                {project.githubRepoLink.replace("https://", "")}
              </Link>
            </Box>
          )}
        </LightHeader>

        {/* Action Buttons Section */}
        <Box
          sx={{
            display: "grid",
            // Adjust grid columns if you prefer 4 items in a row on larger screens
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5, // Increased gap slightly
            mb: 3,
          }}
        >
          <ActionButton
            onClick={() => handleButtonClick("userStory")}
            startIcon={<DescriptionIcon sx={{ color: "#fbbf24" }} />} // Amber
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#8b5cf6" }} // Violet
            >
              User Stories
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Create and manage requirements
            </Typography>
          </ActionButton>

          <ActionButton
            onClick={() => {
              if (
                developerPermissions?.includes("Code analysis") ||
                user_role === "manager"
              ) {
                handleButtonClick("codeAnalysis");
              }
            }}
            startIcon={<CodeIcon sx={{ color: "#38bdf8" }} />}
            disabled={
              !(
                user_role === "manager" ||
                developerPermissions?.includes("Code analysis")
              )
            } // disables if permission not present
            sx={{
              opacity: !(
                user_role === "manager" ||
                developerPermissions?.includes("Code analysis")
              )
                ? 0.5
                : 1,
              pointerEvents: !(
                user_role === "manager" ||
                developerPermissions?.includes("Code analysis")
              )
                ? "none"
                : "auto",
              backgroundColor: "#f5f5f5", // light gray background for disabled
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#10b981" }}
            >
              Code Analysis
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Review and analyze code
            </Typography>
          </ActionButton>

          <ActionButton
            onClick={() => {
              if (
                developerPermissions?.includes("documentation") ||
                user_role === "manager"
              ) {
                handleButtonClick("codeAnalysis");
              }
            }}
            startIcon={<DescriptionIcon sx={{ color: "#a3e635" }} />} // Lime
            disabled={
              !(
                user_role === "manager" ||
                developerPermissions?.includes("documentation")
              )
            } // disables if permission not present
            sx={{
              opacity: !(
                user_role === "manager" ||
                developerPermissions?.includes("documentation")
              )
                ? 0.5
                : 1,
              pointerEvents: !(
                user_role === "manager" ||
                developerPermissions?.includes("documentation")
              )
                ? "none"
                : "auto",
              backgroundColor: "#f5f5f5", // light gray background for disabled
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#ec4899" }} // Pink
            >
              Documentation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage project docs
            </Typography>
          </ActionButton>

          {/* START: New ActionButton for PR/Branch Management */}
          <ActionButton
            onClick={() => handleButtonClick("managePrBranches")}
            startIcon={<AccountTreeIcon sx={{ color: "#f97316" }} />} // Orange
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#6366f1" }} // Indigo
            >
              PR & Branches
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage repository activity
            </Typography>
          </ActionButton>
          {/* END: New ActionButton for PR/Branch Management */}
        </Box>

        {/* Collaborators Section */}
        <CollaboratorCard>
          <CardContent sx={{ py: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box display="flex" alignItems="center">
                <PeopleIcon
                  sx={{ mr: 1, color: "primary.main", fontSize: 24 }}
                />
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  Team Collaborators
                </Typography>
                <Chip
                  label={`${collaborators.length} members`}
                  size="small"
                  sx={{ ml: 1.5, backgroundColor: "#f0f9ff", fontWeight: 500 }}
                />
              </Box>

              {user_role === "manager" ? (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleOpenAddDialog}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    backgroundColor: "#e3f2fd", // Light blue background initially
                    borderColor: "#bbdefb", // Light border
                    color: "#1976d2", // Primary blue text
                    "&:hover": {
                      backgroundColor: "#90caf9", // Darker blue on hover
                      borderColor: "#64b5f6", // Darker border on hover
                      color: "#0d47a1", // Even deeper blue text on hover (optional)
                    },
                  }}
                >
                  Add Collaborators
                </Button>
              ) : null}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {collaboratorsLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={32} />
              </Box>
            ) : collaboratorsIsError ? (
              <Alert severity="error" sx={{ borderRadius: "8px" }}>
                {collaboratorsError?.data?.message ||
                  "Error loading collaborators"}
              </Alert>
            ) : collaborators.length > 0 ? (
              <List dense sx={{ py: 0 }}>
                {collaborators.map((collab) => (
                  <ListItem
                    key={collab.githubId || collab.username}
                    disablePadding
                    secondaryAction={
                      <Box>
                        {user_role === "manager" ? (
                          <>
                            {" "}
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(collab);
                              }}
                              sx={{ mr: 0.5, color: "primary.main" }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(collab);
                              }}
                              sx={{ color: "error.main" }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : null}
                      </Box>
                    }
                    sx={{
                      py: 1.5,
                      borderBottom: "1px solid #f3f4f6",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={collab.avatarUrl}
                        alt={collab.username}
                        sx={{ width: 40, height: 40 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {collab.username}
                          </Typography>
                          <Chip
                            label={collab.status}
                            size="small"
                            sx={{
                              ml: 1,
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: "20px",
                              backgroundColor:
                                collab.status === "accepted"
                                  ? "#dcfce7"
                                  : collab.status === "pending"
                                  ? "#fef9c3"
                                  : "#fee2e2",
                              color:
                                collab.status === "accepted"
                                  ? "#166534"
                                  : collab.status === "pending"
                                  ? "#854d0e"
                                  : "#b91c1c",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {collab.permissions &&
                          collab.permissions.length > 0 ? (
                            collab.permissions.map((perm) => (
                              <PermissionChip
                                key={perm}
                                label={perm}
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              No specific permissions
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <PeopleIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 1 }} />
                <Typography variant="body1" color="textSecondary">
                  No collaborators yet
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  Add team members to collaborate
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  size="small"
                  sx={{ mt: 1.5 }}
                >
                  Add Collaborator
                </Button>
              </Box>
            )}
          </CardContent>
        </CollaboratorCard>

        {/* Add New Collaborator Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#f0f9ff",
              color: "primary.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 600,
            }}
          >
            <Box display="flex" alignItems="center">
              <AddIcon sx={{ mr: 1 }} />
              Add New Collaborator
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Search GitHub Username"
              type="text"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              helperText="Type at least 3 characters to search"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <GitHubIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              size="small"
            />

            {searchLoading && (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            )}

            {searchIsError && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: "8px" }}>
                {searchError?.data?.message || "Search error"}
              </Alert>
            )}

            {!searchLoading &&
              !searchIsError &&
              searchTerm.length >= 3 &&
              searchResults?.users?.length === 0 && (
                <Box textAlign="center" py={1}>
                  <Typography variant="body2" color="textSecondary">
                    No users found
                  </Typography>
                </Box>
              )}

            {searchResults?.users && searchResults.users.length > 0 && (
              <List
                sx={{
                  maxHeight: 250,
                  overflow: "auto",
                  mt: 1,
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                {searchResults.users.map((user) => (
                  <ListItemButton
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    selected={selectedUser?.id === user.id}
                    sx={{ borderRadius: "6px", py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.avatar_url}
                        alt={user.login}
                        sx={{ width: 36, height: 36 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.login}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}

            {selectedUser && (
              <Box
                sx={{
                  mt: 2,
                  mb: 1,
                  p: 2,
                  bgcolor: "#f9fafb",
                  borderRadius: "10px",
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Permissions for {selectedUser.login}
                </Typography>
                <FormGroup
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1,
                  }}
                >
                  {availablePermissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          name={permission}
                          checked={selectedPermissions.includes(permission)}
                          onChange={handlePermissionChange}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                          {permission}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {addCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: "8px" }}>
                {addCollaboratorError.data?.message ||
                  "Error adding collaborator"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: "12px 16px", borderTop: "1px solid #e5e7eb" }}
          >
            <Button
              onClick={handleCloseAddDialog}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCollaborator}
              disabled={!selectedUser || addCollaboratorLoading}
              variant="contained"
              color="primary"
              size="small"
            >
              {addCollaboratorLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Collaborator"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Collaborator Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#fef2f2",
              color: "error.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 600,
            }}
          >
            <Box display="flex" alignItems="center">
              <DeleteIcon sx={{ mr: 1 }} />
              Confirm Deletion
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            <Box textAlign="center" py={1}>
              <DeleteIcon sx={{ fontSize: 48, color: "#fecaca", mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Remove {selectedCollaborator?.username}?
              </Typography>
              <Typography variant="body2">
                This will remove them from the project and GitHub repository
              </Typography>
            </Box>

            {deleteCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: "8px" }}>
                {deleteCollaboratorError.data?.message || "Error deleting"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: "12px 16px", borderTop: "1px solid #e5e7eb" }}
          >
            <Button
              onClick={handleCloseDeleteDialog}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteCollaboratorLoading}
              size="small"
            >
              {deleteCollaboratorLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#f0f9ff",
              color: "primary.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 600,
            }}
          >
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 1 }} />
              Edit Permissions for {selectedCollaborator?.username}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            <Box
              sx={{
                mt: 1,
                mb: 1,
                p: 2,
                bgcolor: "#f9fafb",
                borderRadius: "10px",
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Permissions
              </Typography>
              <FormGroup
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        name={permission}
                        checked={permissionsToEdit.includes(permission)}
                        onChange={handleEditPermissionChange}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                        {permission}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                ))}
              </FormGroup>
            </Box>

            {updatePermissionsIsError && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: "8px" }}>
                {updatePermissionsError.data?.message || "Error updating"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: "12px 16px", borderTop: "1px solid #e5e7eb" }}
          >
            <Button
              onClick={handleCloseEditDialog}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              variant="contained"
              color="primary"
              disabled={updatePermissionsLoading}
              size="small"
            >
              {updatePermissionsLoading ? (
                <CircularProgress size={20} color="inherit" />
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
