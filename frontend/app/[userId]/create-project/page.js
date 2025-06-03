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

  // const projects = projectsData?.projects || [];

  const projects =
    user_role === "manager"
      ? projectsData?.projects || []
      : developerProjects || [];
  console.log("Projects:", projects);
  const githubAuthStatus = githubAuthStatusData?.isAuthenticated || false;

  useEffect(() => {
    if (createProjectSuccess) {
      setShowDialog(false);
      refetchProjects();
      resetForm();
    }
  }, [createProjectSuccess]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
        {user_role === "manager" ? (
          <button
            onClick={handleOpenDialog}
            className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 group overflow-hidden"
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
        ) : null}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <button className="ml-auto px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
            Clear filters
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={
                    selectedProjects.length === projects.length &&
                    projects.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GitHub Repo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectsLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : projectsIsError ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-red-500">
                  {projectsError?.data?.message || "Failed to load projects"}
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No projects found. Create your first project!
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProjectClick(project._id)}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedProjects.includes(project._id)}
                      onChange={(e) => handleSelectProject(project._id, e)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                      {project.projectName}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-blue-600 hover:underline max-w-xs truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={getGitHubRepo(project)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getGitHubRepo(project)}
                    </a>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-400 hover:text-gray-700">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-700">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Project Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
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
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {createProjectError?.data?.message ||
                  "Failed to create project"}
              </div>
            )}

            {/* GitHub Auth Warning */}
            {!githubAuthStatus && !githubAuthStatusLoading && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
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
                Project Title
              </label>
              <input
                type="text"
                id="projectTitle"
                name="projectName"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProject.projectName}
                onChange={handleInputChange}
                placeholder="e.g., Marketing Website Redesign"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Description
              </label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProject.projectDescription}
                onChange={handleInputChange}
                placeholder="Brief description of your project"
                rows="3"
              ></textarea>
            </div>

            {githubAuthStatus && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="createNewRepo"
                    className="h-4 w-4 text-blue-600 rounded"
                    checked={createNewRepoOption}
                    onChange={handleCreateNewRepoToggle}
                  />
                  <label
                    htmlFor="createNewRepo"
                    className="ml-2 block text-sm font-medium text-gray-700"
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
                      New Repository Name
                    </label>
                    <input
                      type="text"
                      id="newRepoName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="e.g., my-new-project"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  GitHub Repository (Optional)
                </label>
                <input
                  type="text"
                  id="githubRepoLink"
                  name="githubRepoLink"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.githubRepoLink}
                  onChange={handleInputChange}
                  placeholder="e.g., github.com/your-org/my-project"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDialog}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProject}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
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
