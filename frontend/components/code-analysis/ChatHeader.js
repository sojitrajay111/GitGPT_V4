"use client";

import React from "react";
import { Github, Plus } from "lucide-react";

const ChatHeader = ({
  project,
  selectedBranch,
  branches,
  isLoadingBranches,
  isAuthenticated,
  setIsNewBranchModalOpen,
  setBaseBranch,
  setSelectedBranch,
  repoOwner,
  repoName,
}) => {
  return (
    <header className="bg-gray-800 p-3 shadow-sm z-10 border-b border-gray-700 w-full flex items-center justify-center">
      {/* Removed max-w-3xl here to allow full width alignment */}
      <div className="flex items-center justify-between w-full px-2 sm:px-6 lg:px-8"> {/* Added responsive horizontal padding for clean edges */}
        {/* Removed mr-5 from this div */}
        <div className="flex items-center space-x-3">
          {project && (
            <div className="flex items-center">
              <Github size={18} className="text-gray-400 mr-2" />
              <h1 className="text-base font-medium text-gray-100 truncate max-w-[160px] md:max-w-none ">
                {project.projectName || "Project Analysis"}
              </h1>
            </div>
          )}
        </div>

        {project && (
          <div className="flex items-center space-x-2">
            {!isLoadingBranches && branches?.length > 0 && (
              <select
                value={selectedBranch}
                onChange={(e) => {
                  const newBranch = e.target.value;
                  if (selectedBranch !== newBranch) {
                    setSelectedBranch(newBranch);
                  }
                }}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm min-w-[100px]"
              >
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setBaseBranch(selectedBranch || branches?.[0]?.name || "");
                setIsNewBranchModalOpen(true);
              }}
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
              disabled={
                !branches || branches.length === 0 || !isAuthenticated
              }
            >
              <Plus size={14} className="mr-1" /> Branch
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
