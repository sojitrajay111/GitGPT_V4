"use client";

import React from "react";
import MessageDisplay from "./MessageDisplay";
import { Loader2, Bot } from "lucide-react";

const ChatMessages = ({
  messages,
  messagesContainerRef,
  isLoadingMessages,
  currentChatSessionId,
  isStartingSession,
  project,
  selectedBranch,
  isLoadingBranches,
  isLoadingHistory,
  isSendingMessage,
}) => {
  return (
    <main
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-gray-800"
    >
      <div className="max-w-3xl mx-auto px-4 py-8"> {/* Added max-width and padding for narrower chat */}
        {isLoadingMessages && !messages.length && currentChatSessionId && (
          <div className="flex justify-center items-center h-full pt-10">
            <Loader2 className="animate-spin h-7 w-7 text-gray-400" />
          </div>
        )}
        {!currentChatSessionId &&
          !isLoadingHistory &&
          !isStartingSession &&
          project && (
            <div className="flex items-center justify-center h-full min-h-[60vh] text-center p-8">
              <div className="max-w-md w-full">
                <h3 className="text-2xl font-semibold text-gray-100 mb-4">How can I help you today?</h3>
                <p className="text-gray-400 mb-6">
                  I'm here to assist you with code analysis, debugging, and development questions.
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-gray-900 rounded-lg p-4 text-left hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700">
                    <div className="text-white font-medium mb-1">Code Review</div>
                    <div className="text-gray-400">Analyze and optimize your code</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-left hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700">
                    <div className="text-white font-medium mb-1">Debug Issues</div>
                    <div className="text-gray-400">Find and fix bugs in your code</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-left hover:bg-gray-700 cursor-pointer transition-colors duration-200 border border-gray-700">
                    <div className="text-white font-medium mb-1">Best Practices</div>
                    <div className="text-gray-400">Learn coding best practices</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        {currentChatSessionId &&
          !isLoadingMessages &&
          messages.length === 0 && !isStartingSession && (
            <div className="text-center text-gray-400 pt-20">
              <Bot size={36} className="mx-auto mb-3 opacity-60" />
              <p className="text-sm">This chat is empty</p>
              <p className="text-xs text-gray-500">
                Send a message to start the analysis
              </p>
            </div>
          )}
        {messages.map((msg) => (
          <MessageDisplay
            key={msg._id || `msg-${msg.sender}-${msg.createdAt}`}
            msg={msg}
          />
        ))}
        {isSendingMessage && (
          <div className="flex justify-start mb-4">
            <div className="py-2.5 px-3 rounded-xl bg-gray-700 text-gray-200 shadow-md max-w-sm">
              <div className="flex items-center">
                <Bot size={16} className="mr-2 text-gray-400" />
                <span className="font-medium text-sm">Analyzing...</span>
                <Loader2 className="animate-spin h-4 w-4 ml-2 text-blue-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ChatMessages;
