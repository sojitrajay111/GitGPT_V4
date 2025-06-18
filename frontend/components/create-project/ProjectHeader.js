// components/ProjectHeader.js
import React from "react";

const ProjectHeader = ({ currentTheme, userRole, onOpenDialog }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1
        className={`text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-0
          ${currentTheme === "dark" ? "text-white" : "text-gray-900"}
        `}
      >
        All Projects
      </h1>
      {userRole === "manager" && (
        <button
          onClick={onOpenDialog}
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
  );
};

export default ProjectHeader;
