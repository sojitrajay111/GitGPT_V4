// page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Divider,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Switch, // Added for the back button in detail view
} from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  styled,
  keyframes,
  useTheme,
} from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"; // For back navigation

import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useGenerateAiStoryMutation,
  useGenerateSalesforceCodeMutation,
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice"; // Import new theme hook

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

// Theme definitions
const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode: mode,
      primary: { main: mode === "dark" ? "#90CAF9" : "#5e72e4" },
      secondary: { main: mode === "dark" ? "#F48FB1" : "#11cdef" },
      success: { main: "#2dce89" },
      error: { main: "#f5365c" },
      warning: { main: "#fb6340" }, // Added warning color for 'In Review'
      info: { main: "#11cdef" }, // Added info color for 'Planning'
      background: {
        default: mode === "dark" ? "#1a202c" : "#f8f9fe",
        paper: mode === "dark" ? "#2d3748" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#e0e0e0" : "#32325d",
        secondary: mode === "dark" ? "#b0b0b0" : "#525f7f",
      },
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
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.4)"
                : "0 4px 20px rgba(0, 0, 0, 0.03)",
            border: `1px solid ${mode === "dark" ? "#4a5568" : "#e9ecef"}`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow:
                mode === "dark"
                  ? "0 7px 14px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.3)"
                  : "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: "16px" } },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: mode === "dark" ? "#6b7280" : undefined,
              },
              "&:hover fieldset": {
                borderColor: mode === "dark" ? "#90CAF9" : undefined,
              },
              "&.Mui-focused fieldset": {
                borderColor: mode === "dark" ? "#90CAF9" : undefined,
              },
            },
            "& .MuiInputLabel-root": {
              color: mode === "dark" ? "#b0b0b0" : undefined,
            },
            "& .MuiInputBase-input": {
              color: mode === "dark" ? "#e0e0e0" : undefined,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "dark" ? "#6b7280" : undefined,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "dark" ? "#90CAF9" : undefined,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: mode === "dark" ? "#90CAF9" : undefined,
            },
            color: mode === "dark" ? "#e0e0e0" : undefined,
          },
          icon: {
            color: mode === "dark" ? "#e0e0e0" : undefined,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? "#b0b0b0" : undefined,
          },
        },
      },
    },
  });

// Styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(87deg, #3a506b 0, #1c2a3b 100%)"
      : "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
  color: "white",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4), // This might be overridden by the main layout, but good to keep
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

