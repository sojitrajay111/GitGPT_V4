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
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useGenerateAiStoryMutation,
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

// Custom light theme with professional palette
const freshTheme = createTheme({
  palette: {
    primary: {
      main: "#5e72e4", // Soft indigo
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#11cdef", // Cyan
    },
    success: {
      main: "#2dce89", // Mint green
    },
    background: {
      default: "#f8f9fe", // Very light purple
      paper: "#ffffff",
    },
    text: {
      primary: "#32325d", // Dark blue-gray
      secondary: "#525f7f", // Medium blue-gray
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "1.8rem",
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    body1: {
      fontSize: "0.95rem",
    },
    body2: {
      fontSize: "0.85rem",
      color: "#525f7f",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "8px 20px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
          },
        },
        contained: {
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e9ecef",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
              "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "#e9ecef",
            },
            "&:hover fieldset": {
              borderColor: "#5e72e4",
            },
          },
        },
      },
    },
  },
});

// Custom styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
  color: "white",
  borderRadius: "16px",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
}));

const StoryCard = styled(Card)(({ theme }) => ({
  borderLeft: "4px solid #5e72e4",
  marginBottom: theme.spacing(3),
  "&:hover": {
    borderLeftColor: "#11cdef",
  },
}));

const AIContentBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #f8f9fe 0%, #f0f5ff 100%)",
  border: "1px solid #e0e7ff",
  borderRadius: "12px",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  position: "relative",
  "&:before": {
    content: '"✨"',
    position: "absolute",
    top: "-12px",
    left: "20px",
    fontSize: "1.5rem",
  },
}));

const CollaboratorChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#f0f5ff",
  color: "#5e72e4",
  fontWeight: 500,
  marginRight: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  "& .MuiAvatar-root": {
    width: 24,
    height: 24,
    fontSize: "0.75rem",
  },
}));
const UserStoryPage = () => {
  const params = useParams();
  const userId = params.userId;
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

  const { data: userData } = useGetUserAndGithubDataQuery(userId);

  const user_role = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    projectId && githubId && user_role === "developer"
      ? { projectId, githubId }
      : skipToken
  );

  const { data: developerUserStories } =
    useGetDeveloperUserStoriesQuery(githubId);

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

  const userStories =
    user_role === "developer"
      ? developerUserStories
      : userStoriesData?.userStories || [];
  const availableCollaborators = collaboratorsData?.collaborators || [];

  return (
    <ThemeProvider theme={freshTheme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: "0 auto" }}>
        {/* Header with gradient */}
        <HeaderCard>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                User Stories
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, maxWidth: "600px" }}
              >
                Create and manage user stories to define project requirements
                and features
              </Typography>
            </Box>
            {user_role === "developer" &&
            developerPermissions?.includes("User story creation") ? (
              <Button
                variant="contained"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "#5e72e4",
                  "&:hover": {
                    backgroundColor: "#f8f9fe",
                  },
                }}
              >
                Create User Story
              </Button>
            ) : user_role === "manager" ? (
              <Button
                variant="contained"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "#5e72e4",
                  "&:hover": {
                    backgroundColor: "#f8f9fe",
                  },
                }}
              >
                Create User Story
              </Button>
            ) : null}
          </Box>
        </HeaderCard>

        {/* User Stories List */}
        {userStoriesLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={50} thickness={4} />
          </Box>
        ) : userStoriesIsError ? (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {userStoriesError?.data?.message || "Failed to load user stories"}
          </Alert>
        ) : userStories.length === 0 ? (
          <Box
            textAlign="center"
            py={4}
            sx={{ backgroundColor: "#f8f9fe", borderRadius: "16px" }}
          >
            <DescriptionIcon sx={{ fontSize: 60, color: "#cad0e0", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No user stories created yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Start by creating your first user story
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateDialog}
              startIcon={<AddIcon />}
            >
              Create First Story
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {userStories.map((story) => (
              <StoryCard key={story._id}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start">
                    <CheckCircleOutlineIcon
                      sx={{
                        color: "#2dce89",
                        mr: 2,
                        mt: 0.5,
                        fontSize: "1.8rem",
                      }}
                    />
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {story.userStoryTitle}
                      </Typography>

                      <Box mb={1.5}>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          fontWeight={500}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {story.description}
                        </Typography>
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={2} mb={1.5}>
                        <Box flex="1" minWidth="200px">
                          <Typography
                            variant="body2"
                            color="text.primary"
                            fontWeight={500}
                          >
                            Acceptance Criteria
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {story.acceptanceCriteria}
                          </Typography>
                        </Box>

                        <Box flex="1" minWidth="200px">
                          <Typography
                            variant="body2"
                            color="text.primary"
                            fontWeight={500}
                          >
                            Testing Scenarios
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {story.testingScenarios}
                          </Typography>
                        </Box>
                      </Box>

                      {story.aiEnhancedUserStory && (
                        <AIContentBox>
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            fontWeight={600}
                            gutterBottom
                          >
                            AI ENHANCED SUGGESTIONS
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {story.aiEnhancedUserStory}
                          </Typography>
                        </AIContentBox>
                      )}

                      {story.collaborators &&
                        story.collaborators.length > 0 && (
                          <Box mt={2}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <PeopleAltIcon
                                sx={{
                                  color: "#5e72e4",
                                  mr: 1,
                                  fontSize: "1.2rem",
                                }}
                              />
                              <Typography variant="body2" fontWeight={500}>
                                Assigned Collaborators
                              </Typography>
                            </Box>
                            <Stack direction="row" flexWrap="wrap">
                              {story.collaborators.map((collab) => (
                                <CollaboratorChip
                                  key={collab.githubId}
                                  avatar={
                                    <Avatar
                                      src={collab.avatarUrl}
                                      alt={collab.username}
                                    />
                                  }
                                  label={collab.username}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="caption" color="textSecondary">
                        Created:{" "}
                        {new Date(story.createdAt).toLocaleDateString()} •
                        Updated:{" "}
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StoryCard>
            ))}
          </List>
        )}

        {/* Create User Story Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={handleCloseCreateDialog}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: "16px" } }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f8f9fe",
              borderBottom: "1px solid #e9ecef",
              fontWeight: 600,
              color: "#5e72e4",
            }}
          >
            <Box display="flex" alignItems="center">
              <AddIcon sx={{ mr: 1.5 }} />
              Create New User Story
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box
              display="grid"
              gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
              gap={3}
              sx={{ paddingTop: 5 }}
            >
              <Box>
                <TextField
                  autoFocus
                  fullWidth
                  label="User Story Title"
                  variant="outlined"
                  value={userStoryTitle}
                  onChange={(e) => setUserStoryTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Acceptance Criteria (one per line)"
                  multiline
                  rows={3}
                  variant="outlined"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Testing Scenarios (one per line)"
                  multiline
                  rows={3}
                  variant="outlined"
                  value={testingScenarios}
                  onChange={(e) => setTestingScenarios(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>

            {/* Collaborator Section */}
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

            {/* AI Generation Section */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="outlined"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory || generateAiStoryLoading}
                startIcon={<AutoFixHighIcon />}
                sx={{
                  borderWidth: "2px",
                  "&:hover": {
                    borderWidth: "2px",
                  },
                }}
              >
                {isGeneratingStory || generateAiStoryLoading ? (
                  <>Generating AI Content...</>
                ) : (
                  "Enhance with AI"
                )}
              </Button>
            </Box>

            {generatedStoryContent && (
              <AIContentBox>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  AI ENHANCED SUGGESTIONS
                </Typography>
                <Typography variant="body2">{generatedStoryContent}</Typography>
              </AIContentBox>
            )}

            {generateAiStoryIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>
                {generateAiStoryError?.data?.message || "AI generation failed"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: "16px 24px", borderTop: "1px solid #e9ecef" }}
          >
            <Button
              onClick={handleCloseCreateDialog}
              variant="outlined"
              sx={{
                borderColor: "#e9ecef",
                "&:hover": {
                  borderColor: "#5e72e4",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUserStory}
              variant="contained"
              disabled={createUserStoryLoading}
              sx={{
                backgroundColor: "#5e72e4",
                "&:hover": {
                  backgroundColor: "#4a5bd9",
                },
              }}
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
            sx={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              alignItems: "center",
            }}
            iconMapping={{
              success: <CheckCircleOutlineIcon fontSize="inherit" />,
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default UserStoryPage;
