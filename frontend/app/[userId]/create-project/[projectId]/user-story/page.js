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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Avatar,
  Chip,
  Stack,
  Snackbar,
  IconButton,
  Divider,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress, // Import LinearProgress for the progress bar
} from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  styled,
  keyframes,
} from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useGenerateAiStoryMutation,
  useGenerateSalesforceCodeMutation, // Import the new hook
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { ChevronLeft } from "lucide-react";

// Keyframes for futuristic loading animation
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// Professional theme
const freshTheme = createTheme({
  palette: {
    primary: { main: "#5e72e4" },
    secondary: { main: "#11cdef" },
    success: { main: "#2dce89" },
    error: { main: "#f5365c" },
    background: { default: "#f8f9fe", paper: "#ffffff" },
    text: { primary: "#32325d", secondary: "#525f7f" },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700, fontSize: "1.8rem" },
    h6: { fontWeight: 600, fontSize: "1.1rem" },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.85rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "8px 20px",
          fontWeight: 600,
          textTransform: "none",
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
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: "16px" } },
    },
  },
});

// Styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
  color: "white",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StoryCard = styled(Card)(({ theme }) => ({
  borderLeft: `5px solid ${theme.palette.primary.main}`,
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const AIContentBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #f8f9fe 0%, #f0f5ff 100%)",
  border: `1px solid #dee2e6`,
  borderRadius: "12px",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

// Styled Dialog for advanced loading
const LoadingDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    background: "linear-gradient(145deg, #1a2a4a 0%, #0a1525 100%)",
    color: "#e0e0e0",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
    border: "1px solid #0f3460",
    padding: theme.spacing(3),
    maxWidth: "500px",
    width: "90%",
    textAlign: "center",
  },
}));

// Styled component for animated progress icon
const AnimatedIcon = styled(Box)(({ theme }) => ({
  fontSize: "4rem",
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  animation: `${rotate} 2s linear infinite`,
  display: "inline-block",
}));

// Styled for status messages
const StatusMessage = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#ffffff",
  marginBottom: theme.spacing(2),
}));

// Styled for completed steps list
const CompletedStepsList = styled(Box)(({ theme }) => ({
  maxHeight: "150px",
  overflowY: "auto",
  textAlign: "left",
  paddingLeft: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderLeft: `2px solid ${theme.palette.secondary.main}`,
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "3px",
  },
}));

const CompletedStepItem = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: "#b0b0b0",
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(0.5),
  animation: `${fadeIn} 0.5s ease-out`,
  "& svg": {
    marginRight: theme.spacing(1),
    color: theme.palette.success.main,
  },
}));

const TruncatedText = ({ content, maxLines = 5, title }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = content ? content.split("\n") : [];
  const needsTruncation = lines.length > maxLines;

  const displayedContent =
    expanded || !needsTruncation
      ? content
      : lines.slice(0, maxLines).join("\n") + (needsTruncation ? "..." : "");

  return (
    <Box mb={1.5}>
      {title && (
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={500}
          mb={0.5}
        >
          {title}
        </Typography>
      )}
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
        {displayedContent}
      </Typography>
      {needsTruncation && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ mt: 1, p: 0 }}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </Box>
  );
};

const UserStoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId, projectId } = params;

  // State for dialogs and forms
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // NEW: State for code generation loading and status
  const [isGeneratingCodeProcess, setIsGeneratingCodeProcess] = useState(false);
  const [currentGenerationStatus, setCurrentGenerationStatus] = useState("");
  const [completedGenerationSteps, setCompletedGenerationSteps] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [activeGenerationStoryId, setActiveGenerationStoryId] = useState(null); // New state to track which story is generating

  // Form fields state
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState(""); // State for GitHub Repo URL - though project's will be used

  // State for menus and notifications
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // RTK Query Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const userRole = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  // Placeholder for project's GitHub Repo URL. In a real app, this would come from a project details query.
  // For this example, ensure you replace this with actual project data if available.
  const projectGithubRepoUrl = "https://github.com/your-org/your-repo-name"; // <<< IMPORTANT: REPLACE WITH ACTUAL PROJECT REPO URL LOGIC

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    { projectId, githubId },
    { skip: !projectId || !githubId || userRole !== "developer" }
  );
  const { data: developerUserStories } = useGetDeveloperUserStoriesQuery(
    githubId,
    { skip: !githubId }
  );
  const {
    data: userStoriesData,
    isLoading: storiesLoading,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(projectId, { skip: !projectId });
  const { data: collaboratorsData, isLoading: collaboratorsLoading } =
    useGetCollaboratorsQuery(projectId, { skip: !projectId });

  const [createUserStory, { isLoading: isCreating }] =
    useCreateUserStoryMutation();
  const [updateUserStory, { isLoading: isUpdating }] =
    useUpdateUserStoryMutation();
  const [deleteUserStory, { isLoading: isDeleting }] =
    useDeleteUserStoryMutation();
  const [generateAiStory, { isLoading: isGenerating }] =
    useGenerateAiStoryMutation();
  // We're not using the RTK Query mutation directly for streaming, but keeping it for reference if needed
  const [triggerSalesforceCodeGeneration] = useGenerateSalesforceCodeMutation();

  const canManageStories =
    userRole === "manager" ||
    developerPermissions?.includes("User story creation");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Handlers for story actions menu
  const handleMenuClick = (event, storyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentStoryId(storyId);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const resetForm = () => {
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
    setEditingStory(null);
    setGithubRepoUrl(""); // Reset GitHub Repo URL
  };

  // Open dialog for creating
  const handleOpenCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleOpenEditDialog = () => {
    const story = userStories.find((s) => s._id === currentStoryId);
    if (story) {
      setEditingStory(story);
      setUserStoryTitle(story.userStoryTitle);
      setDescription(story.description);
      setAcceptanceCriteria(story.acceptanceCriteria);
      setTestingScenarios(story.testingScenarios);
      setSelectedCollaboratorGithubIds(
        story.collaborators.map((c) => c.githubId)
      );
      setGeneratedStoryContent(story.aiEnhancedUserStory || "");
      // If editing, try to pre-fill githubRepoUrl if it was associated with the project
      // For now, assuming a default or project-level URL
      setGithubRepoUrl(projectGithubRepoUrl); // Set a default or fetch it based on projectId
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  // Open dialog for deleting
  const handleOpenDeleteDialog = () => {
    const story = userStories.find((s) => s._id === currentStoryId);
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDialogs = () => {
    setDialogOpen(false);
    setDeleteDialogOpen(false);
    // When closing the main dialog, also ensure the generation dialog is closed if it's open,
    // but only if the generation process is truly done or user explicitly closes it after error/completion.
    if (!isGeneratingCodeProcess) {
      // Only allow this if process is not active (or finished)
      setIsGeneratingCodeProcess(false);
      setCompletedGenerationSteps([]); // Clear steps on close
      setCurrentGenerationStatus(""); // Clear current status
      setGenerationError(null); // Clear any errors
      setGithubResult(null); // Clear result
      setActiveGenerationStoryId(null); // Reset active generation story
    }
  };

  // NEW: Handler for opening the generation dialog manually (from "Generating..." button)
  const handleOpenGenerationDialog = (storyId) => {
    setCurrentStoryId(storyId); // Set context for the dialog
    // Ensure the dialog opens if the process is active for this story
    if (activeGenerationStoryId === storyId) {
      setIsGeneratingCodeProcess(true);
    }
  };

  const handleCollaboratorChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCollaboratorGithubIds((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleGenerateStory = async () => {
    if (!userStoryTitle || !description) {
      showSnackbar(
        "Please fill in Title and Description before generating AI content.",
        "warning"
      );
      return;
    }
    try {
      const result = await generateAiStory({
        userStoryTitle,
        description,
        acceptanceCriteria,
        testingScenarios,
      }).unwrap();
      setGeneratedStoryContent(result.aiEnhancedText);
      showSnackbar("AI content generated successfully!");
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to generate AI content.",
        "error"
      );
    }
  };

  // NEW: Handler for generating Salesforce code with streaming updates
  const handleGenerateSalesforceCode = async () => {
    if (!currentStoryId) {
      showSnackbar("Please select a user story first.", "warning");
      return;
    }
    if (!projectGithubRepoUrl) {
      // Use the project's actual GitHub URL
      showSnackbar(
        "Project GitHub repository URL is not configured. Please update project settings.",
        "error"
      );
      return;
    }

    setIsGeneratingCodeProcess(true);
    setActiveGenerationStoryId(currentStoryId); // Set the active story for generation
    setCompletedGenerationSteps([]);
    setCurrentGenerationStatus("AI code generation initiated..."); // Initial status
    setGenerationError(null);
    setGithubResult(null);
    handleMenuClose(); // Close the story action menu

    // Immediately add the initial status to the completed steps list
    setCompletedGenerationSteps([
      { message: "AI code generation initiated..." },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-stories/${currentStoryId}/generate-salesforce-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent
          },
          body: JSON.stringify({
            projectId,
            githubRepoUrl: projectGithubRepoUrl,
          }),
        }
      );

      if (!response.ok) {
        // Handle non-streaming errors
        const errorData = await response.json();
        setGenerationError(
          errorData.message ||
            "An unknown error occurred during generation setup."
        );
        setCurrentGenerationStatus("Failed to start.");
        showSnackbar(
          errorData.message || "Failed to start code generation.",
          "error"
        );
        return;
      }

      // Use a ReadableStreamDefaultReader to process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process each complete SSE message
        let lastIndex = 0;
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n\n", lastIndex)) !== -1) {
          const eventString = buffer.substring(lastIndex, newlineIndex);
          lastIndex = newlineIndex + 2; // Move past the double newline

          if (eventString.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(eventString.substring(6)); // Remove 'data: ' prefix

              // Always add the new message to completed steps list if it's new
              setCompletedGenerationSteps((prev) => {
                // Only add if it's a new, meaningful status update.
                if (
                  prev.length === 0 ||
                  prev[prev.length - 1]?.message !== eventData.message
                ) {
                  return [...prev, { message: eventData.message }];
                }
                return prev;
              });

              setCurrentGenerationStatus(eventData.message); // Update the currently displayed status

              if (eventData.type === "complete") {
                setGithubResult(eventData); // Store the final result
                showSnackbar(
                  "Salesforce code generated and PR created successfully!",
                  "success"
                );
                refetchUserStories(); // Refresh stories to reflect any changes
              } else if (eventData.type === "error") {
                setGenerationError(eventData.message);
                setCurrentGenerationStatus("Process failed.");
                showSnackbar(eventData.message, "error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
              // Handle malformed JSON if necessary, but don't stop the stream
            }
          }
        }
        buffer = buffer.substring(lastIndex); // Keep any incomplete message in the buffer
      }
    } catch (err) {
      console.error("Fetch error during Salesforce code generation:", err);
      setGenerationError(
        err.message || "Network error during code generation."
      );
      setCurrentGenerationStatus("Failed to connect or stream.");
      showSnackbar(
        err.message || "Network error during code generation.",
        "error"
      );
    } finally {
      // Ensure the process is marked as complete or failed after stream ends or error
      // Give a small delay to ensure final status is displayed
      setTimeout(() => {
        // Only reset activeGenerationStoryId if the process truly finishes (success or error)
        // and is not just a temporary network hiccup that might restart.
        // For simplicity, we'll reset it here assuming process completion/failure.
        setIsGeneratingCodeProcess(false);
        setActiveGenerationStoryId(null); // Reset active generation story
      }, 1000); // Small delay to allow final status to render
    }
  };

  const handleSubmit = async () => {
    const storyData = {
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaboratorGithubIds: selectedCollaboratorGithubIds,
      aiEnhancedUserStory: generatedStoryContent,
    };

    try {
      if (editingStory) {
        await updateUserStory({
          userStoryId: editingStory._id,
          ...storyData,
        }).unwrap();
        showSnackbar("User story updated successfully!");
      } else {
        await createUserStory({ projectId, ...storyData }).unwrap();
        showSnackbar("User story created successfully!");
      }
      handleCloseDialogs();
      refetchUserStories();
    } catch (err) {
      showSnackbar(err.data?.message || "An error occurred.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserStory(storyToDelete._id).unwrap();
      showSnackbar("User story deleted successfully!");
      handleCloseDialogs();
      refetchUserStories();
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to delete user story.",
        "error"
      );
    }
  };

  const userStories =
    userRole === "developer"
      ? developerUserStories
      : userStoriesData?.userStories || [];

  return (
    <ThemeProvider theme={freshTheme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: "0 auto" }}>
        <HeaderCard>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                User Stories
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create, manage, and track user stories for your project.
              </Typography>
            </Box>
            {canManageStories && (
              <Button
                variant="contained"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                Create Story
              </Button>
            )}
          </Box>
        </HeaderCard>

        {storiesLoading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : userStories?.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography color="text.secondary">
              No user stories found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {userStories?.map((story) => (
              <Grid item xs={12} sm={6} md={4} key={story._id}>
                <StoryCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      // Flex container for title and generating button
                      sx={{ flexWrap: "wrap" }}
                    >
                      <Typography variant="h6" sx={{ pr: 1, flexGrow: 1 }}>
                        {story.userStoryTitle}
                      </Typography>
                      {activeGenerationStoryId === story._id &&
                        isGeneratingCodeProcess && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleOpenGenerationDialog(story._id)
                            }
                            startIcon={
                              <CircularProgress size={16} color="inherit" />
                            }
                            sx={{
                              ml: 1, // Margin-left
                              mt: 0.5, // Margin-top to align with text
                              color: freshTheme.palette.secondary.main,
                              borderColor: freshTheme.palette.secondary.main,
                              "&:hover": {
                                borderColor: freshTheme.palette.secondary.dark,
                                color: freshTheme.palette.secondary.dark,
                              },
                              textTransform: "none",
                              borderRadius: "8px",
                            }}
                          >
                            Generating...
                          </Button>
                        )}
                      {canManageStories && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, story._id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" my={1}>
                      <AccessTimeIcon
                        sx={{
                          color: "text.secondary",
                          mr: 1,
                          fontSize: "1.1rem",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Created:{" "}
                        {new Date(story.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {story.aiEnhancedUserStory ? (
                      <AIContentBox>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight={600}
                          gutterBottom
                        >
                          AI ENHANCED SUGGESTIONS
                        </Typography>
                        <TruncatedText
                          content={story.aiEnhancedUserStory}
                          maxLines={5}
                        />
                      </AIContentBox>
                    ) : (
                      <>
                        <TruncatedText
                          content={story.description}
                          maxLines={5}
                          title="Description"
                        />
                        <TruncatedText
                          content={story.acceptanceCriteria}
                          maxLines={3}
                          title="Acceptance Criteria"
                        />
                      </>
                    )}

                    {/* NEW: Display GitHub Branch and PR Link */}
                    {(story.githubBranch || story.prUrl) && (
                      <Box
                        mt={2}
                        sx={{
                          p: 1.5,
                          borderRadius: "8px",
                          border: `1px solid ${freshTheme.palette.secondary.light}`,
                          background: freshTheme.palette.background.default,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.primary"
                          fontWeight={600}
                          mb={1}
                        >
                          GitHub Details:
                        </Typography>
                        {story.githubBranch && (
                          <Typography variant="body2" color="text.secondary">
                            Branch:{" "}
                            <a
                              href={`https://github.com/your-org/your-repo-name/tree/${story.githubBranch}`} // Replace 'your-org/your-repo-name' with dynamic project repo base
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: freshTheme.palette.primary.main,
                                textDecoration: "underline",
                              }}
                            >
                              {story.githubBranch}
                            </a>
                          </Typography>
                        )}
                        {story.prUrl && (
                          <Typography variant="body2" color="text.secondary">
                            Pull Request:{" "}
                            <a
                              href={story.prUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: freshTheme.palette.primary.main,
                                textDecoration: "underline",
                              }}
                            >
                              View PR
                            </a>
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  {story.collaborators && story.collaborators.length > 0 && (
                    <CardContent sx={{ pt: 0 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {story.collaborators.map((c) => (
                          <Chip
                            key={c.githubId}
                            avatar={<Avatar src={c.avatarUrl} />}
                            label={c.username}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  )}
                </StoryCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleOpenEditDialog}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleGenerateSalesforceCode}
            disabled={isGeneratingCodeProcess || !projectGithubRepoUrl}
          >
            <ListItemIcon>
              {isGeneratingCodeProcess ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AutoFixHighIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {isGeneratingCodeProcess &&
              activeGenerationStoryId === currentStoryId
                ? "Generating Code..."
                : "Generate Salesforce Code"}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOpenDeleteDialog}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: "error" }}>
              Delete
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialogs}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {editingStory ? "Edit User Story" : "Create New User Story"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User Story Title"
                  value={userStoryTitle}
                  onChange={(e) => setUserStoryTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Acceptance Criteria"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Testing Scenarios"
                  value={testingScenarios}
                  onChange={(e) => setTestingScenarios(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" mt={2}>
                  Assign Collaborators
                </Typography>
                {collaboratorsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                    {collaboratorsData?.collaborators.map((c) => (
                      <FormControlLabel
                        key={c.githubId}
                        control={
                          <Checkbox
                            checked={selectedCollaboratorGithubIds.includes(
                              c.githubId
                            )}
                            onChange={handleCollaboratorChange}
                            value={c.githubId}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={c.avatarUrl}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            {c.username}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" my={1}>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    startIcon={<AutoFixHighIcon />}
                  >
                    {isGenerating
                      ? "Generating..."
                      : editingStory
                      ? "Regenerate with AI"
                      : "Enhance with AI"}
                  </Button>
                </Box>
                {generatedStoryContent && (
                  <AIContentBox>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {generatedStoryContent}
                    </Typography>
                  </AIContentBox>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingStory ? (
                "Save Changes"
              ) : (
                "Create Story"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDialogs}
          maxWidth="xs"
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the story "
              <strong>{storyToDelete?.userStoryTitle}</strong>"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NEW: Advanced Code Generation Loading Dialog */}
        <LoadingDialog
          open={
            isGeneratingCodeProcess &&
            activeGenerationStoryId === currentStoryId
          } // Only open if process is active for the current story
          onClose={(event, reason) => {
            // Allow closing only if the "Close" button is clicked.
            // Backdrop click or escape key will not close it if it's open due to generation.
            if (reason === "escapeKeyDown" || reason === "backdropClick") {
              // Optionally show a message that generation is still in progress
              showSnackbar(
                "Code generation is in progress. Please use the 'Close' button.",
                "info"
              );
              return; // Prevent closing
            }
            handleCloseDialogs(); // This will reset states and close the dialog
          }}
          aria-labelledby="loading-dialog-title"
        >
          <DialogTitle
            id="loading-dialog-title"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {generationError
              ? "Code Generation Failed"
              : "AI Code Generation Progress"}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {!generationError && !githubResult ? (
              <>
                <AnimatedIcon>
                  <AutoFixHighIcon sx={{ fontSize: "inherit" }} />
                </AnimatedIcon>
                <StatusMessage>{currentGenerationStatus}</StatusMessage>
                <LinearProgress
                  color="primary"
                  sx={{ my: 2, height: 8, borderRadius: 5 }}
                />
              </>
            ) : (
              <>
                {generationError ? (
                  <Box>
                    <Typography color="error" variant="h6" mb={2}>
                      Error: {generationError}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Please check the backend logs for more details or try
                      again.
                    </Typography>
                  </Box>
                ) : (
                  githubResult && (
                    <Box>
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: "4rem",
                          color: "success.main",
                          mb: 2,
                          animation: `${pulse} 1.5s infinite`,
                        }}
                      />
                      <Typography color="success.main" variant="h6" mb={1}>
                        Process Completed Successfully!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mb={2}>
                        Your Salesforce code has been generated and pushed to
                        GitHub.
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Branch:{" "}
                          <a
                            href={
                              githubResult.githubRepoUrl +
                              "/tree/" +
                              githubResult.githubBranch
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: freshTheme.palette.secondary.main,
                              textDecoration: "underline",
                            }}
                          >
                            {githubResult.githubBranch}
                          </a>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pull Request:{" "}
                          <a
                            href={githubResult.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: freshTheme.palette.secondary.main,
                              textDecoration: "underline",
                            }}
                          >
                            View PR
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}

            <CompletedStepsList>
              {completedGenerationSteps.map((step, index) => (
                <CompletedStepItem key={index}>
                  <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
                  {step.message}
                </CompletedStepItem>
              ))}
            </CompletedStepsList>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleCloseDialogs}
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </LoadingDialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default UserStoryPage;
