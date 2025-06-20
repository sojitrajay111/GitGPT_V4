"use client";

import React from "react";
import { Loader2, GitFork, X } from "lucide-react";

const NewBranchModal = ({
  isOpen,
  onClose,
  newBranchName,
  setNewBranchName,
  baseBranch,
  setBaseBranch,
  branches,
  isAuthenticated,
  isCreatingBranch,
  handleCreateNewBranch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Create New Branch
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Base Branch
            </label>
            <select
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {branches?.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              New Branch Name
            </label>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) =>
                setNewBranchName(
                  e.target.value.replace(/[^a-zA-Z0-9-._/]/g, "-").toLowerCase()
                )
              }
              placeholder="feature/new-login"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateNewBranch}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center border border-blue-500"
            disabled={
              !newBranchName.trim() || !baseBranch.trim() || !isAuthenticated
            }
          >
            {isCreatingBranch ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
            ) : (
              <GitFork size={14} className="mr-1.5" />
            )}
            Create Branch
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBranchModal;
