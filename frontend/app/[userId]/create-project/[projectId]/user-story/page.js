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
  Chip, // For displaying selected collaborators
  Stack, // For spacing chips
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice"; // To get project collaborators
import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
} from "@/features/userStoryApiSlice"; // New API slice for user stories

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
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Fetch existing user stories for this project
  const {
    data: userStoriesData,
    isLoading: userStoriesLoading,
    isError: userStoriesIsError,
    error: userStoriesError,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(projectId, { skip: !projectId });

  // Fetch collaborators for the project
  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // Mutation to create a new user story
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

  // Effect to handle successful user story creation
  useEffect(() => {
    if (createUserStorySuccess) {
      setOpenCreateDialog(false);
      // Reset form fields
      setUserStoryTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setTestingScenarios("");
      setSelectedCollaboratorGithubIds([]);
      setGeneratedStoryContent("");
      resetCreateUserStoryMutation();
      refetchUserStories(); // Refetch to show the new story
    }
  }, [
    createUserStorySuccess,
    refetchUserStories,
    resetCreateUserStoryMutation,
  ]);

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    // Reset form fields when opening the dialog
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCollaboratorChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedCollaboratorGithubIds((prev) => [...prev, value]);
    } else {
      setSelectedCollaboratorGithubIds((prev) =>
        prev.filter((id) => id !== value)
      );
    }
  };

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    setGeneratedStoryContent(""); // Clear previous content

    const prompt = `Generate a detailed user story based on the following information:
    Title: ${userStoryTitle}
    Description: ${description}
    Acceptance Criteria: ${acceptanceCriteria}
    Testing Scenarios: ${testingScenarios}

    Please provide the output in a clear, concise format, suitable for a user story document.`;

    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = ""; // Leave as empty string, Canvas will provide
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedStoryContent(text);
      } else {
        setGeneratedStoryContent("Failed to generate story. Please try again.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setGeneratedStoryContent("Error generating story. Please check console.");
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
      // Basic client-side validation
      // Using alert for simplicity, replace with MUI Snackbar/Dialog for better UX
      alert("Please fill all required fields.");
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
      }).unwrap();
    } catch (err) {
      console.error("Failed to create user story:", err);
    }
  };

  const userStories = userStoriesData?.userStories || [];
  const availableCollaborators =
    collaboratorsData?.collaborators?.filter(
      (collab) => collab.status === "accepted"
    ) || [];

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
            User Stories for Project {projectId}
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
              <Card key={story._id} sx={{ mb: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {story.userStoryTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Description: {story.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Acceptance Criteria: {story.acceptanceCriteria}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Testing Scenarios: {story.testingScenarios}
                  </Typography>
                  {story.collaborators && story.collaborators.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Assigned Collaborators:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" spacing={1}>
                        {story.collaborators.map((collab) => (
                          <Chip
                            key={collab.githubId}
                            avatar={<Avatar src={collab.avatarUrl} />}
                            label={collab.username}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Created at: {new Date(story.createdAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        {/* Create User Story Dialog */}
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
              label="Acceptance Criteria"
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
              label="Testing Scenarios"
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
                disabled={isGeneratingStory}
              >
                {isGeneratingStory ? (
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
                  whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Generated Story:
                </Typography>
                <Typography variant="body2">{generatedStoryContent}</Typography>
              </Box>
            )}

            {createUserStoryIsError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to create user story:{" "}
                {createUserStoryError?.data?.message ||
                  "An unknown error occurred"}
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
              disabled={createUserStoryLoading}
            >
              {createUserStoryLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save User Story"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default UserStoryPage;
