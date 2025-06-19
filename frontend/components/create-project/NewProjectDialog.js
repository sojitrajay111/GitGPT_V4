// components/NewProjectDialog.js
import React from "react";

const NewProjectDialog = ({
  showDialog,
  onCloseDialog,
  newProject,
  onInputChange,
  onSubmitProject,
  createProjectLoading,
  createProjectIsError,
  createProjectError,
  githubAuthStatus,
  githubAuthStatusLoading,
  githubReposLoading,
  githubReposData,
  selectedRepo,
  onRepoSelectChange,
  createNewRepoOption,
  onCreateNewRepoToggle,
  newRepoName,
  onNewRepoNameChange,
  currentTheme,
}) => {
  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100
          ${
            currentTheme === "dark"
              ? "bg-gray-700 text-gray-100"
              : "bg-white text-gray-900"
          }
        `}
      >
        <h2
          className={`text-2xl font-bold mb-6 text-center
            ${currentTheme === "dark" ? "text-white" : "text-gray-900"}
          `}
        >
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
          <div
            className={`mb-4 p-3 rounded-lg border
              ${
                currentTheme === "dark"
                  ? "bg-red-900 text-red-300 border-red-700"
                  : "bg-red-100 text-red-700 border-red-200"
              }
            `}
          >
            {createProjectError?.data?.message || "Failed to create project"}
          </div>
        )}

        {/* GitHub Auth Warning */}
        {!githubAuthStatus && !githubAuthStatusLoading && (
          <div
            className={`mb-4 p-3 rounded-lg border
              ${
                currentTheme === "dark"
                  ? "bg-yellow-900 text-yellow-300 border-yellow-700"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }
            `}
          >
            You are not authenticated to GitHub. You can still create a project,
            but you won't be able to link to or create GitHub repositories
            directly.
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="projectTitle"
            className={`block text-sm font-medium mb-2
              ${currentTheme === "dark" ? "text-gray-200" : "text-gray-700"}
            `}
          >
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectTitle"
            name="projectName"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
              ${
                currentTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }
            `}
            value={newProject.projectName}
            onChange={onInputChange}
            placeholder="e.g., Marketing Website Redesign"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="projectDescription"
            className={`block text-sm font-medium mb-2
              ${currentTheme === "dark" ? "text-gray-200" : "text-gray-700"}
            `}
          >
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
              ${
                currentTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }
            `}
            value={newProject.projectDescription}
            onChange={onInputChange}
            placeholder="Brief description of your project"
            rows="3"
            required
          ></textarea>
        </div>

        {githubAuthStatus && (
          <div
            className={`mb-4 p-4 rounded-lg border
              ${
                currentTheme === "dark"
                  ? "bg-gray-800 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }
            `}
          >
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="createNewRepo"
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                checked={createNewRepoOption}
                onChange={onCreateNewRepoToggle}
              />
              <label
                htmlFor="createNewRepo"
                className={`ml-2 block text-sm font-medium cursor-pointer
                  ${currentTheme === "dark" ? "text-gray-200" : "text-gray-800"}
                `}
              >
                Create New Private GitHub Repository
              </label>
            </div>

            {createNewRepoOption ? (
              <div>
                <label
                  htmlFor="newRepoName"
                  className={`block text-sm font-medium mb-2
                    ${
                      currentTheme === "dark"
                        ? "text-gray-200"
                        : "text-gray-700"
                    }
                  `}
                >
                  New Repository Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="newRepoName"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
                    ${
                      currentTheme === "dark"
                        ? "bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }
                  `}
                  value={newRepoName}
                  onChange={onNewRepoNameChange}
                  placeholder="e.g., my-new-project-repo"
                  required
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="githubRepoSelect"
                  className={`block text-sm font-medium mb-2
                    ${
                      currentTheme === "dark"
                        ? "text-gray-200"
                        : "text-gray-700"
                    }
                  `}
                >
                  Select Existing Repository
                </label>
                <select
                  id="githubRepoSelect"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      currentTheme === "dark"
                        ? "bg-gray-900 border-gray-600 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }
                  `}
                  value={selectedRepo}
                  onChange={onRepoSelectChange}
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
              className={`block text-sm font-medium mb-2
                ${currentTheme === "dark" ? "text-gray-200" : "text-gray-700"}
              `}
            >
              GitHub Repository Link (Optional)
            </label>
            <input
              type="text"
              id="githubRepoLink"
              name="githubRepoLink"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
                ${
                  currentTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }
              `}
              value={newProject.githubRepoLink}
              onChange={onInputChange}
              placeholder="e.g., https://github.com/your-org/my-project"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCloseDialog}
            className={`px-5 py-2 border rounded-lg font-medium transition-colors duration-200
              ${
                currentTheme === "dark"
                  ? "border-gray-600 text-gray-200 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            Cancel
          </button>
          <button
            onClick={onSubmitProject}
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
  );
};

export default NewProjectDialog;
