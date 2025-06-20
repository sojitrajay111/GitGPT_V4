"use client";

import React from "react";
import { Trash2, ShieldAlert } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, handleDeleteConfirmed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-700">
        <div className="text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Delete Chat Session?
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            This will permanently delete this chat and all its messages.
          </p>
        </div>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirmed}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center border border-red-500"
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
