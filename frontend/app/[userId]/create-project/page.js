"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateProjectMutation,
  useGetGitHubAuthStatusQuery,
  useGetProjectsQuery,
  useGetUserGithubReposQuery,
} from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useGetDeveloperProjectsQuery } from "@/features/developerApiSlice";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ProjectsPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    projectDescription: "",
    githubRepoLink: "",
  });
  const [selectedRepo, setSelectedRepo] = useState("");
  const [createNewRepoOption, setCreateNewRepoOption] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: userData } = useGetUserAndGithubDataQuery(userId);

  const user_role = userData?.user?.role;

  const { data: developerProjects } = useGetDeveloperProjectsQuery(userId);

  // RTK Query hooks
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsIsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery(userId, { skip: !userId });

  const [
    createProjectMutation,
    {
      isLoading: createProjectLoading,
      isSuccess: createProjectSuccess,
      isError: createProjectIsError,
      error: createProjectError,
    },
  ] = useCreateProjectMutation();

  const {
    data: githubAuthStatusData,
    isLoading: githubAuthStatusLoading,
    refetch: refetchGithubAuthStatus,
  } = useGetGitHubAuthStatusQuery();

  const {
    data: githubReposData,
    isLoading: githubReposLoading,
    refetch: refetchGithubRepos,
  } = useGetUserGithubReposQuery(undefined, {
    skip: !showDialog || !githubAuthStatusData?.isAuthenticated,
  });

  const projects =
    user_role === "manager"
      ? projectsData?.projects || []
      : developerProjects || [];

  const githubAuthStatus = githubAuthStatusData?.isAuthenticated || false;

  useEffect(() => {
    if (createProjectSuccess) {
      setShowDialog(false);
      refetchProjects();
      resetForm();
    }
  }, [createProjectSuccess, refetchProjects]);

  const resetForm = () => {
    setNewProject({
      projectName: "",
      projectDescription: "",
      githubRepoLink: "",
    });
    setNewRepoName("");
    setSelectedRepo("");
    setCreateNewRepoOption(false);
  };

  // Handle project name click to navigate to details
  const handleProjectClick = (projectId) => {
    setIsNavigating(true);
    router.push(`/${userId}/create-project/${projectId}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProjects(projects.map((project) => project._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (id, e) => {
    e.stopPropagation(); // Prevent triggering row click when selecting checkbox
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((projectId) => projectId !== id)
        : [...prevSelected, id]
    );
  };

  const handleOpenDialog = async () => {
    resetForm();
    await refetchGithubAuthStatus();
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleRepoSelectChange = (e) => {
    setSelectedRepo(e.target.value);
    setNewProject((prev) => ({ ...prev, githubRepoLink: e.target.value }));
  };

  const handleCreateNewRepoToggle = (e) => {
    setCreateNewRepoOption(e.target.checked);
    setNewProject((prev) => ({ ...prev, githubRepoLink: "" }));
    setSelectedRepo("");
    setNewRepoName("");
  };

  const handleSubmitProject = async () => {
    if (!newProject.projectName || !newProject.projectDescription) {
      return;
    }

    try {
      const projectPayload = {
        projectName: newProject.projectName,
        projectDescription: newProject.projectDescription,
        githubRepoLink: newProject.githubRepoLink,
        createNewRepo: createNewRepoOption,
        repoName: createNewRepoOption ? newRepoName : undefined,
      };

      await createProjectMutation(projectPayload).unwrap();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  // Extract GitHub URL from project data
  const getGitHubRepo = (project) => {
    return project.githubRepoLink || "N/A";
  };

  // Mock data for charts
  const getWorkingReportChartData = (projectName) => ({
    labels: ["Completed", "In Progress", "Blocked"],
    datasets: [
      {
        data: [
          Math.floor(Math.random() * 50) + 20, // Completed %
          Math.floor(Math.random() * 30) + 10, // In Progress %
          Math.floor(Math.random() * 10) + 5, // Blocked %
        ],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        hoverBackgroundColor: ["#5cb85c", "#ffca28", "#ef5350"],
        borderWidth: 0,
      },
    ],
  });

  const getProjectsRemainingChartData = (projectName) => ({
    labels: ["Remaining Tasks"],
    datasets: [
      {
        label: "Tasks",
        data: [Math.floor(Math.random() * 30) + 5], // Number of remaining tasks
        backgroundColor: "#3F51B5",
        borderColor: "#3F51B5",
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed + "%";
            }
            return label;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false, // Hide x-axis labels
      },
      y: {
        beginAtZero: true,
        display: false, // Hide y-axis labels
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          All Projects
        </h1>
        {user_role === "manager" && (
          <button
            onClick={handleOpenDialog}
            className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/50 group overflow-hidden flex items-center justify-center min-w-[200px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-100 group-hover:scale-110 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create New Project
            </span>
          </button>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button className="ml-auto px-4 py-2 text-blue-600 hover:text-blue-800 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200">
            Clear filters
          </button>
        </div>
      </div>

      {/* Projects Display Area */}
      {projectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : projectsIsError ? (
        <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg shadow-md">
          {projectsError?.data?.message || "Failed to load projects."}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow-md">
          No projects found.{" "}
          {user_role === "manager"
            ? "Create your first project!"
            : "You are not collaborating on any projects yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transform transition-transform duration-200 hover:scale-[1.01]"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Project Details */}
                <div className="p-5 lg:w-2/3">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                      onClick={() => handleProjectClick(project._id)}
                    >
                      {project.projectName}
                    </h3>
                    <div className="flex space-x-2">
                      <a
                        href={getGitHubRepo(project)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Go to GitHub"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.74.08-.725.08-.725 1.204.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">
                    {project.projectDescription}
                  </p>
                  <div className="text-blue-600 text-sm hover:underline truncate">
                    <a
                      href={getGitHubRepo(project)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.74.08-.725.08-.725 1.204.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      {getGitHubRepo(project)}
                    </a>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="lg:w-1/3 p-5 bg-gray-50 flex flex-col sm:flex-row lg:flex-col items-center justify-around border-t lg:border-t-0 lg:border-l border-gray-200">
                  <div className="w-full sm:w-1/2 lg:w-full h-32 mb-4 sm:mb-0 lg:mb-4 flex flex-col items-center">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      Working Report
                    </h4>
                    <div className="relative w-24 h-24">
                      <Doughnut
                        data={getWorkingReportChartData(project.projectName)}
                        options={chartOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
              Create New Project
            </h2>

            {/* Loading Indicator */}
            {(createProjectLoading ||
              githubAuthStatusLoading ||
              githubReposLoading) && (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Error Message */}
            {createProjectIsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                {createProjectError?.data?.message ||
                  "Failed to create project"}
              </div>
            )}

            {/* GitHub Auth Warning */}
            {!githubAuthStatus && !githubAuthStatusLoading && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200">
                You are not authenticated to GitHub. You can still create a
                project, but you won't be able to link to or create GitHub
                repositories directly.
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="projectTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectTitle"
                name="projectName"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={newProject.projectName}
                onChange={handleInputChange}
                placeholder="e.g., Marketing Website Redesign"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={newProject.projectDescription}
                onChange={handleInputChange}
                placeholder="Brief description of your project"
                rows="3"
                required
              ></textarea>
            </div>

            {githubAuthStatus && (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="createNewRepo"
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    checked={createNewRepoOption}
                    onChange={handleCreateNewRepoToggle}
                  />
                  <label
                    htmlFor="createNewRepo"
                    className="ml-2 block text-sm font-medium text-gray-800 cursor-pointer"
                  >
                    Create New Private GitHub Repository
                  </label>
                </div>

                {createNewRepoOption ? (
                  <div>
                    <label
                      htmlFor="newRepoName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Repository Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="newRepoName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="e.g., my-new-project-repo"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="githubRepoSelect"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Select Existing Repository
                    </label>
                    <select
                      id="githubRepoSelect"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={selectedRepo}
                      onChange={handleRepoSelectChange}
                      disabled={
                        githubReposLoading ||
                        !githubReposData?.repos ||
                        githubReposData.repos.length === 0
                      }
                    >
                      <option value="">Select a repository</option>
                      {githubReposLoading ? (
                        <option disabled>Loading repositories...</option>
                      ) : githubReposData?.repos &&
                        githubReposData.repos.length > 0 ? (
                        githubReposData.repos.map((repo) => (
                          <option key={repo.html_url} value={repo.html_url}>
                            {repo.full_name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No private repositories found</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            {!githubAuthStatus && (
              <div className="mb-4">
                <label
                  htmlFor="githubRepoLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  GitHub Repository Link (Optional)
                </label>
                <input
                  type="text"
                  id="githubRepoLink"
                  name="githubRepoLink"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  value={newProject.githubRepoLink}
                  onChange={handleInputChange}
                  placeholder="e.g., https://github.com/your-org/my-project"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseDialog}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProject}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={
                  createProjectLoading ||
                  !newProject.projectName ||
                  !newProject.projectDescription ||
                  (githubAuthStatus && !createNewRepoOption && !selectedRepo) ||
                  (createNewRepoOption && !newRepoName)
                }
              >
                {createProjectLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