// Corrected StoryCard styled component for dynamic border and text color
const StoryCard = styled(Card)(({ theme, storyStatus }) => {
  let borderColor;
  let statusTextColor;

  switch (storyStatus) {
    case "AI DEVELOPED":
      borderColor = theme.palette.secondary.main;
      statusTextColor = theme.palette.secondary.main;
      break;
    case "COMPLETED":
      borderColor = theme.palette.success.main;
      statusTextColor = theme.palette.success.main;
      break;
    case "IN REVIEW":
      borderColor = theme.palette.warning.main;
      statusTextColor = theme.palette.warning.main;
      break;
    case "PLANNING":
      borderColor = theme.palette.info.main;
      statusTextColor = theme.palette.info.main;
      break;
    default:
      borderColor = theme.palette.primary.main;
      statusTextColor = theme.palette.text.secondary;
      break;
  }

  return {
    borderLeft: `5px solid ${borderColor}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "& .status-chip": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.action.selected
          : theme.palette.grey[100],
      color: statusTextColor,
      fontWeight: 600,
    },
    // Ensure text color is appropriate for the theme
    "& .MuiTypography-root": {
      color: theme.palette.text.primary,
    },
    "& .MuiTypography-caption, & .MuiTypography-body2": {
      color: theme.palette.text.secondary,
    },
  };
});

const AIContentBox = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(120deg, #2a3447 0%, #1c2a3b 100%)"
      : "linear-gradient(120deg, #f8f9fe 0%, #f0f5ff 100%)",
  border: `1px solid ${theme.palette.mode === "dark" ? "#4a5568" : "#dee2e6"}`,
  borderRadius: "12px",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  color: theme.palette.text.primary,
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

  // State for forms and views
  // 'list': shows the list of stories (default when no story is selected)
  // 'create': shows the form for creating a new story
  // 'view': shows the details of a selected story
  // 'edit': shows the form for editing a selected story
  const [activePanel, setActivePanel] = useState("create"); // Set to 'create' by default as per request
  const [selectedStory, setSelectedStory] = useState(null); // The story currently being viewed/edited

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // NEW: State for code generation loading and status
  const [isGeneratingCodeProcess, setIsGeneratingCodeProcess] = useState(false);
  const [currentGenerationStatus, setCurrentGenerationStatus] = useState("");
  const [completedGenerationSteps, setCompletedGenerationSteps] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [activeGenerationStoryId, setActiveGenerationStoryId] = useState(null);

  // Form fields state
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");
  const [storyStatus, setStoryStatus] = useState("PLANNING"); // NEW: Status
  const [storyPriority, setStoryPriority] = useState("Medium"); // NEW: Priority
  const [estimatedTime, setEstimatedTime] = useState(""); // NEW: Estimated Time

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for theme mode, initialized from RTK Query
  const {
    data: themeData,
    isLoading: isThemeLoading,
    isError: isThemeError,
  } = useGetThemeQuery(userId, {
    skip: !userId, // Skip query if userId is not available
  });

  const themeMode = themeData?.theme || "light"; // Default to 'light' if data is not yet loaded or error

  // Remove useEffect for initial theme from localStorage
  // useEffect(() => {
  //   const storedTheme = localStorage.getItem("theme") || "light";
  //   setThemeMode(storedTheme);

  //   const handleStorageChange = () => {
  //     setThemeMode(localStorage.getItem("theme") || "light");
  //   };
  //   window.addEventListener("storage", handleStorageChange);
  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  // NEW ADDITION: Effect to apply the theme class to the document element (html tag)
  // This ensures the global 'dark' class is always in sync with page.js's themeMode state,
  // especially important for initial load and consistency across components.
  useEffect(() => {
    if (!isThemeLoading && !isThemeError && themeMode) {
      // Only apply once theme data is fetched
      document.documentElement.classList.toggle("dark", themeMode === "dark");
    }
  }, [themeMode, isThemeLoading, isThemeError]);

  // Memoize the theme creation to prevent unnecessary re-renders
  const currentTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  // RTK Query Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const userRole = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  // Placeholder for project's GitHub Repo URL.
  // IMPORTANT: REPLACE WITH ACTUAL PROJECT REPO URL LOGIC
  // This should ideally come from a project-specific API call
  const projectGithubRepoUrl = "https://github.com/your-org/your-repo-name";

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
  const [triggerSalesforceCodeGeneration] = useGenerateSalesforceCodeMutation();

  const canManageStories =
    userRole === "manager" ||
    developerPermissions?.includes("User story creation");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => {
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
    setStoryStatus("PLANNING");
    setStoryPriority("Medium");
    setEstimatedTime("");
    setSelectedStory(null); // Clear selected story
  };

  // Open form for creating new story
  const handleOpenCreateForm = () => {
    resetForm();
    setActivePanel("create");
  };

  // Open form for editing existing story
  const handleOpenEditForm = (story) => {
    setSelectedStory(story);
    setUserStoryTitle(story.userStoryTitle);
    setDescription(story.description);
    setAcceptanceCriteria(story.acceptanceCriteria);
    setTestingScenarios(story.testingScenarios);
    setSelectedCollaboratorGithubIds(
      story.collaborators?.map((c) => c.githubId) || []
    );
    setGeneratedStoryContent(story.aiEnhancedUserStory || "");
    setStoryStatus(story.status || "PLANNING");
    setStoryPriority(story.priority || "Medium");
    setEstimatedTime(story.estimatedTime || "");
    setActivePanel("edit");
  };

  // View a specific story
  const handleViewStory = (story) => {
    setSelectedStory(story);
    setActivePanel("view");
  };

  // Open dialog for deleting
  const handleOpenDeleteDialog = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setDeleteDialogOpen(false);
    // When closing the main dialog, also ensure the generation dialog is closed if it's open,
    // but only if the generation process is truly done or user explicitly closes it after error/completion.
    if (!isGeneratingCodeProcess) {
      setIsGeneratingCodeProcess(false);
      setCompletedGenerationSteps([]); // Clear steps on close
      setCurrentGenerationStatus(""); // Clear current status
      setGenerationError(null); // Clear any errors
      setGithubResult(null); // Clear result
      setActiveGenerationStoryId(null); // Reset active generation story
    }
  };

  // Handler for opening the generation dialog manually (from "Generating..." button)
  const handleOpenGenerationDialog = (storyId) => {
    // Only open if this story is the one actively generating
    if (activeGenerationStoryId === storyId && isGeneratingCodeProcess) {
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

  const handleGenerateSalesforceCode = async () => {
    const storyToGenerate = selectedStory; // Use the currently selected story
    if (!storyToGenerate?._id) {
      showSnackbar("Please select a user story first.", "warning");
      return;
    }
    if (!projectGithubRepoUrl) {
      showSnackbar(
        "Project GitHub repository URL is not configured. Please update project settings.",
        "error"
      );
      return;
    }

    setIsGeneratingCodeProcess(true);
    setActiveGenerationStoryId(storyToGenerate._id);
    setCompletedGenerationSteps([]);
    setCurrentGenerationStatus("AI code generation initiated...");
    setGenerationError(null);
    setGithubResult(null);

    setCompletedGenerationSteps([
      { message: "AI code generation initiated..." },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-stories/${storyToGenerate._id}/generate-salesforce-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            projectId,
            githubRepoUrl: projectGithubRepoUrl,
          }),
        }
      );

      if (!response.ok) {
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lastIndex = 0;
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n\n", lastIndex)) !== -1) {
          const eventString = buffer.substring(lastIndex, newlineIndex);
          lastIndex = newlineIndex + 2;

          if (eventString.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(eventString.substring(6));

              setCompletedGenerationSteps((prev) => {
                if (
                  prev.length === 0 ||
                  prev[prev.length - 1]?.message !== eventData.message
                ) {
                  return [...prev, { message: eventData.message }];
                }
                return prev;
              });

              setCurrentGenerationStatus(eventData.message);

              if (eventData.type === "complete") {
                setGithubResult(eventData);
                showSnackbar(
                  "Salesforce code generated and PR created successfully!",
                  "success"
                );
                refetchUserStories();
                // Update the selected story with new github details
                setSelectedStory((prev) => ({
                  ...prev,
                  githubBranch: eventData.githubBranch,
                  prUrl: eventData.prUrl,
                  status: "AI DEVELOPED", // Set status to AI Developed
                }));
              } else if (eventData.type === "error") {
                setGenerationError(eventData.message);
                setCurrentGenerationStatus("Process failed.");
                showSnackbar(eventData.message, "error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
        buffer = buffer.substring(lastIndex);
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
      setTimeout(() => {
        setIsGeneratingCodeProcess(false);
        setActiveGenerationStoryId(null);
      }, 1000);
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
      status: storyStatus,
      priority: storyPriority,
      estimatedTime: estimatedTime,
    };

    try {
      if (selectedStory && activePanel === "edit") {
        await updateUserStory({
          userStoryId: selectedStory._id,
          ...storyData,
        }).unwrap();
        showSnackbar("User story updated successfully!");
      } else {
        await createUserStory({ projectId, ...storyData }).unwrap();
        showSnackbar("User story created successfully!");
      }
      resetForm();
      refetchUserStories();
      setActivePanel("list"); // Go back to list after submit
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
      setActivePanel("list"); // Go back to list after delete
      setSelectedStory(null); // Clear selected story
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to delete user story.",
        "error"
      );
    }
  };

  const allUserStories =
    userRole === "developer"
      ? developerUserStories
      : userStoriesData?.userStories || [];

  const filteredUserStories = useMemo(() => {
    return allUserStories.filter((story) => {
      const matchesSearch = story.userStoryTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCompletedStatus = showCompleted
        ? story.status === "COMPLETED"
        : story.status !== "COMPLETED";
      return matchesSearch && matchesCompletedStatus;
    });
  }, [allUserStories, searchTerm, showCompleted]);

  // Sort stories by creation date, most recent first
  filteredUserStories.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const theme = useTheme();

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 4px 8px rgba(255,255,255,0.05)"
          : "0 4px 8px rgba(0,0,0,0.1)",
      backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#fff",
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
    "& .MuiInputBase-input": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
  };

  // Render function for the story creation/edit form
  const renderStoryForm = () => (
    <Card
      sx={{
        p: 4,
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        borderRadius: 4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {activePanel === "edit" ? "Edit User Story" : "Create New User Story"}
      </Typography>

      {/* FIELD STYLING APPLIES TO ALL TEXTFIELDS */}
      <TextField
        fullWidth
        label="User Story Title"
        value={userStoryTitle}
        onChange={(e) => setUserStoryTitle(e.target.value)}
        InputLabelProps={{
          sx: {
            color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
          },
        }}
        InputProps={{
          sx: {
            backgroundColor:
              theme.palette.mode === "dark" ? "#2e2e2e" : "#ffffff",
            color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
            borderRadius: 3,
            paddingX: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "inset 4px 4px 10px #1c1c1c, inset -4px -4px 10px #3d3d3d"
                : "0 1px 4px rgba(0,0,0,0.1)",
            border: "none",
          },
        }}
        sx={{
          mt: 2,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />

      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={inputStyle}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Acceptance Criteria"
        value={acceptanceCriteria}
        onChange={(e) => setAcceptanceCriteria(e.target.value)}
        sx={inputStyle}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Testing Scenarios"
        value={testingScenarios}
        onChange={(e) => setTestingScenarios(e.target.value)}
        sx={inputStyle}
      />

      <FormControl fullWidth sx={inputStyle}>
        <InputLabel>Status</InputLabel>
        <Select
          value={storyStatus}
          label="Status"
          onChange={(e) => setStoryStatus(e.target.value)}
        >
          <MenuItem value="PLANNING">Planning</MenuItem>
          <MenuItem value="IN REVIEW">In Review</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="AI DEVELOPED">AI Developed</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={inputStyle}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={storyPriority}
          label="Priority"
          onChange={(e) => setStoryPriority(e.target.value)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Estimated Time (e.g., 8h, 2d)"
        value={estimatedTime}
        onChange={(e) => setEstimatedTime(e.target.value)}
        sx={inputStyle}
      />

      {/* COLLABORATORS */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Assign Collaborators
        </Typography>
        {collaboratorsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            {collaboratorsData?.collaborators.map((c) => (
              <FormControlLabel
                key={c.githubId}
                control={
                  <Checkbox
                    checked={selectedCollaboratorGithubIds.includes(c.githubId)}
                    onChange={handleCollaboratorChange}
                    value={c.githubId}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={c.avatarUrl} sx={{ width: 24, height: 24 }} />
                    {c.username}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        )}
      </Box>

      {/* GENERATE AI STORY */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleGenerateStory}
          disabled={isGenerating}
          startIcon={<AutoFixHighIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {isGenerating
            ? "Generating..."
            : selectedStory
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

      {/* FINAL ACTION BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        <Button onClick={() => setActivePanel("list")}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCreating || isUpdating}
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            textTransform: "none",
          }}
        >
          {isCreating || isUpdating ? (
            <CircularProgress size={24} color="inherit" />
          ) : activePanel === "edit" ? (
            "Save Changes"
          ) : (
            "Create Story"
          )}
        </Button>
      </Box>
    </Card>
  );

  // Render function for the story detail view
  const renderStoryDetail = () => (
    <Card
      sx={{
        p: 3,
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton onClick={() => setActivePanel("list")}>
          <ChevronLeftIcon />
        </IconButton>
        {canManageStories && selectedStory && (
          <Box>
            <IconButton onClick={() => handleOpenEditForm(selectedStory)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleOpenDeleteDialog(selectedStory)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        )}
      </Box>

      {selectedStory ? (
        <>
          <Typography variant="h4" gutterBottom mt={2}>
            {selectedStory.userStoryTitle}
          </Typography>

          <Grid container spacing={2} mb={2}>
            <Grid item>
              <Chip
                label={`Priority: ${selectedStory.priority}`}
                color={
                  selectedStory.priority === "High"
                    ? "error"
                    : selectedStory.priority === "Medium"
                    ? "warning"
                    : "success"
                }
                variant="outlined"
                sx={{
                  backgroundColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[700]
                      : undefined,
                  color: currentTheme.palette.text.primary,
                  borderColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[600]
                      : undefined,
                }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Status: ${selectedStory.status}`}
                color={
                  selectedStory.status === "COMPLETED"
                    ? "success"
                    : selectedStory.status === "AI DEVELOPED"
                    ? "secondary"
                    : selectedStory.status === "IN REVIEW"
                    ? "warning"
                    : "info"
                }
                variant="outlined"
                sx={{
                  backgroundColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[700]
                      : undefined,
                  color: currentTheme.palette.text.primary,
                  borderColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[600]
                      : undefined,
                }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Estimated: ${selectedStory.estimatedTime}`}
                variant="outlined"
                sx={{
                  backgroundColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[700]
                      : undefined,
                  color: currentTheme.palette.text.primary,
                  borderColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[600]
                      : undefined,
                }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Created: ${new Date(
                  selectedStory.createdAt
                ).toLocaleDateString()}`}
                variant="outlined"
                sx={{
                  backgroundColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[700]
                      : undefined,
                  color: currentTheme.palette.text.primary,
                  borderColor:
                    currentTheme.palette.mode === "dark"
                      ? currentTheme.palette.grey[600]
                      : undefined,
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <TruncatedText
            content={selectedStory.description}
            title="Description"
          />
          <TruncatedText
            content={selectedStory.acceptanceCriteria}
            title="Acceptance Criteria"
          />
          <TruncatedText
            content={selectedStory.testingScenarios}
            title="Testing Scenarios"
          />

          {selectedStory.aiEnhancedUserStory && (
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
                content={selectedStory.aiEnhancedUserStory}
                maxLines={5}
              />
            </AIContentBox>
          )}

          {/* Display GitHub Branch and PR Link */}
          {(selectedStory.githubBranch || selectedStory.prUrl) && (
            <Box
              mt={2}
              sx={{
                p: 1.5,
                borderRadius: "8px",
                border: `1px solid ${
                  currentTheme.palette.mode === "dark"
                    ? currentTheme.palette.grey[600]
                    : currentTheme.palette.secondary.light
                }`,
                background: currentTheme.palette.background.paper, // Use paper for this box's background
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
              {selectedStory.githubBranch && (
                <Typography variant="body2" color="text.secondary">
                  Branch:{" "}
                  <a
                    href={`${projectGithubRepoUrl}/tree/${selectedStory.githubBranch}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: currentTheme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    {selectedStory.githubBranch}
                  </a>
                </Typography>
              )}
              {selectedStory.prUrl && (
                <Typography variant="body2" color="text.secondary">
                  Pull Request:{" "}
                  <a
                    href={selectedStory.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: currentTheme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    View PR
                  </a>
                </Typography>
              )}
            </Box>
          )}

          {selectedStory.collaborators &&
            selectedStory.collaborators.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned Collaborators:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedStory.collaborators.map((c) => (
                    <Chip
                      key={c.githubId}
                      avatar={<Avatar src={c.avatarUrl} />}
                      label={c.username}
                      size="small"
                      sx={{
                        backgroundColor:
                          currentTheme.palette.mode === "dark"
                            ? currentTheme.palette.grey[700]
                            : undefined,
                        color: currentTheme.palette.text.primary,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

          <Box sx={{ mt: "auto", pt: 3 }}>
            {" "}
            {/* mt: 'auto' pushes button to bottom */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateSalesforceCode}
              disabled={isGeneratingCodeProcess || !projectGithubRepoUrl}
              startIcon={
                isGeneratingCodeProcess &&
                activeGenerationStoryId === selectedStory._id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutoFixHighIcon />
                )
              }
              sx={{ py: 1.5 }}
            >
              {isGeneratingCodeProcess &&
              activeGenerationStoryId === selectedStory._id
                ? "Generating Code..."
                : "Generate Salesforce Code"}
            </Button>
          </Box>
        </>
      ) : (
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          mt={5}
        >
          Select a story from the left sidebar or create a new one.
        </Typography>
      )}
    </Card>
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          backgroundColor: currentTheme.palette.background.default,
          color: currentTheme.palette.text.primary,
          // Hide overflow-x to prevent horizontal scrolling due to layout
          overflowX: "hidden",
        }}
      >
        {/* Left Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", sm: 350 }, // Full width on small screens, fixed on larger
            flexShrink: 0,
            borderRight: `1px solid ${
              currentTheme.palette.mode === "dark" ? "#4a5568" : "#e0e0e0"
            }`,
            backgroundColor: currentTheme.palette.background.paper,
            p: 2,
            display:
              activePanel === "list" ? "flex" : { xs: "none", sm: "flex" }, // Show only on list view for small screens
            flexDirection: "column",
            overflowY: "auto", // Enable scrolling for sidebar content
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2" fontWeight={700}>
              User Stories
            </Typography>
            {canManageStories && (
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenCreateForm}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: currentTheme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: currentTheme.palette.primary.dark,
                  },
                }}
              >
                New
              </Button>
            )}
          </Box>

          {/* Theme Toggle is now assumed to be in Sidebar.js, removed from here */}

          <TextField
            fullWidth
            label="Search stories..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                color="primary"
              />
            }
            label="Show Completed"
            sx={{ mb: 2 }}
          />

          <Divider sx={{ mb: 2 }} />

          {storiesLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : filteredUserStories.length === 0 ? (
            <Box textAlign="center" py={2}>
              <Typography color="text.secondary" variant="body2">
                No user stories found.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: "auto" }}>
              {filteredUserStories.map((story) => (
                <StoryCard
                  key={story._id}
                  storyStatus={story.status} // Pass status for dynamic styling
                  onClick={() => handleViewStory(story)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedStory?._id === story._id
                        ? currentTheme.palette.action.selected
                        : currentTheme.palette.background.paper,
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={0.5}
                    >
                      <Typography variant="body1" fontWeight={600} flexGrow={1}>
                        {story.userStoryTitle}
                      </Typography>
                      {story.status === "AI DEVELOPED" && (
                        <Chip
                          label="AI DEVELOPED"
                          color="secondary"
                          size="small"
                          sx={{
                            ml: 1,
                            fontWeight: 600,
                            backgroundColor:
                              currentTheme.palette.mode === "dark"
                                ? currentTheme.palette.grey[700]
                                : undefined,
                            color: currentTheme.palette.secondary.main,
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      variant="caption"
                      color="text.secondary"
                    >
                      <Typography variant="caption">
                        {story.collaborators?.[0]?.username || "Unassigned"}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                        <Typography variant="caption">
                          {story.estimatedTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Box mt={1}>
                      <Chip
                        label={story.status}
                        size="small"
                        className="status-chip" // Use className for styled component target
                      />
                      <Chip
                        label={`Priority: ${story.priority}`}
                        size="small"
                        sx={{
                          ml: 1,
                          fontWeight: 600,
                          backgroundColor:
                            currentTheme.palette.mode === "dark"
                              ? currentTheme.palette.grey[700]
                              : undefined,
                          color: currentTheme.palette.text.primary,
                          borderColor:
                            currentTheme.palette.mode === "dark"
                              ? currentTheme.palette.grey[600]
                              : undefined,
                        }}
                        color={
                          story.priority === "High"
                            ? "error"
                            : story.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                      />
                    </Box>
                  </CardContent>
                </StoryCard>
              ))}
            </Stack>
          )}
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: currentTheme.palette.background.default,
            overflowY: "auto",
            display:
              activePanel !== "list" ? "flex" : { xs: "none", sm: "flex" }, // Hide on small screens when list is active
            flexDirection: "column", // Ensures content fills height
          }}
        >
          {activePanel === "create" || activePanel === "edit"
            ? renderStoryForm()
            : renderStoryDetail()}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDialogs}
          maxWidth="xs"
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: currentTheme.palette.background.paper,
              color: currentTheme.palette.text.primary,
            },
          }}
        >
          <DialogTitle sx={{ color: currentTheme.palette.text.primary }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: currentTheme.palette.text.secondary }}>
              Are you sure you want to delete the story "
              <strong>{storyToDelete?.userStoryTitle}</strong>"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleCloseDialogs}
              sx={{ color: currentTheme.palette.text.primary }}
            >
              Cancel
            </Button>
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
            activeGenerationStoryId === selectedStory?._id
          }
          onClose={(event, reason) => {
            if (reason === "escapeKeyDown" || reason === "backdropClick") {
              showSnackbar(
                "Code generation is in progress. Please use the 'Close' button.",
                "info"
              );
              return;
            }
            handleCloseDialogs();
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
                              color: currentTheme.palette.secondary.main,
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
                              color: currentTheme.palette.secondary.main,
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
