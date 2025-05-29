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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Link,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Import ThemeProvider and createTheme
import {
  useCreateProjectMutation,
  useGetGitHubAuthStatusQuery,
  useGetProjectsQuery,
  useGetUserGithubReposQuery,
} from "@/features/projectApiSlice";

// Create a default Material-UI theme
const defaultTheme = createTheme();

// Styled components for consistent UI elements
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3], // This now correctly accesses theme.shadows
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: "bold",
}));

const ProjectPage = () => {
  const { userId } = useParams();
  const router = useRouter();

  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    projectDescription: "",
    githubRepoLink: "",
  });
  const [selectedRepo, setSelectedRepo] = useState("");
  const [createNewRepoOption, setCreateNewRepoOption] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  // RTK Query hooks
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsIsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery(userId, {
    skip: !userId,
  });

  const [
    createProjectMutation,
    {
      isLoading: createProjectLoading,
      isSuccess: createProjectSuccess,
      isError: createProjectIsError,
      error: createProjectError,
      reset: resetCreateProjectMutation,
    },
  ] = useCreateProjectMutation();

  const {
    data: githubAuthStatusData,
    isLoading: githubAuthStatusLoading,
    isError: githubAuthStatusIsError,
    error: githubAuthStatusError,
    refetch: refetchGithubAuthStatus,
  } = useGetGitHubAuthStatusQuery();

  const {
    data: githubReposData,
    isLoading: githubReposLoading,
    isError: githubReposIsError,
    error: githubReposError,
    refetch: refetchGithubRepos,
  } = useGetUserGithubReposQuery(undefined, {
    skip: !openDialog || !githubAuthStatusData?.isAuthenticated,
  });

  const projects = projectsData?.projects || [];

  const githubAuthStatus = githubAuthStatusData?.isAuthenticated || false;

  useEffect(() => {
    if (createProjectSuccess) {
      setOpenDialog(false);
      refetchProjects();
      resetCreateProjectMutation();
    }
  }, [createProjectSuccess, refetchProjects, resetCreateProjectMutation]);

  useEffect(() => {
    if (createProjectIsError) {
      console.error("Error creating project:", createProjectError);
    }
  }, [createProjectIsError, createProjectError]);

  const handleOpenDialog = async () => {
    setNewProject({
      projectName: "",
      projectDescription: "",
      githubRepoLink: "",
    });
    setNewRepoName("");
    setSelectedRepo("");
    setCreateNewRepoOption(false);

    await refetchGithubAuthStatus();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetCreateProjectMutation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectClick = (id) => {
    router.push(`/${userId}/create-project/${id}`);
  };

  const handleRepoSelectChange = (e) => {
    setSelectedRepo(e.target.value);
    setNewProject((prev) => ({ ...prev, githubRepoLink: e.target.value }));
  };

  const handleCreateNewRepoToggle = (e) => {
    setCreateNewRepoOption(e.target.checked);
    setNewProject((prev) => ({ ...prev, githubRepoLink: "" }));
    setSelectedRepo("");
    setNewRepoName("");
  };

  const handleSubmitProject = async () => {
    if (!newProject.projectName || !newProject.projectDescription) {
      return;
    }

    let finalGithubRepoLink = newProject.githubRepoLink;
    if (createNewRepoOption) {
      if (!newRepoName) {
        return;
      }
    } else if (!selectedRepo && githubAuthStatus) {
      return;
    } else if (!newProject.githubRepoLink && !githubAuthStatus) {
      return;
    }

    try {
      const projectPayload = {
        projectName: newProject.projectName,
        projectDescription: newProject.projectDescription,
        githubRepoLink: finalGithubRepoLink,
        createNewRepo: createNewRepoOption,
        repoName: createNewRepoOption ? newRepoName : undefined,
      };

      await createProjectMutation(projectPayload).unwrap();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const overallLoading = projectsLoading;
  const overallError = projectsIsError ? projectsError : null;

  const dialogLoading =
    createProjectLoading ||
    githubAuthStatusLoading ||
    (openDialog && githubReposLoading);
  const dialogError = createProjectIsError
    ? createProjectError
    : githubAuthStatusIsError
    ? githubAuthStatusError
    : githubReposIsError
    ? githubReposError
    : null;

  return (
    // Wrap the component with ThemeProvider
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          p: 3,
          maxWidth: 900,
          margin: "auto",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: "bold", color: "#333" }}
        >
          My Projects
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={overallLoading}
          >
            Create New Project
          </StyledButton>
        </Box>

        {overallLoading && (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        )}
        {overallError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {overallError.data?.message || "Failed to load projects."}
          </Alert>
        )}

        {!projectsLoading && projects.length === 0 && !overallError && (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mt: 5 }}
          >
            No projects found. Click "Create New Project" to get started!
          </Typography>
        )}

        {/* List of existing projects */}
        <Box>
          {projects.map((project) => (
            <StyledCard key={project._id}>
              <CardContent>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: "bold", color: "#555" }}
                  onClick={() => handleProjectClick(project._id)}
                >
                  {project.projectName}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {project.projectDescription}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  GitHub Repo:{" "}
                  <Link
                    href={project.githubRepoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.githubRepoLink}
                  </Link>
                </Typography>
              </CardContent>
            </StyledCard>
          ))}
        </Box>

        {/* Create New Project Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent dividers>
            {dialogLoading && (
              <CircularProgress
                size={24}
                sx={{ display: "block", margin: "10px auto" }}
              />
            )}
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError.data?.message || "An error occurred."}
              </Alert>
            )}

            {!githubAuthStatus && !githubAuthStatusLoading && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You are not authenticated to GitHub. You can still create a
                project, but you won't be able to link to or create GitHub
                repositories directly.
              </Alert>
            )}

            <TextField
              autoFocus
              margin="dense"
              name="projectName"
              label="Project Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newProject.projectName}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="projectDescription"
              label="Project Short Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newProject.projectDescription}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />

            {githubAuthStatus ? (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createNewRepoOption}
                      onChange={handleCreateNewRepoToggle}
                      name="createNewRepo"
                      color="primary"
                    />
                  }
                  label="Create New Private GitHub Repository"
                  sx={{ mb: 2 }}
                />

                {createNewRepoOption ? (
                  <TextField
                    margin="dense"
                    name="newRepoName"
                    label="New GitHub Repository Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    sx={{ mb: 2 }}
                    placeholder={newProject.projectName
                      .toLowerCase()
                      .replace(/\s/g, "-")}
                  />
                ) : (
                  <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                    <InputLabel id="github-repo-select-label">
                      Select Existing GitHub Repository
                    </InputLabel>
                    <Select
                      labelId="github-repo-select-label"
                      id="github-repo-select"
                      value={selectedRepo}
                      label="Select Existing GitHub Repository"
                      onChange={handleRepoSelectChange}
                      disabled={
                        githubReposLoading ||
                        !githubReposData?.repos ||
                        githubReposData.repos.length === 0
                      }
                    >
                      {githubReposLoading ? (
                        <MenuItem disabled>Loading repositories...</MenuItem>
                      ) : githubReposData?.repos &&
                        githubReposData.repos.length > 0 ? (
                        githubReposData.repos.map((repo) => (
                          <MenuItem key={repo.html_url} value={repo.html_url}>
                            {repo.full_name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No private repositories found.
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </>
            ) : (
              <TextField
                margin="dense"
                name="githubRepoLink"
                label="GitHub Repository Link (Optional, Manual Entry)"
                type="url"
                fullWidth
                variant="outlined"
                value={newProject.githubRepoLink}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                helperText="Enter a GitHub link manually if not authenticated or creating a new repo."
              />
            )}
          </DialogContent>
          <DialogActions>
            <StyledButton
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Cancel
            </StyledButton>
            <StyledButton
              onClick={handleSubmitProject}
              color="primary"
              variant="contained"
              disabled={
                dialogLoading ||
                !newProject.projectName ||
                !newProject.projectDescription ||
                (githubAuthStatus && !createNewRepoOption && !selectedRepo) ||
                (createNewRepoOption && !newRepoName) ||
                (!githubAuthStatus && !newProject.githubRepoLink)
              }
            >
              Create Project
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectPage;
