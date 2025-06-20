"use client";

import React from "react";
import { Loader2, Plus, X, Menu, Trash2, MessageSquare, ArrowLeft, ChevronLeft } from "lucide-react"; // Added ChevronLeft for the toggle icon
import { useRouter } from "next/navigation";

const ChatSidebar = ({
  isOpen,
  setIsOpen, // Corrected: Using setIsOpen directly from props
  sessionsData,
  isLoadingHistory,
  currentChatSessionId,
  handleSessionChange,
  openDeleteModal,
  isStartingSession,
  project,
  selectedBranch,
  isAuthenticated,
  handleGoBack,
}) => {
  const router = useRouter();

  return (
    <div
      className={`fixed md:relative z-20 h-full bg-gray-900 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[65px]"}
        ${isOpen ? "block" : "hidden"} md:flex`} // Simplified visibility for mobile
    >
      {/* Sidebar Content (visible when open) */}
      {isOpen ? (
        <>
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-sm font-normal text-gray-500 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-500" />
              GitGPT
            </h2>
            {/* Toggle button for open state (closes sidebar) */}
            <button
              onClick={() => setIsOpen(false)} // This button explicitly closes
              className="p-1 rounded-md text-gray-400 hover:bg-gray-700"
              title="Collapse Sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="px-3 py-2">
            <button
              onClick={() => handleSessionChange(null)}
              className="w-full flex items-center justify-center p-2 rounded-md text-sm font-normal border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors duration-150"
              disabled={
                isStartingSession ||
                !project ||
                !selectedBranch ||
                !isAuthenticated
              }
            >
              {isStartingSession ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              New Chat
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full pt-10">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
              </div>
            ) : sessionsData?.sessions?.length > 0 ? (
              sessionsData.sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() =>
                    currentChatSessionId !== session._id &&
                    handleSessionChange(session._id)
                  }
                  className={`p-2 rounded-md cursor-pointer transition-colors duration-150 flex justify-between items-center group
                    ${
                      currentChatSessionId === session._id
                        ? "bg-gray-700 text-gray-100"
                        : "text-gray-200 hover:bg-gray-800"
                    }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="font-normal text-sm truncate">
                      {session.title || `Session ...${session._id.slice(-6)}`}
                    </p>
                    <p className="text-xs mt-0.5 opacity-70 truncate text-gray-400">
                      {session.selectedBranch || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(session._id);
                    }}
                    className={`p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600
                      ${
                        currentChatSessionId === session._id
                          ? "text-gray-300 hover:bg-gray-600"
                          : "text-gray-400"
                      }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">
                No chat history
              </p>
            )}
          </div>
          <div className="p-3 border-t border-gray-800">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center p-2 rounded-md text-sm font-normal bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors duration-150"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Projects
            </button>
          </div>
        </>
      ) : (
        // Collapsed sidebar (only icons visible)
        <div className="flex flex-col items-center py-4 h-full space-y-4">
          {/* GitGPT icon (also acts as expand button) */}
          <button
            onClick={() => setIsOpen(true)} // This button explicitly opens
            className="p-2 rounded-md hover:bg-gray-800"
            title="Expand Sidebar"
          >
            <MessageSquare size={20} className="text-gray-300" /> {/* GitGPT logo/icon */}
          </button>
          {/* New Chat icon */}
          <button
            onClick={() => handleSessionChange(null)}
            className="p-2 rounded-md hover:bg-gray-800"
            title="New Chat"
            disabled={
              isStartingSession ||
              !project ||
              !selectedBranch ||
              !isAuthenticated
            }
          >
            <Plus size={20} className="text-gray-300" />
          </button>
          <div className="flex-grow" /> {/* Spacer */}
          {/* Back to Projects icon */}
          <button
            onClick={handleGoBack}
            className="p-2 rounded-md hover:bg-gray-800"
            title="Back to Projects"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
