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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Avatar,
  ListItemAvatar,
  Chip,
  Stack,
  Snackbar, // For better notifications
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useGenerateAiStoryMutation, // Import the new mutation hook
} from "@/features/userStoryApiSlice";

const defaultTheme = createTheme();

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: "bold",
  margin: theme.spacing(1),
}));

const UserStoryPage = () => {
  const params = useParams();
  const projectId = params.projectId;
  const router = useRouter();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState(""); // This will store the AI enhanced text
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Snackbar state for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success', 'error', 'warning', 'info'

  const {
    data: userStoriesData,
    isLoading: userStoriesLoading,
    isError: userStoriesIsError,
    error: userStoriesError,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(projectId, { skip: !projectId });

  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  const [
    createUserStory,
    {
      isLoading: createUserStoryLoading,
      isSuccess: createUserStorySuccess,
      isError: createUserStoryIsError,
      error: createUserStoryError,
      reset: resetCreateUserStoryMutation,
    },
  ] = useCreateUserStoryMutation();

  // Mutation for generating AI story
  const [
    generateAiStory,
    {
      isLoading: generateAiStoryLoading, // Separate loading state for AI generation
      isError: generateAiStoryIsError,
      error: generateAiStoryError,
    },
  ] = useGenerateAiStoryMutation();

  const handleShowSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (createUserStorySuccess) {
      handleShowSnackbar("User story created successfully!", "success");
      setOpenCreateDialog(false);
      setUserStoryTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setTestingScenarios("");
      setSelectedCollaboratorGithubIds([]);
      setGeneratedStoryContent(""); // Clear AI content after successful save
      resetCreateUserStoryMutation();
      refetchUserStories();
    }
    if (createUserStoryIsError) {
      handleShowSnackbar(
        `Failed to create user story: ${
          createUserStoryError?.data?.message || "Unknown error"
        }`,
        "error"
      );
    }
  }, [
    createUserStorySuccess,
    createUserStoryIsError,
    createUserStoryError,
    refetchUserStories,
    resetCreateUserStoryMutation,
  ]);

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent(""); // Clear AI content when opening dialog
    if (createUserStoryIsError) resetCreateUserStoryMutation(); // Reset error state if any
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCollaboratorChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCollaboratorGithubIds((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleGenerateStory = async () => {
    if (
      !userStoryTitle ||
      !description ||
      !acceptanceCriteria ||
      !testingScenarios
    ) {
      handleShowSnackbar(
        "Please fill in Title, Description, Acceptance Criteria, and Testing Scenarios before generating AI content.",
        "warning"
      );
      return;
    }
    setIsGeneratingStory(true); // Use this for button's loading state
    setGeneratedStoryContent("");

    try {
      const result = await generateAiStory({
        userStoryTitle,
        description,
        acceptanceCriteria,
        testingScenarios,
      }).unwrap(); // unwrap() to get the actual response or throw an error

      if (result.success && result.aiEnhancedText) {
        setGeneratedStoryContent(result.aiEnhancedText);
        handleShowSnackbar(
          "AI story content generated successfully!",
          "success"
        );
      } else {
        throw new Error(
          result.message || "Failed to get AI content from server."
        );
      }
    } catch (err) {
      console.error("Error calling generateAiStory mutation:", err);
      setGeneratedStoryContent(
        "Error generating story. Please check console or try again."
      );
      handleShowSnackbar(
        `Error generating AI story: ${
          err.data?.message || err.message || "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSubmitUserStory = async () => {
    if (
      !userStoryTitle ||
      !description ||
      !acceptanceCriteria ||
      !testingScenarios ||
      !projectId
    ) {
      handleShowSnackbar("Please fill all required fields.", "warning");
      return;
    }

    try {
      await createUserStory({
        projectId,
        userStoryTitle,
        description,
        acceptanceCriteria,
        testingScenarios,
        collaboratorGithubIds: selectedCollaboratorGithubIds,
        aiEnhancedUserStory: generatedStoryContent, // Include the AI generated content
      }).unwrap();
      // Success is handled by the useEffect hook
    } catch (err) {
      // Error is handled by the useEffect hook, but log for debugging
      console.error(
        "Failed to create user story (handleSubmitUserStory):",
        err
      );
    }
  };

  const userStories = userStoriesData?.userStories || [];
  const availableCollaborators = collaboratorsData?.collaborators || [];

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000, margin: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            User Stories
          </Typography>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleOpenCreateDialog}
          >
            Create User Story
          </StyledButton>
        </Box>

        {userStoriesLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : userStoriesIsError ? (
          <Alert severity="error">
            Failed to load user stories:{" "}
            {userStoriesError?.data?.message ||
              userStoriesError?.status ||
              "Unknown error"}
          </Alert>
        ) : userStories.length === 0 ? (
          <Alert severity="info">
            No user stories created yet for this project.
          </Alert>
        ) : (
          <List>
            {userStories.map((story) => (
              <Card
                key={story._id}
                sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {story.userStoryTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                  >
                    <strong>Description:</strong> {story.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                  >
                    <strong>Acceptance Criteria:</strong>{" "}
                    {story.acceptanceCriteria}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                  >
                    <strong>Testing Scenarios:</strong> {story.testingScenarios}
                  </Typography>
                  {story.aiEnhancedUserStory && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        border: "1px dashed #ccc",
                        borderRadius: 1,
                        backgroundColor: "#f0f8ff",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        AI Enhanced Content:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {story.aiEnhancedUserStory}
                      </Typography>
                    </Box>
                  )}
                  {story.collaborators && story.collaborators.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Assigned Collaborators:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" spacing={1}>
                        {story.collaborators.map((collab) => (
                          <Chip
                            key={collab.githubId}
                            avatar={
                              <Avatar
                                src={collab.avatarUrl}
                                alt={collab.username}
                              />
                            }
                            label={collab.username}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 2, color: "text.disabled" }}
                  >
                    Created: {new Date(story.createdAt).toLocaleString()} |
                    Updated: {new Date(story.updatedAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        <Dialog
          open={openCreateDialog}
          onClose={handleCloseCreateDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Create New User Story</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="user-story-title"
              label="User Story Title"
              type="text"
              fullWidth
              variant="outlined"
              value={userStoryTitle}
              onChange={(e) => setUserStoryTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="acceptance-criteria"
              label="Acceptance Criteria (one per line)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="testing-scenarios"
              label="Testing Scenarios (one per line)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={testingScenarios}
              onChange={(e) => setTestingScenarios(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assign Collaborators
              </Typography>
              {collaboratorsLoading ? (
                <CircularProgress size={20} />
              ) : collaboratorsIsError ? (
                <Alert severity="error">
                  Failed to load collaborators:{" "}
                  {collaboratorsError?.data?.message || "Error"}
                </Alert>
              ) : availableCollaborators.length > 0 ? (
                <FormGroup>
                  {availableCollaborators.map((collab) => (
                    <FormControlLabel
                      key={collab.githubId}
                      control={
                        <Checkbox
                          value={collab.githubId}
                          checked={selectedCollaboratorGithubIds.includes(
                            collab.githubId
                          )}
                          onChange={handleCollaboratorChange}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={collab.avatarUrl}
                            alt={collab.username}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          {collab.username}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No accepted collaborators found for this project.
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory || generateAiStoryLoading} // Disable if either generation is in progress
                sx={{ mr: 1 }} // Add some margin
              >
                {isGeneratingStory || generateAiStoryLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Generate Story Content (AI)"
                )}
              </Button>
            </Box>

            {generatedStoryContent && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  backgroundColor: "#f9f9f9",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  AI Enhanced Suggestions:
                </Typography>
                <Typography variant="body2">{generatedStoryContent}</Typography>
              </Box>
            )}
            {/* Display AI generation error if any */}
            {generateAiStoryIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to generate AI content:{" "}
                {generateAiStoryError?.data?.message ||
                  generateAiStoryError?.message ||
                  "Unknown error"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseCreateDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUserStory}
              variant="contained"
              disabled={
                createUserStoryLoading ||
                isGeneratingStory ||
                generateAiStoryLoading
              } // Also disable if AI is generating
            >
              {createUserStoryLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save User Story"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default UserStoryPage;
