"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Grid,
  Skeleton,
  Alert,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Popover,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  GitHub,
  Email,
  Person,
  Logout,
  Add,
  TrendingUp,
  AccessTime,
  Code,
  Star,
  Visibility,
  MoreVert,
  Timeline,
  Speed,
  Assignment,
  Group,
  Search,
  Refresh,
} from "@mui/icons-material";
import GitHubAuthDialog from "@/components/GitHubAuthDialog"; // Assuming this path is correct

import { useParams, useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  useDisconnectGitHubMutation,
  useGetGitHubStatusQuery,
  useGetUserAndGithubDataQuery,
} from "@/features/githubApiSlice";
import {
  useGetDeveloperProjectsQuery,
  useGetProjectsQuery,
  useGetCollaboratorsQuery,
} from "@/features/projectApiSlice";
import classNames from "classnames";

function ProjectCard({ project, index, handleCreateProjectClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch collaborators for this project using projectApiSlice
  const {
    data: collaborators,
    isLoading: collaboratorsLoading,
    error: collaboratorsError,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(project._id, {
    // Polling every 30 seconds to keep collaborator count updated
    pollingInterval: 30000,
  });

  const collaboratorCount = collaborators?.collaborators?.length || 0;

  // --- DEBUGGING LOGS START ---
  useEffect(() => {
    console.group(`Project Card: ${project?.projectName || "Unnamed Project"}`);
    console.log("Collaborators Loading:", collaboratorsLoading);
    console.log("Collaborators Error:", collaboratorsError);
    console.log("Collaborators Data (raw):", collaborators);
    console.log("Calculated Collaborator Count:", collaboratorCount);
    console.groupEnd();
  }, [
    collaboratorsLoading,
    collaboratorsError,
    collaborators,
    collaboratorCount,
    project?.projectName,
  ]);
  // --- DEBUGGING LOGS END ---

  const handleCollaboratorsClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Refresh collaborators data when opening the popover
    refetchCollaborators();
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleRefreshCollaborators = async () => {
    setIsRefreshing(true);
    try {
      await refetchCollaborators();
    } finally {
      setIsRefreshing(false);
    }
  };

  const open = Boolean(anchorEl);

  const progress = Math.floor(Math.random() * 40) + 60;
  const aiContribution = Math.floor(Math.random() * 40) + 30;
  const humanContribution = 100 - aiContribution;

  const statusOptions = ["In Progress", "Development", "Testing", "Planning"];
  const status = statusOptions[index % statusOptions.length];
  // Updated statusColors for dark mode with white text
  const statusColors = {
    "In Progress": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white",
    Development: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white",
    Testing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-white",
    Planning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-white",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md transition dark:bg-gray-900 dark:text-white hover:shadow-xl flex flex-col justify-between space-y-2 w-full dark:border-gray-800">
      {/* Header: Project Name + Icon */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-base font-bold dark:text-white text-gray-900">
            {project?.projectName || "Untitled Project"}
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-[32px]">
          {project?.projectDescription || "No description available."}
        </p>
      </div>

      {/* Progress Section */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Progress</p>
        <div className="flex items-center gap-2">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 5,
              // Updated LinearProgress track color for dark mode
              backgroundColor: "#e5e7eb", // Light mode track color
              ".dark &": {
                // Apply dark mode specific styles to the track
                backgroundColor: "#374151", // Gray-700 for dark mode track
              },
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6366F1",
              },
            }}
            className="flex-1"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {progress}%
          </span>
        </div>
      </div>

      {/* Contribution Section */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution</p>
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <div
            className="absolute h-full bg-indigo-400"
            style={{ width: `${aiContribution}%` }}
          ></div>
          <div
            className="absolute h-full bg-purple-400"
            style={{ left: `${aiContribution}%`, width: `${humanContribution}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>AI: {aiContribution}%</span>
          <span>Human: {humanContribution}%</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center">
        <div
          className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-1 cursor-pointer hover:underline"
          onClick={handleCollaboratorsClick}
        >
          <Group fontSize="small" />
          {collaboratorsLoading ? (
            <CircularProgress size={12} />
          ) : (
            <span>{collaboratorCount} collaborators</span>
          )}
        </div>
        {/* Replaced Chip with a custom styled span */}
        <span
          className={classNames(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            statusColors[status]
          )}
        >
          {status}
        </span>
      </div>

      {/* Collaborators Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="p-3 max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {" "}
          {/* Added dark background */}
          <div className="flex justify-between items-center mb-2">
            <Typography variant="subtitle2" className="font-bold text-sm dark:text-white">
              Project Collaborators
            </Typography>
            <IconButton
              size="small"
              onClick={handleRefreshCollaborators}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <CircularProgress size={16} />
              ) : (
                <Refresh fontSize="small" />
              )}
            </IconButton>
          </div>
          {collaboratorsLoading ? (
            <div className="flex justify-center py-2">
              <CircularProgress size={20} />
            </div>
          ) : collaboratorsError ? (
            <Alert severity="error" className="text-xs">
              Failed to load collaborators
            </Alert>
          ) : collaboratorCount === 0 ? (
            <Typography variant="body2" className="text-xs dark:text-gray-300">
              No collaborators yet
            </Typography>
          ) : (
            <div className="space-y-1">
              {(collaborators?.collaborators || []).map((collaborator) => (
                <div key={collaborator.githubId || collaborator.username} className="flex items-center gap-2">
                  <Avatar
                    src={collaborator.avatarUrl}
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography variant="body2" className="text-xs dark:text-gray-200">
                    {collaborator.username}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </div>
      </Popover>

      {/* Button */}
      <button
        onClick={() => handleCreateProjectClick(project._id)}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
      >
        View Details
      </button>
    </div>
  );
}

export default function DashboardContent() {
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const params = useParams();
  const userId = params.userId;
  const router = useRouter();

  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const user_role = userData?.user?.role;
  const { data: developerProjects } = useGetDeveloperProjectsQuery(userId);
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetProjectsQuery(userId);

  const projects =
    user_role === "manager" ? projectData?.projects || [] : developerProjects || [];

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    data: statusResponse,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useGetGitHubStatusQuery(userId);

  const [disconnectGitHub, { isLoading: disconnectLoading }] =
    useDisconnectGitHubMutation();

  useEffect(() => {
    if (statusResponse?.success) {
      setIsAuthenticated(statusResponse.isAuthenticated);
      if (statusResponse.isAuthenticated && statusResponse.data) {
        setGithubData(statusResponse.data);
        setShowGitHubDialog(false);
      } else {
        setGithubData(null);
        setShowGitHubDialog(true);
      }
    }
  }, [statusResponse]);

  const handleGitHubAuthSuccess = (data) => {
    setGithubData(data);
    setIsAuthenticated(true);
    setShowGitHubDialog(false);
    refetchStatus();
  };

  const handleCreateProjectClick = (projectId) => {
    router.push(`/${userId}/create-project/${projectId}`);
  };

  const handleDisconnectGitHub = async () => {
    try {
      await disconnectGitHub().unwrap();
      setGithubData(null);
      setIsAuthenticated(false);
      setShowGitHubDialog(true);
      refetchStatus();
    } catch (error) {
      console.error("Failed to disconnect GitHub:", error);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert severity="error" className="mb-4">
            Failed to load dashboard. Please try refreshing the page.
            <Button onClick={() => refetchStatus()} className="ml-2">
              Retry
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto p-6 font-inter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          {isAuthenticated && githubData && (
            <TextField
              variant="outlined"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-500 dark:text-gray-400" />{" "}
                    {/* Added dark text for icon */}
                  </InputAdornment>
                ),
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white", // Added dark background and text for input
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    // Default border color
                    borderColor: "#e5e7eb", // light-mode default border
                  },
                  "&:hover fieldset": {
                    borderColor: "#6366F1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                    borderWidth: "1px",
                  },
                  // Dark mode border colors
                  ".dark & fieldset": {
                    borderColor: "#1f2937", // Gray-800 for dark mode border
                  },
                  ".dark &:hover fieldset": {
                    borderColor: "#4f46e5", // Darker hover border (e.g., indigo-600)
                  },
                  ".dark &.Mui-focused fieldset": {
                    borderColor: "#a1a1aa", // Darker focused border (e.g., zinc-400)
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "10px 14px",
                  "&::placeholder": {
                    // Placeholder text color
                    color: "#9ca3af", // default light placeholder
                  },
                  ".dark &::placeholder": {
                    // Dark mode placeholder
                    color: "#9ca3af", // Gray-400 for dark mode placeholder
                  },
                },
                width: { xs: "100%", sm: "250px" },
                mt: { xs: 3, sm: 0 },
              }}
            />
          )}
        </div>

        {isAuthenticated && githubData ? (
          <>
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id || index}
                    project={project}
                    index={index}
                    handleCreateProjectClick={handleCreateProjectClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 dark:text-white">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Assignment className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm
                    ? `No projects match your search for "${searchTerm}".`
                    : "Get started by creating your first project"}
                </p>
                {!searchTerm && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateProjectClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Create Project
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-800 text-center">
            {" "}
            {/* Changed dark background to gray-800 */}
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center">
              {" "}
              {/* Added dark background */}
              <GitHub className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {" "}
              {/* Added dark text */}
              Connect Your GitHub Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              {" "}
              {/* Added dark text */}
              Connect your GitHub account to access all dashboard features, sync
              your repositories, and track your project progress.
            </p>
            <Button
              variant="contained"
              startIcon={<GitHub />}
              onClick={() => setShowGitHubDialog(true)}
              size="large"
              className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700" // Adjusted for better dark mode visibility
            >
              Connect GitHub
            </Button>
          </div>
        )}

        <GitHubAuthDialog
          open={showGitHubDialog}
          onClose={() => setShowGitHubDialog(false)}
          onSuccess={handleGitHubAuthSuccess}
        />
      </div>
    </div>
  );
}