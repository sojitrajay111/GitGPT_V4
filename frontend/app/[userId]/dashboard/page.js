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
  Chip,
  Skeleton,
  Alert,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Popover,
  CircularProgress,
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
} from "@mui/icons-material";
import GitHubAuthDialog from "@/components/GitHubAuthDialog";

import { useParams, useRouter } from "next/navigation";

import {
  useDisconnectGitHubMutation,
  useGetGitHubStatusQuery,
  useGetUserAndGithubDataQuery,
  useGetCollaboratorsQuery,
} from "@/features/githubApiSlice";
import { useGetDeveloperProjectsQuery } from "@/features/developerApiSlice";
import { useGetProjectsQuery } from "@/features/projectApiSlice";
import classNames from "classnames";

function ProjectCard({ project, index, handleCreateProjectClick }) {
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch collaborators for this project
  const { data: collaborators, isLoading: collaboratorsLoading } =
    useGetCollaboratorsQuery(project._id);

  const collaboratorCount = collaborators?.length || 0;

  const handleCollaboratorsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const progress = Math.floor(Math.random() * 40) + 60;
  const aiContribution = Math.floor(Math.random() * 40) + 30;
  const humanContribution = 100 - aiContribution;

  const statusOptions = ["In Progress", "Development", "Testing", "Planning"];
  const status = statusOptions[index % statusOptions.length];
  const statusColors = {
    "In Progress": "bg-gray-100 text-gray-800",
    Development: "bg-blue-100 text-blue-800",
    Testing: "bg-green-100 text-green-800",
    Planning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md transition dark:bg-gray-900 dark:text-white hover:shadow-xl flex flex-col justify-between space-y-4 w-full">
      {/* Header: Project Name + Icon */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold dark:text-white text-gray-900">
            {project?.projectName || "Untitled Project"}
          </h2>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 h-[40px]">
          {project?.projectDescription || "No description available."}
        </p>
      </div>

      {/* Progress Section */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Progress</p>
        <div className="flex items-center gap-2">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6366F1",
              },
            }}
            className="flex-1"
          />
          <span className="text-sm text-gray-700 font-medium">{progress}%</span>
        </div>
      </div>

      {/* Contribution Section */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Contribution</p>
        <div className="w-full h-3 rounded-full bg-gray-200 relative overflow-hidden">
          <div
            className="absolute h-full bg-indigo-400"
            style={{ width: `${aiContribution}%` }}
          ></div>
          <div
            className="absolute h-full bg-purple-400"
            style={{
              left: `${aiContribution}%`,
              width: `${humanContribution}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>AI: {aiContribution}%</span>
          <span>Human: {humanContribution}%</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center">
        <div
          className="flex items-center text-sm text-gray-600 gap-1 cursor-pointer hover:underline"
          onClick={handleCollaboratorsClick}
        >
          <Group fontSize="small" />
          <span>{collaboratorCount} collaborators</span>
        </div>
        <Chip
          label={status}
          size="small"
          className={classNames(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            statusColors[status]
          )}
        />
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
        <div className="p-4 max-w-xs">
          <Typography variant="subtitle2" className="font-bold mb-2">
            Project Collaborators
          </Typography>

          {collaboratorsLoading ? (
            <div className="flex justify-center">
              <CircularProgress size={20} />
            </div>
          ) : collaboratorCount === 0 ? (
            <Typography variant="body2">No collaborators yet</Typography>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-2">
                  <Avatar
                    src={collaborator.avatar_url}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">{collaborator.login}</Typography>
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
    user_role === "manager"
      ? projectData?.projects || []
      : developerProjects || [];

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
        </div>

        {isAuthenticated && githubData ? (
          <>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, index) => (
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
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get started by creating your first project
                </p>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateProjectClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Create Project
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <GitHub className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Connect Your GitHub Account
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your GitHub account to access all dashboard features, sync
              your repositories, and track your project progress.
            </p>
            <Button
              variant="contained"
              startIcon={<GitHub />}
              onClick={() => setShowGitHubDialog(true)}
              size="large"
              className="bg-gray-900 hover:bg-gray-800"
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
