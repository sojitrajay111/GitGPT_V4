"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateProjectMutation,
  useGetGitHubAuthStatusQuery,
  useGetProjectsQuery,
  useGetUserGithubReposQuery,
} from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { useGetDeveloperProjectsQuery } from "@/features/developerApiSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice";

// Import the new components
import ProjectHeader from "@/components/create-project/ProjectHeader";
import ProjectFilterSearch from "@/components/create-project/ProjectFilterSearch";
import ProjectCard from "@/components/create-project/ProjectCard";
import NewProjectDialog from "@/components/create-project/NewProjectDialog";

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

  // Fetch user data and theme
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const { data: themeData } = useGetThemeQuery(userId);

  const user_role = userData?.user?.role;
  const currentTheme = themeData?.theme || "light";

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

  const projects = projectsData?.projects || [];

  const githubAuthStatus = githubAuthStatusData?.isAuthenticated || false;

  // Callback to reset the new project form
  const resetForm = useCallback(() => {
    setNewProject({
      projectName: "",
      projectDescription: "",
      githubRepoLink: "",
    });
    setNewRepoName("");
    setSelectedRepo("");
    setCreateNewRepoOption(false);
  }, []); // Empty dependency array means this function is stable

  useEffect(() => {
    if (createProjectSuccess) {
      setShowDialog(false);
      refetchProjects();
      resetForm(); // Use the memoized resetForm
    }
  }, [createProjectSuccess, refetchProjects, resetForm]);

  // Apply dark/light theme classes to the body
  useEffect(() => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  // Handle project name click to navigate to details
  const handleProjectClick = (projectId) => {
    setIsNavigating(true);
    router.push(`/${userId}/create-project/${projectId}`);
  };

  // Although these handlers are not used after component extraction, they are kept for completeness if future features need them.
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
      let userMessage = "Failed to create project. Please try again.";
      if (err?.data?.message) {
        userMessage = err.data.message;
        // Check for GitHub repo name conflict
        if (
          err.data.message.includes("name already exists on this account") ||
          (Array.isArray(err.data.details) &&
            err.data.details.some(
              (d) =>
                d.field === "name" &&
                d.message &&
                d.message.includes("already exists")
            ))
        ) {
          userMessage =
            "A GitHub repository with this name already exists. Please choose a different name.";
        }
      }
      alert(userMessage);
    }
  };

  return (
    <div
      className={`min-h-screen font-inter transition-colors duration-300
      ${
        currentTheme === "dark"
          ? "bg-black text-gray-100"
          : "bg-gray-50 text-gray-900"
      }
    `}
    >
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        <ProjectHeader
          currentTheme={currentTheme}
          userRole={user_role}
          onOpenDialog={handleOpenDialog}
        />

        <ProjectFilterSearch currentTheme={currentTheme} />

        {/* Projects Display Area */}
        {projectsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : projectsIsError ? (
          <div
            className={`text-center p-8 rounded-lg shadow-md
            ${
              currentTheme === "dark"
                ? "bg-red-900 text-red-300"
                : "bg-red-50 text-red-500"
            }
          `}
          >
            {projectsError?.data?.message || "Failed to load projects."}
          </div>
        ) : projects.length === 0 ? (
          <div
            className={`text-center p-8 rounded-lg shadow-md
            ${
              currentTheme === "dark"
                ? "bg-[#161717] text-gray-400"
                : "bg-white text-gray-500"
            }
          `}
          >
            No projects found.{" "}
            {user_role === "manager"
              ? "Create your first project!"
              : "You are not collaborating on any projects yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                currentTheme={currentTheme}
                onProjectClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </div>

      <NewProjectDialog
        showDialog={showDialog}
        onCloseDialog={handleCloseDialog}
        newProject={newProject}
        onInputChange={handleInputChange}
        onSubmitProject={handleSubmitProject}
        createProjectLoading={createProjectLoading}
        createProjectIsError={createProjectIsError}
        createProjectError={createProjectError}
        githubAuthStatus={githubAuthStatus}
        githubAuthStatusLoading={githubAuthStatusLoading}
        githubReposLoading={githubReposLoading}
        githubReposData={githubReposData}
        selectedRepo={selectedRepo}
        onRepoSelectChange={handleRepoSelectChange}
        createNewRepoOption={createNewRepoOption}
        onCreateNewRepoToggle={handleCreateNewRepoToggle}
        newRepoName={newRepoName}
        onNewRepoNameChange={(e) => setNewRepoName(e.target.value)}
        currentTheme={currentTheme}
      />
    </div>
  );
}
