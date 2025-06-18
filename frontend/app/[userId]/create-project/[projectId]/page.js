"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import GitHubIcon from "@mui/icons-material/GitHub";
import AddIcon from "@mui/icons-material/Add";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BarChartIcon from "@mui/icons-material/BarChart"; // Icon for PRs/Branches
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Icon for time saved
import CloudQueueIcon from "@mui/icons-material/CloudQueue"; // Icon for Gemini tokens
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import {
  useGetCollaboratorsQuery,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/features/projectApiSlice";
import {
  useAddCollaboratorMutation,
  useSearchGithubUsersQuery,
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useGetUserAndGithubDataQuery,
  useDeleteGithubRepoMutation,
} from "@/features/githubApiSlice";
import { useGetCollaboratorPermissionsQuery } from "@/features/developerApiSlice";
import { useGetProjectMetricsQuery } from "@/features/projectMetricsApiSlice"; // NEW: Import the new metrics slice
import { skipToken } from "@reduxjs/toolkit/query";

const lightTheme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
      light: "#818cf8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0ea5e9",
    },
    success: {
      main: "#22c55e",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
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
          borderRadius: "12px",
          padding: "10px 20px",
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "#cbd5e1",
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
        },
      },
    },
  },
});

const LightHeader = styled("div")(({ theme }) => ({
  background: "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)",
  color: theme.palette.text.primary,
  padding: theme.spacing(4),
  borderRadius: "20px",
  marginBottom: theme.spacing(4),
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "16px",
  padding: theme.spacing(2.5),
  minWidth: "180px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "150px",
  transition: "all 0.3s ease",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  "&:hover": {
    backgroundColor: "#f9fafb",
    borderColor: theme.palette.primary.light,
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
  },
  "& .MuiButton-startIcon": {
    margin: 0,
    marginBottom: theme.spacing(1.5),
    fontSize: "2.8rem",
  },
}));

const CollaboratorCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
  textAlign: "center",
  borderLeft: "none",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5px",
    background: "linear-gradient(90deg, #4f46e5 0%, #0ea5e9 100%)",
    transition: "height 0.3s ease",
  },
  "&:hover::before": {
    height: "10px",
  },
  "&:hover .collab-actions": {
    opacity: 1,
  },
}));

const PermissionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.4),
  backgroundColor: "#e0e7ff",
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: "0.7rem",
  padding: "4px 8px",
  height: "unset",
}));

const ChartCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#22c55e",
  "#fbbf24",
  "#ef4444",
  "#a855f7",
]; // Colors for pie chart

