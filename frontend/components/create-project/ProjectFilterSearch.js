// components/ProjectFilterSearch.js
import React from "react";

const ProjectFilterSearch = ({ currentTheme }) => {
  return (
    <div
      className={`p-4 sm:p-6 rounded-xl shadow-md border mb-6
        ${
          currentTheme === "dark"
            ? "bg-[#161717] border-gray-700"
            : "bg-white border-gray-200"
        }
      `}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search projects..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
              ${
                currentTheme === "dark"
                  ? "bg-[#2f2f2f] border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }
            `}
          />
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2
              ${currentTheme === "dark" ? "text-gray-400" : "text-gray-400"}
            `}
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
        <button
          className={`ml-auto px-4 py-2 font-medium rounded-lg transition-colors duration-200
            ${
              currentTheme === "dark"
                ? "text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            }
          `}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default ProjectFilterSearch;
