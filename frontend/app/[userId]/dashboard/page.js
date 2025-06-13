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
} from "@mui/icons-material";
import GitHubAuthDialog from "@/components/GitHubAuthDialog";
// import {
//   useGetGitHubStatusQuery,
//   useDisconnectGitHubMutation,
//   useGetUserAndGithubDataQuery,
// } from "@/features/githubApiSlice";


import { useParams, useRouter } from "next/navigation";
// import { useGetProjectsQuery } from "@/features/projectApiSlice";
// import { useGetDeveloperProjectsQuery } from "@/features/developerApiSlice";
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
import { useDisconnectGitHubMutation, useGetGitHubStatusQuery, useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useGetDeveloperProjectsQuery } from "@/features/developerApiSlice";
import { useGetProjectsQuery } from "@/features/projectApiSlice";

// Enhanced StatCard Component
function StatCard({ label, value, icon: Icon, trend, color = "primary" }) {
  const colorMap = {
    primary: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-orange-50 text-orange-600",
    info: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Project Card Component
function ProjectCard({ project, index, handleCreateProjectClick }) {
  const [workProgress] = useState(Math.floor(Math.random() * 40) + 60); // 60-100%
  const [aiTimeSaved] = useState(Math.floor(Math.random() * 30) + 20); // 20-50 hours

  const progressData = [
    { name: "Completed", value: workProgress, fill: "#10B981" },
    { name: "Remaining", value: 100 - workProgress, fill: "#E5E7EB" },
  ];

  const timeData = [
    { name: "AI Saved", hours: aiTimeSaved },
    { name: "Manual", hours: Math.floor(Math.random() * 20) + 10 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className=" font-[700] text-2xl text-gray-900 mb-1 line-clamp-1">
            {project?.projectName || "Untitled Project"}
          </h1>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {project?.projectDescription || "No description available"}
          </p>
        </div>
        <IconButton size="small" className="text-gray-400 hover:text-gray-600">
          <MoreVert />
        </IconButton>
      </div>

      {/* GitHub Link */}
      {project?.githubRepoLink && (
        <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
          <GitHub className="w-4 h-4 text-gray-600 mr-2" />
          <a
            href={project.githubRepoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 truncate"
          >
            {project.githubRepoLink.replace("https://github.com/", "")}
          </a>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Work Progress Chart */}
        <div className="text-center">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Work Progress
          </p>
          <div className="relative w-16 h-16 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={32}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {workProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Time Saved Chart */}
        <div className="text-center">
          <p className="text-xs font-medium text-gray-600 mb-2">
            AI Time Saved
          </p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <Bar dataKey="hours" fill="#3B82F6" radius={2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-xs font-bold text-green-600">
            {aiTimeSaved} hours saved
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center">
          <Code className="w-3 h-3 mr-1" />
          <span>React</span>
        </div>
        <div className="flex items-center">
          <Star className="w-3 h-3 mr-1" />
          <span>{Math.floor(Math.random() * 50) + 10}</span>
        </div>
        <div className="flex items-center">
          <AccessTime className="w-3 h-3 mr-1" />
          <span>Updated {Math.floor(Math.random() * 7) + 1}d ago</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">
            Overall Progress
          </span>
          <span className="text-xs font-bold text-gray-800">
            {workProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${workProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCreateProjectClick(project._id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          View Details
        </button>
        <button className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors">
          <Visibility className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Activity Feed Component
function ActivityFeed() {
  const activities = [
    {
      icon: "📝",
      user: "Alex Johnson",
      action: "updated the requirements document for",
      project: "Project Management App",
      time: "2 hours ago",
      color: "bg-blue-50",
    },
    {
      icon: "✅",
      user: "Sam Wilson",
      action: "completed the user authentication module",
      project: "",
      time: "Yesterday, 4:30 PM",
      color: "bg-green-50",
    },
    {
      icon: "👥",
      user: "You",
      action: "added Taylor Chen to the",
      project: "Mobile App Phase 1",
      time: "April 12, 2024",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Button size="small" className="text-blue-600 hover:text-blue-800">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-lg`}
            >
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{activity.user}</span>{" "}
                {activity.action}
                {activity.project && (
                  <span className="font-semibold"> {activity.project}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
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

  // Loading state
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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
    <div className=" bg-gray-50">
      <div className=" mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
        </div>

        {isAuthenticated && githubData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Active Projects"
                value={projects.length}
                icon={Assignment}
                trend="+12% from last month"
                color="primary"
              />
              <StatCard
                label="Projects in Draft"
                value={Math.floor(projects.length * 0.3)}
                icon={Code}
                trend="+5% from last week"
                color="warning"
              />
              <StatCard
                label="AI Time Saved"
                value={`${projects.length * 15}h`}
                icon={Speed}
                trend="+28% efficiency"
                color="success"
              />
              <StatCard
                label="Total Commits"
                value={projects.length * 42}
                icon={Timeline}
                trend="+8% this week"
                color="info"
              />
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    My Projects
                  </h2>
                  <p className="text-gray-600">
                    Manage and track your project progress
                  </p>
                </div>
                <Button className="mt-4 sm:mt-0 text-blue-600 hover:text-blue-800">
                  View All →
                </Button>
              </div>

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Assignment className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first project
                  </p>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateProjectClick}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Project
                  </Button>
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <ActivityFeed />
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
