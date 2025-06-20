"use client";

import React from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInputFooter from "./ChatInputFooter";

const ChatMainArea = ({
  project,
  selectedBranch,
  branches,
  isLoadingBranches,
  isAuthenticated,
  branchFetchError,
  messages,
  messagesContainerRef,
  isLoadingMessages,
  currentChatSessionId,
  isStartingSession,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSendingMessage,
  lastAiResponseForCodePush,
  isPushingCode,
  handleGenerateAndPushCode,
  setIsNewBranchModalOpen,
  setBaseBranch,
  setSelectedBranch,
  repoOwner,
  repoName,
  isLoadingHistory,
}) => {
  return (
    <div className="flex-1 flex flex-col relative bg-gray-800 overflow-x-hidden w-full">
      {/* Chat Header */}
      <ChatHeader
        project={project}
        selectedBranch={selectedBranch}
        branches={branches}
        isLoadingBranches={isLoadingBranches}
        isAuthenticated={isAuthenticated}
        setIsNewBranchModalOpen={setIsNewBranchModalOpen}
        setBaseBranch={setBaseBranch}
        setSelectedBranch={setSelectedBranch}
        repoOwner={repoOwner}
        repoName={repoName}
      />

      {/* Chat Messages */}
      <ChatMessages
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        isLoadingMessages={isLoadingMessages}
        currentChatSessionId={currentChatSessionId}
        isStartingSession={isStartingSession}
        project={project}
        selectedBranch={selectedBranch}
        isLoadingBranches={isLoadingBranches}
        isLoadingHistory={isLoadingHistory}
        isSendingMessage={isSendingMessage}
      />

      {/* Chat Input Footer */}
      <ChatInputFooter
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
        lastAiResponseForCodePush={lastAiResponseForCodePush}
        isPushingCode={isPushingCode}
        handleGenerateAndPushCode={handleGenerateAndPushCode}
        currentChatSessionId={currentChatSessionId}
        project={project}
        selectedBranch={selectedBranch}
        isAuthenticated={isAuthenticated}
        branchFetchError={branchFetchError}
      />
    </div>
  );
};

export default ChatMainArea;
