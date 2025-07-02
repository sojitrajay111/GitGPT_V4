// pages/ProjectDetailPage.js (Main Page)
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Switch,
  IconButton,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import { alpha } from "@mui/system";
import { useSelector } from 'react-redux';

// Import API Hooks
import {
  useGetCollaboratorsQuery,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/features/projectApiSlice";
import {
  useSearchGithubUsersQuery,
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useGetUserAndGithubDataQuery,
  useDeleteGithubRepoMutation,
} from "@/features/githubApiSlice";
import { useGetCollaboratorPermissionsQuery } from "@/features/developerApiSlice";
import { useGetProjectMetricsQuery } from "@/features/projectMetricsApiSlice";
import {
  useGetThemeQuery,
  useUpdateThemeMutation,
} from "@/features/themeApiSlice";
import { useGetNotificationsQuery } from "@/features/notificationApiSlice";
import { useAddCollaboratorMutation as useAddCollaboratorMutationCollab } from "@/features/collaboratorApiSlice";

import { skipToken } from "@reduxjs/toolkit/query";

// Import the new components
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectModules from "@/components/project-details/ProjectModules";
import ProjectMetrics from "@/components/project-details/ProjectMetrics";
import CollaboratorsTable from "@/components/project-details/CollaboratorsTable";
import AddCollaboratorDialog from "@/components/project-details/AddCollaboratorDialog";
import DeleteCollaboratorDialog from "@/components/project-details/DeleteCollaboratorDialog";
import EditCollaboratorPermissionsDialog from "@/components/project-details/EditCollaboratorPermissionsDialog";
import EditProjectDialog from "@/components/project-details/EditProjectDialog";
import DeleteProjectConfirmationDialog from "@/components/project-details/DeleteProjectConfirmationDialog";
import DeleteRepoConfirmationDialog from "@/components/project-details/DeleteRepoConfirmationDialog";
import ProjectFlowTree from '@/components/project-details/ProjectFlowTree';

// Define both Light and Dark themes (kept here for full context, could be external)
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5",
      light: "#818cf8",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
    },
    warning: {
      main: "#fbbf24",
      light: "#fcd34d",
    },
    info: {
      main: "#8b5cf6",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
    divider: "#e5e7eb",
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.8rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.3rem",
    },
    subtitle1: {
      fontSize: "1.1rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.9rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transform: "translateY(-2px)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)",
          },
        },
        outlined: {
          borderColor: "#d1d5db",
          color: "#4b5563",
          "&:hover": {
            borderColor: "#9ca3af",
            backgroundColor: "#f3f4f6",
          },
        },
        text: {
          color: "#0ea5e9",
          "&:hover": {
            backgroundColor: alpha("#0ea5e9", 0.1),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            borderColor: "#cbd5e1",
            transform: "scale(1.01)",
            boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.8rem",
          padding: "2px 8px",
          height: "unset",
          "&.MuiChip-colorSuccess": {
            backgroundColor: alpha("#22c55e", 0.1),
            color: "#166534",
          },
          "&.MuiChip-colorWarning": {
            backgroundColor: alpha("#fbbf24", 0.1),
            color: "#854d0e",
          },
          "&.MuiChip-colorError": {
            backgroundColor: alpha("#ef4444", 0.1),
            color: "#b91c1c",
          },
          "&.MuiChip-colorPrimary": {
            backgroundColor: alpha("#4f46e5", 0.1),
            color: "#4f46e5",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#d1d5db",
              borderRadius: "10px",
            },
            "&:hover fieldset": {
              borderColor: "#4f46e5",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0ea5e9",
            },
            "& input, & textarea": {
              color: "#1f2937",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#6b7280",
            "&.Mui-focused": {
              color: "#0ea5e9",
            },
          },
          "& .MuiFormHelperText-root": {
            color: "#6b7280",
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: alpha("#4f46e5", 0.1),
            "&:hover": {
              backgroundColor: alpha("#4f46e5", 0.15),
            },
          },
          "&:hover": {
            backgroundColor: alpha("#0ea5e9", 0.05),
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#e5e7eb",
          margin: "24px 0",
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
      light: "#a78bfa",
      dark: "#6b4db7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
    },
    warning: {
      main: "#fbbf24",
      light: "#fcd34d",
    },
    info: {
      main: "#a3e635",
    },
    background: {
      default: "black",
      paper: "#161717",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#a0a0a0",
    },
    divider: alpha("#a0a0a0", 0.2),
  },
  typography: {
    fontFamily: "'Inter', 'Roboto Mono', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      color: "#e0e0e0",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.8rem",
      color: "#e0e0e0",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.3rem",
      color: "#e0e0e0",
    },
    subtitle1: {
      fontSize: "1.1rem",
      fontWeight: 500,
      color: "#e0e0e0",
    },
    body1: {
      fontSize: "1rem",
      color: "#a0a0a0",
    },
    body2: {
      fontSize: "0.9rem",
      color: "#a0a0a0",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #8c60f7 30%, #a78bfa 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #a78bfa 30%, #8c60f7 90%)",
          },
        },
        outlined: {
          borderColor: alpha("#a0a0a0", 0.5),
          color: "#e0e0e0",
          "&:hover": {
            borderColor: "#8c60f7",
            backgroundColor: alpha("#8c60f7", 0.1),
          },
        },
        text: {
          color: "#0ea5e9",
          "&:hover": {
            backgroundColor: alpha("#0ea5e9", 0.1),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          background: "#161717",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(140, 96, 247, 0.3)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            borderColor: "#8c60f7",
            transform: "scale(1.01)",
            boxShadow: "0 12px 35px rgba(0,0,0,0.5), 0 0 15px #8c60f7",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          background: "#161717",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          border: "1px solid rgba(140, 96, 247, 0.5)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.8rem",
          padding: "2px 8px",
          height: "unset",
          "&.MuiChip-colorSuccess": {
            backgroundColor: alpha("#22c55e", 0.2),
            color: "#22c55e",
          },
          "&.MuiChip-colorWarning": {
            backgroundColor: alpha("#fbbf24", 0.2),
            color: "#fbbf24",
          },
          "&.MuiChip-colorError": {
            backgroundColor: alpha("#ef4444", 0.2),
            color: "#ef4444",
          },
          "&.MuiChip-colorPrimary": {
            backgroundColor: alpha("#8c60f7", 0.2),
            color: "#8c60f7",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: alpha("#a0a0a0", 0.3),
              borderRadius: "10px",
            },
            "&:hover fieldset": {
              borderColor: "#8c60f7",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0ea5e9",
            },
            "& input, & textarea": {
              color: "#e0e0e0",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#a0a0a0",
            "&.Mui-focused": {
              color: "#0ea5e9",
            },
          },
          "& .MuiFormHelperText-root": {
            color: "#a0a0a0",
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a47",
          borderRadius: "14px",
          border: "1px solid rgba(140, 96, 247, 0.2)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: alpha("#8c60f7", 0.2),
            "&:hover": {
              backgroundColor: alpha("#8c60f7", 0.3),
            },
          },
          "&:hover": {
            backgroundColor: alpha("#0ea5e9", 0.1),
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha("#8c60f7", 0.3),
          margin: "24px 0",
        },
      },
    },
  },
});