const ProjectDetailPage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const router = useRouter();
  const codeAnalysisTabRef = useRef(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteCollaboratorDialog, setOpenDeleteCollaboratorDialog] =
    useState(false);
  const [openEditCollaboratorDialog, setOpenEditCollaboratorDialog] =
    useState(false);

  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);
  const [openConfirmDeleteRepoDialog, setOpenConfirmDeleteRepoDialog] =
    useState(false);

  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editGithubRepoLink, setEditGithubRepoLink] = useState("");

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
    refetch: refetchProjectDetails,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  // Fetch collaborators
  const {
    data: collaboratorsData,
    isLoading: collaboratorsLoading,
    isError: collaboratorsIsError,
    error: collaboratorsError,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // NEW: Fetch project metrics
  const {
    data: projectMetricsData,
    isLoading: metricsLoading,
    isError: metricsIsError,
    error: metricsError,
    refetch: refetchProjectMetrics,
  } = useGetProjectMetricsQuery(projectId, { skip: !projectId });

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

  // Effects for project mutations
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
      setOpenConfirmDeleteRepoDialog(false);
      router.push(`/${userId}/dashboard`);
      resetDeleteProjectMutation();
    }
  }, [deleteProjectSuccess, router, userId, resetDeleteProjectMutation]);

  useEffect(() => {
    if (deleteGithubRepoSuccess) {
      console.log("GitHub repo deleted successfully.");
      resetDeleteGithubRepoMutation();
    }
  }, [deleteGithubRepoSuccess, resetDeleteGithubRepoMutation]);

  // Dialog handlers for Collaborators
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
      case "managePrBranches":
        router.push(
          `/${userId}/create-project/${projectId}/manager-pr-branches`
        );
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

  const handlePermissionChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedPermissions((prev) => [...prev, name]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== name));
    }
  };

  const handleOpenDeleteCollaboratorDialog = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setOpenDeleteCollaboratorDialog(true);
  };

  const handleCloseDeleteCollaboratorDialog = () => {
    setOpenDeleteCollaboratorDialog(false);
    setSelectedCollaborator(null);
  };

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

  const handleOpenEditCollaboratorDialog = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setPermissionsToEdit(collaborator.permissions || []);
    setOpenEditCollaboratorDialog(true);
  };

  const handleCloseEditCollaboratorDialog = () => {
    setOpenEditCollaboratorDialog(false);
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

  // Project Edit/Delete Handlers
  const handleOpenEditProjectDialog = () => {
    if (project) {
      setEditProjectName(project.projectName);
      setEditProjectDescription(project.projectDescription);
      setEditGithubRepoLink(project.githubRepoLink);
      setOpenEditProjectDialog(true);
    }
  };

  const handleCloseEditProjectDialog = () => {
    setOpenEditProjectDialog(false);
    resetUpdateProjectMutation();
  };

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

  const handleOpenDeleteProjectDialog = () => {
    setOpenDeleteProjectDialog(true);
  };

  const handleCloseDeleteProjectDialog = () => {
    setOpenDeleteProjectDialog(false);
    setOpenConfirmDeleteRepoDialog(false);
    resetDeleteProjectMutation();
  };

  const handleConfirmProjectDelete = async () => {
    if (projectId) {
      try {
        await deleteProject(projectId).unwrap();
        setOpenDeleteProjectDialog(false);
        setOpenConfirmDeleteRepoDialog(true);
      } catch (err) {
        console.error("Failed to delete project from DB:", err);
      }
    }
  };

  const handleConfirmDeleteRepo = async (deleteRepo) => {
    if (deleteRepo && project?.githubRepoLink) {
      try {
        const repoUrl = new URL(project.githubRepoLink);
        const pathParts = repoUrl.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          const owner = pathParts[0];
          const repoName = pathParts[1].replace(/\.git$/, "");

          await deleteGithubRepo({ owner, repo: repoName }).unwrap();
        } else {
          console.warn(
            "Could not parse owner/repo from GitHub link:",
            project.githubRepoLink
          );
        }
      } catch (err) {
        console.error("Failed to delete GitHub repo:", err);
      }
    }
    setOpenConfirmDeleteRepoDialog(false);
    router.push(`/${userId}/dashboard`);
  };

  const project = projectData?.project;
  const collaborators = collaboratorsData?.collaborators || [];

  // Prepare dynamic chart data
  const projectWorkData = projectMetricsData?.projectWorkProgressData || [];
  const codeContributionData = projectMetricsData?.codeContributionData || [];
  const timeSavedData = projectMetricsData?.timeSavedData || [];
  const geminiTokenData = projectMetricsData?.geminiTokenData || [];
  const prStatusData = projectMetricsData?.prStatusData || []; // New data for PR status
  const prContributionData = projectMetricsData?.prContributionData || []; // New data for AI vs Dev PRs

  if (projectLoading || metricsLoading) {
    // Include metricsLoading
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

  if (metricsIsError) {
    // Handle metrics error
    console.error("Error loading project metrics:", metricsError);
    // You might choose to display an alert, or just log and let the charts show empty states
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
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, padding: 4, margin: "0 auto" }}>
        {/* Light Header */}
        <LightHeader>
          <Box display="flex" alignItems="center" mb={1.5} flexWrap="wrap">
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mr: 2 }}
            >
              {project?.projectName}
            </Typography>
            <Chip
              label="Active"
              size="medium"
              sx={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "4px 8px",
                height: "auto",
              }}
            />
            {user_role === "manager" && (
              <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                <IconButton
                  aria-label="edit project"
                  onClick={handleOpenEditProjectDialog}
                  sx={{
                    color: "primary.main",
                    bgcolor: "rgba(79,70,229,0.1)",
                    "&:hover": { bgcolor: "rgba(79,70,229,0.2)" },
                  }}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="delete project"
                  onClick={handleOpenDeleteProjectDialog}
                  sx={{
                    color: "error.main",
                    bgcolor: "rgba(239,68,68,0.1)",
                    "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Typography
            variant="body1"
            sx={{ maxWidth: "900px", mb: 2, color: "text.secondary" }}
          >
            {project?.projectDescription}
          </Typography>

          {project?.githubRepoLink && (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <GitHubIcon
                sx={{ mr: 1, color: "primary.main", fontSize: "1.5rem" }}
              />
              <Link
                href={project.githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                  fontWeight: 500,
                  fontSize: "1rem",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {project.githubRepoLink.replace("https://", "")}
              </Link>
            </Box>
          )}
        </LightHeader>

        {/* Action Buttons Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              onClick={() => handleButtonClick("userStory")}
              startIcon={<DescriptionIcon sx={{ color: "#8b5cf6" }} />}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                User Stories
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Create and manage requirements
              </Typography>
            </ActionButton>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              onClick={() => {
                if (
                  developerPermissions?.includes("Code analysis") ||
                  user_role === "manager"
                ) {
                  handleButtonClick("codeAnalysis");
                }
              }}
              startIcon={<CodeIcon sx={{ color: "#10b981" }} />}
              disabled={
                !(
                  user_role === "manager" ||
                  developerPermissions?.includes("Code analysis")
                )
              }
              sx={{
                opacity: !(
                  user_role === "manager" ||
                  developerPermissions?.includes("Code analysis")
                )
                  ? 0.6
                  : 1,
                pointerEvents: !(
                  user_role === "manager" ||
                  developerPermissions?.includes("Code analysis")
                )
                  ? "none"
                  : "auto",
                backgroundColor: !(
                  user_role === "manager" ||
                  developerPermissions?.includes("Code analysis")
                )
                  ? "#f5f5f5"
                  : "#ffffff",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Code Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review and analyze code
              </Typography>
            </ActionButton>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              onClick={() => handleButtonClick("documentation")}
              startIcon={<DescriptionIcon sx={{ color: "#ec4899" }} />}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Documentation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage project docs
              </Typography>
            </ActionButton>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              onClick={() => handleButtonClick("managePrBranches")}
              startIcon={<AccountTreeIcon sx={{ color: "#f97316" }} />}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                PR & Branches
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage repository activity
              </Typography>
            </ActionButton>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
        >
          Project Insights
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Project Work Progress Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Project Work Progress
              </Typography>
              <Box sx={{ flexGrow: 1, height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectWorkData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="date"
                      stroke={lightTheme.palette.text.secondary}
                    />
                    <YAxis stroke={lightTheme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Progress (%)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#4f46e5" }}
                      activeDot={{ r: 8, strokeWidth: 2, fill: "#4f46e5" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="AI Developed Stories"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#0ea5e9" }}
                      activeDot={{ r: 8, strokeWidth: 2, fill: "#0ea5e9" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* Code Contribution (Lines) */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Code Contribution (Lines)
              </Typography>
              <Box sx={{ flexGrow: 1, height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={codeContributionData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke={lightTheme.palette.text.secondary}
                    />
                    <YAxis stroke={lightTheme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Lines of Code"
                      fill="#0ea5e9"
                      barSize={30}
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* Time Saved by AI Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Time Saved by AI (Hours)
              </Typography>
              <Box sx={{ flexGrow: 1, height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeSavedData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke={lightTheme.palette.text.secondary}
                    />
                    <YAxis stroke={lightTheme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Hours Saved"
                      fill="#22c55e"
                      barSize={30}
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* Gemini AI Token Usage Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Gemini AI Token Usage
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: 250,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={geminiTokenData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {geminiTokenData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* New Chart: AI-Assisted PRs vs. Developer-Only PRs */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Pull Request Contribution
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: 250,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prContributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {prContributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>

          {/* New Chart: PR Status Distribution */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Pull Request Status Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prStatusData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke={lightTheme.palette.text.secondary}
                    />
                    <YAxis stroke={lightTheme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#a855f7" // A new color
                      barSize={30}
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Collaborators Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 0 }}>
              <PeopleIcon
                sx={{ mr: 1.5, color: "primary.main", fontSize: 28 }}
              />
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Team Collaborators
              </Typography>
              <Chip
                label={`${collaborators.length} members`}
                size="medium"
                sx={{
                  ml: 2,
                  backgroundColor: "#f0f9ff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              />
            </Box>

            {user_role === "manager" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                startIcon={<AddIcon />}
                size="large"
              >
                Add Collaborator
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {collaboratorsLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={40} />
            </Box>
          ) : collaboratorsIsError ? (
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {collaboratorsError?.data?.message ||
                "Error loading collaborators"}
            </Alert>
          ) : collaborators.length > 0 ? (
            <Grid container spacing={3}>
              {collaborators.map((collab) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={collab.githubId || collab.username}
                >
                  <CollaboratorCard>
                    <Avatar
                      src={collab.avatarUrl}
                      alt={collab.username}
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                        border: "3px solid #0ea5e9",
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                    >
                      {collab.username}
                    </Typography>
                    <Chip
                      label={collab.status}
                      size="small"
                      sx={{
                        mb: 1.5,
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        height: "24px",
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
                    <Box
                      sx={{
                        minHeight: 40,
                        mb: 1,
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {collab.permissions && collab.permissions.length > 0 ? (
                        collab.permissions.map((perm) => (
                          <PermissionChip key={perm} label={perm} />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No specific permissions
                        </Typography>
                      )}
                    </Box>

                    {user_role === "manager" && (
                      <Box
                        className="collab-actions"
                        sx={{
                          position: "absolute",
                          bottom: 10,
                          right: 10,
                          opacity: { xs: 1, md: 0 },
                          transition: "opacity 0.3s ease",
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          aria-label="edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCollaboratorDialog(collab);
                          }}
                          sx={{
                            color: "primary.main",
                            bgcolor: "rgba(79,70,229,0.1)",
                            "&:hover": { bgcolor: "rgba(79,70,229,0.2)" },
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteCollaboratorDialog(collab);
                          }}
                          sx={{
                            color: "error.main",
                            bgcolor: "rgba(239,68,68,0.1)",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CollaboratorCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              textAlign="center"
              py={5}
              sx={{ border: "1px dashed #cbd5e1", borderRadius: "16px", p: 4 }}
            >
              <PeopleIcon sx={{ fontSize: 60, color: "#9ca3af", mb: 2 }} />
              <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                No collaborators yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start building your team by adding new collaborators to this
                project.
              </Typography>
              {user_role === "manager" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  size="medium"
                >
                  Add Your First Collaborator
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Add New Collaborator Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#e0f2fe",
              color: "primary.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add New Collaborator
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Search GitHub Username"
              type="text"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              helperText="Type at least 3 characters to search GitHub users"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <GitHubIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              size="medium"
            />

            {searchLoading && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={28} />
              </Box>
            )}

            {searchIsError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
                {searchError?.data?.message || "Search error"}
              </Alert>
            )}

            {!searchLoading &&
              !searchIsError &&
              searchTerm.length >= 3 &&
              searchResults?.users?.length === 0 && (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="text.secondary">
                    No users found matching your search.
                  </Typography>
                </Box>
              )}

            {searchResults?.users && searchResults.users.length > 0 && (
              <List
                sx={{
                  maxHeight: 280,
                  overflow: "auto",
                  mt: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  bgcolor: "#fdfefe",
                }}
              >
                {searchResults.users.map((user) => (
                  <ListItemButton
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    selected={selectedUser?.id === user.id}
                    sx={{
                      borderRadius: "8px",
                      py: 1.5,
                      mx: 1,
                      my: 0.5,
                      "&.Mui-selected": { backgroundColor: "#eef2ff" },
                      "&:hover": { backgroundColor: "#f5f7fa" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.avatar_url}
                        alt={user.login}
                        sx={{
                          width: 44,
                          height: 44,
                          border: "2px solid #a78bfa",
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.login}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "text.primary",
                      }}
                      secondary={`GitHub ID: ${user.id}`}
                      secondaryTypographyProps={{
                        fontSize: "0.85rem",
                        color: "text.secondary",
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}

            {selectedUser && (
              <Box
                sx={{
                  mt: 3,
                  mb: 2,
                  p: 3,
                  bgcolor: "#f9fafb",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}
                >
                  Set Permissions for {selectedUser.login}
                </Typography>
                <FormGroup
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.5,
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
                          size="medium"
                          sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                        />
                      }
                      label={
                        <Typography
                          variant="body1"
                          sx={{ fontSize: "0.95rem", color: "text.primary" }}
                        >
                          {permission}
                        </Typography>
                      }
                      sx={{ m: 0, "& .MuiFormControlLabel-label": { ml: 0.5 } }}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {addCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {addCollaboratorError.data?.message ||
                  "Error adding collaborator. Please try again."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#f0f9ff",
            }}
          >
            <Button
              onClick={handleCloseAddDialog}
              variant="outlined"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCollaborator}
              disabled={!selectedUser || addCollaboratorLoading}
              variant="contained"
              color="primary"
              size="medium"
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
          open={openDeleteCollaboratorDialog}
          onClose={handleCloseDeleteCollaboratorDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#fef2f2",
              color: "error.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box textAlign="center" py={2}>
              <DeleteIcon sx={{ fontSize: 60, color: "#fca5a5", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Remove {selectedCollaborator?.username}?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action will permanently remove them from the project and
                revoke their GitHub repository access.
              </Typography>
            </Box>

            {deleteCollaboratorIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {deleteCollaboratorError.data?.message ||
                  "Error deleting collaborator."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#fef2f2",
            }}
          >
            <Button
              onClick={handleCloseDeleteCollaboratorDialog}
              variant="outlined"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeleteCollaborator}
              color="error"
              variant="contained"
              disabled={deleteCollaboratorLoading}
              size="medium"
            >
              {deleteCollaboratorLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete Collaborator"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Collaborator Permissions Dialog */}
        <Dialog
          open={openEditCollaboratorDialog}
          onClose={handleCloseEditCollaboratorDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#e0f2fe",
              color: "primary.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <EditIcon sx={{ mr: 1 }} />
            Edit Permissions for {selectedCollaborator?.username}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box
              sx={{
                mt: 1,
                mb: 2,
                p: 3,
                bgcolor: "#f9fafb",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}
              >
                Available Permissions
              </Typography>
              <FormGroup
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 1.5,
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
                        size="medium"
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        sx={{ fontSize: "0.95rem", color: "text.primary" }}
                      >
                        {permission}
                      </Typography>
                    }
                    sx={{ m: 0, "& .MuiFormControlLabel-label": { ml: 0.5 } }}
                  />
                ))}
              </FormGroup>
            </Box>

            {updatePermissionsIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {updatePermissionsError.data?.message ||
                  "Error updating permissions."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#f0f9ff",
            }}
          >
            <Button
              onClick={handleCloseEditCollaboratorDialog}
              variant="outlined"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              variant="contained"
              color="primary"
              disabled={updatePermissionsLoading}
              size="medium"
            >
              {updatePermissionsLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* New: Edit Project Dialog */}
        <Dialog
          open={openEditProjectDialog}
          onClose={handleCloseEditProjectDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#e0f2fe",
              color: "primary.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <EditIcon sx={{ mr: 1 }} />
            Edit Project Details
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Project Title"
              type="text"
              fullWidth
              variant="outlined"
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
              sx={{ mb: 2 }}
              size="medium"
            />
            <TextField
              margin="dense"
              label="Project Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editProjectDescription}
              onChange={(e) => setEditProjectDescription(e.target.value)}
              sx={{ mb: 2 }}
              size="medium"
            />
            <TextField
              margin="dense"
              label="GitHub Repository Link"
              type="url"
              fullWidth
              variant="outlined"
              value={editGithubRepoLink}
              disabled
              sx={{ mb: 2 }}
              size="medium"
              InputProps={{
                readOnly: true,
              }}
            />

            {updateProjectIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {updateProjectError.data?.message ||
                  "Error updating project. Please try again."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#f0f9ff",
            }}
          >
            <Button
              onClick={handleCloseEditProjectDialog}
              variant="outlined"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProjectChanges}
              variant="contained"
              color="primary"
              disabled={updateProjectLoading}
              size="medium"
            >
              {updateProjectLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* New: Delete Project Confirmation Dialog (Phase 1) */}
        <Dialog
          open={openDeleteProjectDialog}
          onClose={handleCloseDeleteProjectDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#fef2f2",
              color: "error.main",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Confirm Project Deletion
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box textAlign="center" py={2}>
              <DeleteIcon sx={{ fontSize: 60, color: "#fca5a5", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Are you sure you want to delete "{project?.projectName}"?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action will permanently remove the project from your
                database.
              </Typography>
            </Box>

            {deleteProjectIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {deleteProjectError.data?.message ||
                  "Error deleting project from database."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#fef2f2",
            }}
          >
            <Button
              onClick={handleCloseDeleteProjectDialog}
              variant="outlined"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProjectDelete}
              color="error"
              variant="contained"
              disabled={deleteProjectLoading}
              size="medium"
            >
              {deleteProjectLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Yes, Delete Project"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* New: Confirm GitHub Repo Deletion Dialog (Phase 2) */}
        <Dialog
          open={openConfirmDeleteRepoDialog}
          onClose={() => handleConfirmDeleteRepo(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#fffbe0",
              color: "#d97706",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
              p: 2.5,
            }}
          >
            <GitHubIcon sx={{ mr: 1 }} />
            Delete GitHub Repository?
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box textAlign="center" py={2}>
              <GitHubIcon sx={{ fontSize: 60, color: "#fcd34d", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Also delete associated GitHub repository?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will permanently delete the GitHub repository linked to
                this project: <br />
                <Typography component="span" fontWeight="bold">
                  {project?.githubRepoLink.split("/").pop()}
                </Typography>
              </Typography>
            </Box>

            {deleteGithubRepoIsError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>
                {deleteGithubRepoError.data?.message ||
                  "Error deleting GitHub repository. You may need to delete it manually."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              bgcolor: "#fffbe0",
            }}
          >
            <Button
              onClick={() => handleConfirmDeleteRepo(false)}
              variant="outlined"
              size="medium"
            >
              No, Keep GitHub Repo
            </Button>
            <Button
              onClick={() => handleConfirmDeleteRepo(true)}
              color="warning"
              variant="contained"
              disabled={deleteGithubRepoLoading}
              size="medium"
            >
              {deleteGithubRepoLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Yes, Delete GitHub Repo"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectDetailPage;
