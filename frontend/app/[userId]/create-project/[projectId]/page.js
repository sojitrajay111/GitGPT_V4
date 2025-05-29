"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  ListItemButton, // Changed from ListItem button prop for better MUI v5 practice
  ListItemText,
  Avatar,
  ListItemAvatar,
} from "@mui/material";
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  useGetCollaboratorsQuery,
  useGetProjectByIdQuery,
} from "@/features/projectApiSlice";
import {
  useAddCollaboratorMutation,
  useSearchGithubUsersQuery,
} from "@/features/githubApiSlice";
// Updated imports based on the new API slice structure

const defaultTheme = createTheme();

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: "bold",
  margin: theme.spacing(1),
}));

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId; // Correctly accessing the route parameter

  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Stores the entire selected user object

  // Fetch project details
  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError,
    refetch: refetchProjectDetails, // Added refetch for project details if needed
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  // Fetch collaborators for the project
  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError, // Added error handling for collaborators
    error: collaboratorsError, // Added error handling for collaborators
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // Search for GitHub users
  // The hook will automatically refetch when searchTerm changes (if not skipped)
  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchIsError, // Added error handling for search
    error: searchError, // Added error handling for search
  } = useSearchGithubUsersQuery(searchTerm, {
    skip: searchTerm.length < 3, // Only search if term is 3+ chars
  });

  // Mutation to add a collaborator
  const [
    addCollaborator,
    {
      isLoading: addCollaboratorLoading,
      isSuccess: addCollaboratorSuccess,
      isError: addCollaboratorIsError,
      error: addCollaboratorError,
      reset: resetAddCollaboratorMutation, // To reset mutation state
    },
  ] = useAddCollaboratorMutation();

  // Effect to handle successful collaborator addition
  useEffect(() => {
    if (addCollaboratorSuccess) {
      setOpenDialog(false);
      setSearchTerm("");
      setSelectedUser(null);
      refetchCollaborators(); // Refetch collaborators list
      resetAddCollaboratorMutation(); // Reset the mutation state
    }
  }, [
    addCollaboratorSuccess,
    refetchCollaborators,
    resetAddCollaboratorMutation,
  ]);

  const handleOpenDialog = () => {
    setSearchTerm("");
    setSelectedUser(null);
    resetAddCollaboratorMutation(); // Reset mutation state when opening dialog
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchTerm("");
    setSelectedUser(null);
  };

  const handleAddCollaborator = async () => {
    if (selectedUser && projectId) {
      // Ensure projectId is available
      try {
        await addCollaborator({
          projectId,
          githubUsername: selectedUser.login, // 'login' is typically the GitHub username field
        }).unwrap();
      } catch (err) {
        console.error("Failed to add collaborator:", err);
        // Error is already handled by addCollaboratorIsError and addCollaboratorError
      }
    }
  };

  const project = projectData?.project;
  const collaborators = collaboratorsData?.collaborators || [];

  // Main page loading state
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

  // Main page error state
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
          <StyledButton variant="contained" color="primary">
            User Story Creation
          </StyledButton>
          <StyledButton variant="contained" color="secondary">
            Code Analysis
          </StyledButton>
          <StyledButton
            variant="contained"
            sx={{
              backgroundColor: "success.main",
              "&:hover": { backgroundColor: "success.dark" },
            }}
          >
            Documentation
          </StyledButton>
        </Box>

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
                onClick={handleOpenDialog}
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
                  >
                    <ListItemText primary={collab.username} />
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

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
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
            {addCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to add collaborator:{" "}
                {addCollaboratorError.data?.message ||
                  "An unknown error occurred"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDialog} color="inherit">
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
      </Box>
    </ThemeProvider>
  );
};

export default ProjectDetailPage;
