"use client";

import React from "react";
import { Loader2, Send, UploadCloud } from "lucide-react";

const ChatInputFooter = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSendingMessage,
  lastAiResponseForCodePush,
  isPushingCode,
  handleGenerateAndPushCode,
  currentChatSessionId,
  project,
  selectedBranch,
  isAuthenticated,
  branchFetchError,
}) => {
  return (
    <footer className="p-4  w-full flex flex-col items-center">
      <div className="w-full max-w-3xl"> {/* Narrower content area */}
        {lastAiResponseForCodePush && !isPushingCode && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={handleGenerateAndPushCode}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium shadow-md transition-all"
              disabled={
                !currentChatSessionId || isSendingMessage || !isAuthenticated
              }
            >
              <UploadCloud size={14} className="mr-1" /> Push AI Code
            </button>
          </div>
        )}
        {isPushingCode && (
          <div className="mb-2 flex justify-end items-center text-xs text-blue-400 font-medium">
            <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
            Pushing code & creating PR...
          </div>
        )}

        <div className="flex items-center bg-gray-700 rounded-xl p-2 border border-gray-600 shadow-sm">
          <textarea // Changed from input to textarea
            rows="1" // Start with one row
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              // Auto-resize textarea height
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isSendingMessage) { // Send on Enter, allow Shift+Enter for new line
                e.preventDefault(); // Prevent default Enter key behavior (new line)
                handleSendMessage();
              }
            }}
            placeholder={
              currentChatSessionId
                ? "Send a message..."
                : "Select or start a new chat"
            }
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-100 focus:outline-none placeholder-gray-400 resize-none overflow-y-hidden max-h-24" // Added resize-none and max-h-24
            disabled={
              isSendingMessage ||
              !project ||
              !selectedBranch ||
              !currentChatSessionId ||
              !isAuthenticated ||
              !!branchFetchError
            }
          />
          <button
            onClick={handleSendMessage}
            disabled={
              isSendingMessage ||
              !inputMessage.trim() ||
              !project ||
              !selectedBranch ||
              !currentChatSessionId ||
              !isAuthenticated ||
              !!branchFetchError
            }
            className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 shadow-md transition-all"
          >
            {isSendingMessage ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <div className="text-xs mt-2 text-gray-500 text-center space-y-0.5">
          {!project && (
            <p className="text-red-400">Project not loaded</p>
          )}
          {project && !selectedBranch && (
            <p className="text-amber-400">Select a branch to start a chat</p>
          )}
          {project && !isAuthenticated && (
            <p className="text-red-400">
              Your GitHub account is not authenticated. Please link your GitHub
              account to use code analysis features.
            </p>
          )}
          {branchFetchError && (
            <p className="text-red-400">{branchFetchError}</p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default ChatInputFooter;