const ProjectDetailPage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const router = useRouter();

  // Theme state
  const { data: themePreferenceData, refetch: refetchThemePreference } =
    useGetThemeQuery(userId, { skip: !userId });
  const [currentThemeMode, setCurrentThemeMode] = useState("light"); // Default to light

  // Update theme mode when preference data changes
  useEffect(() => {
    if (themePreferenceData?.theme) {
      setCurrentThemeMode(themePreferenceData.theme);
    }
  }, [themePreferenceData]);

  const [updateTheme, { isLoading: updateThemeLoading }] =
    useUpdateThemeMutation();

  const toggleTheme = async () => {
    const newThemeMode = currentThemeMode === "light" ? "dark" : "light";
    await updateTheme({ userId, theme: newThemeMode });
    setCurrentThemeMode(newThemeMode);
  };

  const activeTheme = currentThemeMode === "dark" ? darkTheme : lightTheme;

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteCollaboratorDialog, setOpenDeleteCollaboratorDialog] =
    useState(false);
  const [openEditCollaboratorDialog, setOpenEditCollaboratorDialog] =
    useState(false);
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);
  const [openConfirmDeleteRepoDialog, setOpenConfirmDeleteRepoDialog] =
    useState(false);

  // Form states
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editGithubRepoLink, setEditGithubRepoLink] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [permissionsToEdit, setPermissionsToEdit] = useState([]);
  const [collaboratorSearchFilter, setCollaboratorSearchFilter] = useState("");

  // API Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const user_role = userData?.user?.role; // 'manager' or 'developer'
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
    "Manage Collaborators",
    "View Metrics",
  ];

  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError,
    refetch: refetchProjectDetails,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  const {
    data: projectMetricsData,
    isLoading: metricsLoading,
    isError: metricsIsError,
    error: metricsError,
    refetch: refetchProjectMetrics,
  } = useGetProjectMetricsQuery(projectId, { skip: !projectId });

  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchIsError,
    error: searchError,
  } = useSearchGithubUsersQuery(searchTerm, { skip: searchTerm.length < 3 });

  const [
    addCollaborator,
    {
      isLoading: addCollaboratorLoading,
      isSuccess: addCollaboratorSuccess,
      isError: addCollaboratorIsError,
      error: addCollaboratorError,
      reset: resetAddCollaboratorMutation,
    },
  ] = useAddCollaboratorMutationCollab();
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
  const [
    updateProject,
    {
      isLoading: updateProjectLoading,
      isSuccess: updateProjectSuccess,
      isError: updateProjectIsError,
      error: updateProjectError,
      reset: resetUpdateProjectMutation,
    },
  ] = useUpdateProjectMutation();
  const [
    deleteProject,
    {
      isLoading: deleteProjectLoading,
      isSuccess: deleteProjectSuccess,
      isError: deleteProjectIsError,
      error: deleteProjectError,
      reset: resetDeleteProjectMutation,
    },
  ] = useDeleteProjectMutation();
  const [
    deleteGithubRepo,
    {
      isLoading: deleteGithubRepoLoading,
      isSuccess: deleteGithubRepoSuccess,
      isError: deleteGithubRepoIsError,
      error: deleteGithubRepoError,
      reset: resetDeleteGithubRepoMutation,
    },
  ] = useDeleteGithubRepoMutation();

  // Get logged-in userId from Redux (authSlice)
  const userInfo = useSelector(state => state.auth.userInfo);
  let loggedInUserId = userInfo?._id || userInfo?.id;
  // Fallback: try to get userId from localStorage if Redux is empty (optional, for robustness)
  if (!loggedInUserId && typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        loggedInUserId = parsed._id || parsed.id;
      }
    } catch (e) {}
  }
  // Notification API call for debugging
  const {
    data: notifications,
    error: notificationsError,
    isLoading: notificationsLoading,
  } = useGetNotificationsQuery(loggedInUserId, { skip: !loggedInUserId });

  if (!loggedInUserId) {
    return (
      <Box p={4} className="min-h-screen" sx={{ bgcolor: activeTheme.palette.background.default }}>
        <Alert severity="warning" className="rounded-xl">
          Unable to determine logged-in user. Please log in again.
        </Alert>
      </Box>
    );
  }

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
      setOpenDeleteCollaboratorDialog(false);
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
      setOpenEditCollaboratorDialog(false);
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

  useEffect(() => {
    if (updateProjectSuccess) {
      setOpenEditProjectDialog(false);
      refetchProjectDetails();
      resetUpdateProjectMutation();
    }
  }, [updateProjectSuccess, refetchProjectDetails, resetUpdateProjectMutation]);

  useEffect(() => {
    if (deleteProjectSuccess) {
      setOpenDeleteProjectDialog(false);
      setOpenConfirmDeleteRepoDialog(true); // Proceed to GitHub repo deletion confirmation
      resetDeleteProjectMutation();
    }
  }, [deleteProjectSuccess, resetDeleteProjectMutation]);

  useEffect(() => {
    if (deleteGithubRepoSuccess) {
      console.log("GitHub repo deleted successfully.");
      resetDeleteGithubRepoMutation();
      router.push(`/${userId}/dashboard`); // Redirect after both deletions are confirmed/attempted
    }
  }, [deleteGithubRepoSuccess, resetDeleteGithubRepoMutation, router, userId]);

  // Dialog handlers for Collaborators
  const handleOpenAddDialog = useCallback(() => {
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedPermissions([]);
    resetAddCollaboratorMutation();
    setOpenAddDialog(true);
  }, [resetAddCollaboratorMutation]);

  const handleCloseAddDialog = useCallback(() => {
    setOpenAddDialog(false);
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedPermissions([]);
  }, []);

  const handleButtonClick = useCallback(
    (button) => {
      // Check permissions before navigating if the user is a developer
      const isManager = user_role === "manager";
      let canProceed = false;

      switch (button) {
        case "userStory":
          canProceed =
            isManager || developerPermissions?.includes("User story creation");
          break;
        case "codeAnalysis":
          canProceed =
            isManager || developerPermissions?.includes("Code analysis");
          break;
        case "documentation":
          canProceed =
            isManager || developerPermissions?.includes("Documentation upload");
          break;
        case "managePrBranches":
          canProceed =
            isManager ||
            developerPermissions?.includes("Create PR") ||
            developerPermissions?.includes("Assign PR") ||
            developerPermissions?.includes("Review PR"); // Simplified for demo
          break;
        default:
          console.error("Unknown button clicked:", button);
          return;
      }

      if (canProceed) {
        const path = {
          userStory: `/${userId}/create-project/${projectId}/user-story`,
          codeAnalysis: `/${userId}/create-project/${projectId}/code-analysis`,
          documentation: `/${userId}/create-project/${projectId}/documentation`,
          managePrBranches: `/${userId}/create-project/${projectId}/manager-pr-branches`,
        }[button];
        router.push(path);
      } else {
        // Here you could show a message box indicating insufficient permissions
        console.warn("Insufficient permissions to access this feature.");
      }
    },
    [developerPermissions, projectId, router, userId, user_role]
  );

  const handleAddCollaborator = async () => {
    if (selectedUser && projectId && userData?.user?._id) {
      try {
        console.log("Sending to addCollaborator:", {
          created_user_id: userData.user._id,
          project_id: projectId,
          collaborator: {
            username: selectedUser.login,
            githubId: selectedUser.id,
            avatarUrl: selectedUser.avatar_url,
            permissions: selectedPermissions,
          },
        });
        await addCollaborator({
          created_user_id: userData.user._id,
          project_id: projectId,
          collaborator: {
            username: selectedUser.login,
            githubId: selectedUser.id,
            avatarUrl: selectedUser.avatar_url,
            permissions: selectedPermissions,
          },
        }).unwrap();
        // Debug: Log notifications after adding collaborator
        console.log("Notifications after adding collaborator:", notifications);
        if (notificationsError) {
          console.error("Notification fetch error:", notificationsError);
        }
      } catch (err) {
        console.error("Failed to add collaborator:", err);
      }
    }
  };

  const handlePermissionChange = useCallback((event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedPermissions((prev) => [...prev, name]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== name));
    }
  }, []);

  const handleOpenDeleteCollaboratorDialog = useCallback((collaborator) => {
    setSelectedCollaborator(collaborator);
    setOpenDeleteCollaboratorDialog(true);
  }, []);

  const handleCloseDeleteCollaboratorDialog = useCallback(() => {
    setOpenDeleteCollaboratorDialog(false);
    setSelectedCollaborator(null);
  }, []);

  const handleConfirmDeleteCollaborator = async () => {
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

  const handleOpenEditCollaboratorDialog = useCallback((collaborator) => {
    setSelectedCollaborator(collaborator);
    setPermissionsToEdit(collaborator.permissions || []);
    setOpenEditCollaboratorDialog(true);
  }, []);

  const handleCloseEditCollaboratorDialog = useCallback(() => {
    setOpenEditCollaboratorDialog(false);
    setSelectedCollaborator(null);
    setPermissionsToEdit([]);
  }, []);

  const handleEditPermissionChange = useCallback((event) => {
    const { name, checked } = event.target;
    if (checked) {
      setPermissionsToEdit((prev) => [...prev, name]);
    } else {
      setPermissionsToEdit((prev) => prev.filter((p) => p !== name));
    }
  }, []);

  const handleSavePermissions = async () => {
    if (selectedCollaborator && projectId) {
      try {
        await updateCollaboratorPermissions({
          projectId,
          githubUsername: selectedCollaborator.username,
          permissions: permissionsToEdit,
        }).unwrap();
      } catch (err) {
        const backendMessage = err?.data?.message || err?.message || "Failed to update permissions. Please try again.";
        alert(backendMessage);
        console.error("Failed to update permissions:", backendMessage, err);
      }
    }
  };

  // Project Edit/Delete Handlers
  const handleOpenEditProjectDialog = useCallback(() => {
    if (projectData?.project) {
      setEditProjectName(projectData.project.projectName);
      setEditProjectDescription(projectData.project.projectDescription);
      setEditGithubRepoLink(projectData.project.githubRepoLink);
      setOpenEditProjectDialog(true);
    }
  }, [projectData?.project]);

  const handleCloseEditProjectDialog = useCallback(() => {
    setOpenEditProjectDialog(false);
    resetUpdateProjectMutation();
  }, [resetUpdateProjectMutation]);

  const handleSaveProjectChanges = async () => {
    if (projectId) {
      try {
        await updateProject({
          projectId,
          projectName: editProjectName,
          projectDescription: editProjectDescription,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update project:", err);
      }
    }
  };

  const handleOpenDeleteProjectDialog = useCallback(() => {
    setOpenDeleteProjectDialog(true);
  }, []);

  const handleCloseDeleteProjectDialog = useCallback(() => {
    setOpenDeleteProjectDialog(false);
    setOpenConfirmDeleteRepoDialog(false); // Close both if cancelled from first dialog
    resetDeleteProjectMutation();
  }, [resetDeleteProjectMutation]);

  const handleConfirmProjectDelete = async () => {
    if (projectId) {
      try {
        await deleteProject(projectId).unwrap();
        // The effect for deleteProjectSuccess will trigger the next dialog
      } catch (err) {
        console.error("Failed to delete project from DB:", err);
      }
    }
  };

  const handleConfirmDeleteRepo = async (deleteRepo) => {
    if (deleteRepo && projectData?.project?.githubRepoLink) {
      try {
        const repoUrl = new URL(projectData.project.githubRepoLink);
        const pathParts = repoUrl.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          const owner = pathParts[0];
          const repoName = pathParts[1].replace(/\.git$/, "");
          await deleteGithubRepo({ owner, repo: repoName }).unwrap();
        } else {
          console.warn(
            "Could not parse owner/repo from GitHub link:",
            projectData.project.githubRepoLink
          );
        }
      } catch (err) {
        console.error("Failed to delete GitHub repo:", err);
      }
    }
    setOpenConfirmDeleteRepoDialog(false);
    router.push(`/${userId}/dashboard`); // Always redirect to dashboard after deletion flow
  };

  const project = projectData?.project;
  const collaborators = collaboratorsData?.collaborators || [];

  // Prepare dynamic chart data
  const projectWorkProgressData =
    projectMetricsData?.projectWorkProgressData || []; // Not used in this version but kept for consistency
  const codeContributionData = projectMetricsData?.codeContributionData || [];
  const timeSavedData = projectMetricsData?.timeSavedData || [];
  const geminiTokenData = projectMetricsData?.geminiTokenData || [];
  const prStatusData = projectMetricsData?.prStatusData || [];
  const prContributionData = projectMetricsData?.prContributionData || [];

  // Chart colors adapted to active theme
  const CHART_COLORS =
    currentThemeMode === "dark"
      ? [
          "#8c60f7",
          "#0ea5e9",
          "#a3e635",
          "#fbbf24",
          "#ef4444",
          "#38bdf8",
          "#c084fc",
          "#d946ef",
        ]
      : [
          "#4f46e5",
          "#0ea5e9",
          "#22c55e",
          "#fbbf24",
          "#ef4444",
          "#a855f7",
          "#ec4899",
          "#f97316",
        ];

  if (
    projectLoading ||
    metricsLoading ||
    updateThemeLoading ||
    !themePreferenceData
  ) {
    return (
      <Box
        className="flex justify-center items-center min-h-screen"
        sx={{ bgcolor: activeTheme.palette.background.default }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: activeTheme.palette.primary.main }}
        />
      </Box>
    );
  }

  if (projectIsError) {
    return (
      <Box
        p={4}
        className="min-h-screen"
        sx={{ bgcolor: activeTheme.palette.background.default }}
      >
        <Alert severity="error" className="rounded-xl">
          Failed to load project details:{" "}
          {projectError?.data?.message ||
            projectError?.status ||
            "Unknown error"}
        </Alert>
      </Box>
    );
  }

  if (metricsIsError) {
    console.error("Error loading project metrics:", metricsError);
    // Optionally display an alert for metrics specific error if charts are critical
  }

  if (!project) {
    return (
      <Box
        p={4}
        className="min-h-screen"
        sx={{ bgcolor: activeTheme.palette.background.default }}
      >
        <Alert severity="warning" className="rounded-xl">
          Project not found.
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <Box
        className="min-h-screen p-4 md:p-8 lg:p-12"
        sx={{
          bgcolor: activeTheme.palette.background.default,
          color: activeTheme.palette.text.primary,
        }}
      >
        {/* Project Header Section */}
        <ProjectHeader
          project={project}
          user_role={user_role}
          activeTheme={activeTheme}
          handleOpenEditProjectDialog={handleOpenEditProjectDialog}
          handleOpenDeleteProjectDialog={handleOpenDeleteProjectDialog}
          currentThemeMode={currentThemeMode}
        />

        {/* Project Modules Section */}
        <ProjectModules
          activeTheme={activeTheme}
          handleButtonClick={handleButtonClick}
          user_role={user_role}
          developerPermissions={developerPermissions}
        />

        {/* Project Metrics Section */}
        <ProjectMetrics
          activeTheme={activeTheme}
          projectMetricsData={{
            codeContributionData,
            timeSavedData,
            geminiTokenData,
            prContributionData,
            prStatusData,
          }}
          CHART_COLORS={CHART_COLORS}
          project={project}
        />

        {/* Collaborators Table Section */}
        <CollaboratorsTable
          activeTheme={activeTheme}
          collaborators={collaborators}
          user_role={user_role}
          collaboratorsLoading={collaboratorsLoading}
          collaboratorsIsError={collaboratorsIsError}
          collaboratorsError={collaboratorsError}
          collaboratorSearchFilter={collaboratorSearchFilter}
          setCollaboratorSearchFilter={setCollaboratorSearchFilter}
          handleOpenAddDialog={handleOpenAddDialog}
          handleOpenEditCollaboratorDialog={handleOpenEditCollaboratorDialog}
          handleOpenDeleteCollaboratorDialog={
            handleOpenDeleteCollaboratorDialog
          }
        />

        {/* Dialog Components */}
        <AddCollaboratorDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedPermissions={selectedPermissions}
          setSelectedPermissions={setSelectedPermissions}
          addCollaboratorLoading={addCollaboratorLoading}
          addCollaboratorIsError={addCollaboratorIsError}
          addCollaboratorError={addCollaboratorError}
          handleAddCollaborator={handleAddCollaborator}
          handlePermissionChange={handlePermissionChange}
          activeTheme={activeTheme}
          searchResults={searchResults}
          searchLoading={searchLoading}
          searchIsError={searchIsError}
          searchError={searchError}
          availablePermissions={availablePermissions}
        />

        <DeleteCollaboratorDialog
          open={openDeleteCollaboratorDialog}
          onClose={handleCloseDeleteCollaboratorDialog}
          selectedCollaborator={selectedCollaborator}
          deleteCollaboratorLoading={deleteCollaboratorLoading}
          deleteCollaboratorIsError={deleteCollaboratorIsError}
          deleteCollaboratorError={deleteCollaboratorError}
          handleConfirmDeleteCollaborator={handleConfirmDeleteCollaborator}
          activeTheme={activeTheme}
        />

        <EditCollaboratorPermissionsDialog
          open={openEditCollaboratorDialog}
          onClose={handleCloseEditCollaboratorDialog}
          selectedCollaborator={selectedCollaborator}
          permissionsToEdit={permissionsToEdit}
          updatePermissionsLoading={updatePermissionsLoading}
          updatePermissionsIsError={updatePermissionsIsError}
          updatePermissionsError={updatePermissionsError}
          handleEditPermissionChange={handleEditPermissionChange}
          handleSavePermissions={handleSavePermissions}
          activeTheme={activeTheme}
          availablePermissions={availablePermissions}
        />

        <EditProjectDialog
          open={openEditProjectDialog}
          onClose={handleCloseEditProjectDialog}
          editProjectName={editProjectName}
          setEditProjectName={setEditProjectName}
          editProjectDescription={editProjectDescription}
          setEditProjectDescription={setEditProjectDescription}
          editGithubRepoLink={editGithubRepoLink}
          updateProjectLoading={updateProjectLoading}
          updateProjectIsError={updateProjectIsError}
          updateProjectError={updateProjectError}
          handleSaveProjectChanges={handleSaveProjectChanges}
          activeTheme={activeTheme}
        />

        <DeleteProjectConfirmationDialog
          open={openDeleteProjectDialog}
          onClose={handleCloseDeleteProjectDialog}
          project={project}
          deleteProjectLoading={deleteProjectLoading}
          deleteProjectIsError={deleteProjectIsError}
          deleteProjectError={deleteProjectError}
          handleConfirmProjectDelete={handleConfirmProjectDelete}
          activeTheme={activeTheme}
        />

        <DeleteRepoConfirmationDialog
          open={openConfirmDeleteRepoDialog}
          onClose={() => handleConfirmDeleteRepo(false)}
          project={project}
          deleteGithubRepoLoading={deleteGithubRepoLoading}
          deleteGithubRepoIsError={deleteGithubRepoIsError}
          deleteGithubRepoError={deleteGithubRepoError}
          handleConfirmDeleteRepo={handleConfirmDeleteRepo}
          activeTheme={activeTheme}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ProjectDetailPage;
