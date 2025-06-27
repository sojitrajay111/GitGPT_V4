"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { MessageSquare, X } from "lucide-react"; // Common icons

// RTK Query Hooks
import { useGetProjectByIdQuery } from "@/features/projectApiSlice";
import {
  useCreateGitHubBranchMutation,
  useGetGitHubRepoBranchesQuery,
  useGetGitHubStatusQuery,
} from "@/features/githubApiSlice";
import {
  useGetCodeAnalysisMessagesQuery,
  useGetCodeAnalysisSessionsQuery,
  usePushCodeAndCreatePRMutation,
  useSendCodeAnalysisMessageMutation,
  useStartCodeAnalysisSessionMutation,
  useDeleteCodeAnalysisSessionMutation,
} from "@/features/codeAnalysisApiSlice";

// Extracted Components
import LoadingScreen from "@/components/common/LoadingScreen";
import ErrorScreen from "@/components/common/ErrorScreen";
import ChatSidebar from "@/components/code-analysis/ChatSidebar";
import ChatMainArea from "@/components/code-analysis/ChatMainArea";
import NewBranchModal from "@/components/code-analysis/NewBranchModal";
import DeleteConfirmationModal from "@/components/code-analysis/DeleteConfirmationModal";

const CodeAnalysisPage = () => {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId;
  const loggedInUserId = params.userId; // Assuming params.userId is the ID of the currently logged-in user.

  // --- State Management ---
  const [githubData, setGithubData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Current user's GitHub auth status
  const [project, setProject] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchFetchError, setBranchFetchError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [baseBranch, setBaseBranch] = useState("");
  const [lastAiResponseForCodePush, setLastAiResponseForCodePush] =
    useState(null);
  const [currentChatSessionId, setCurrentChatSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDeleteId, setSessionToDeleteId] = useState(null);

  // --- RTK Query Hooks ---
  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const { data: statusResponse } = useGetGitHubStatusQuery(loggedInUserId, {
    skip: !loggedInUserId,
  });

  const repolink = projectData?.project?.githubRepoLink;
  let repoName = "";
  let repoOwner = "";
  if (repolink && typeof repolink === "string" && repolink.startsWith("http")) {
    try {
      const url = new URL(repolink);
      const pathParts = url.pathname.split("/");
      if (pathParts.length >= 3) {
        repoOwner = pathParts[1];
        repoName = pathParts[2].replace(/\.git$/, "");
      }
    } catch (e) {
      console.error("Invalid project GitHub URL:", repolink, e);
    }
  }

  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useGetGitHubRepoBranchesQuery(
    { owner: repoOwner, repo: repoName },
    { skip: !repoOwner || !repoName || !isAuthenticated }
  );

  const [
    createGitHubBranch,
    { isLoading: isCreatingBranch, error: createBranchError },
  ] = useCreateGitHubBranchMutation();

  const [
    startCodeAnalysisSession,
    { isLoading: isStartingSession, error: startSessionError },
  ] = useStartCodeAnalysisSessionMutation();

  const {
    data: sessionsData,
    isLoading: isLoadingHistory,
    error: sessionsError,
  } = useGetCodeAnalysisSessionsQuery(projectId, {
    skip: !projectId || !loggedInUserId,
  });

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useGetCodeAnalysisMessagesQuery(currentChatSessionId, {
    skip: !currentChatSessionId,
  });

  const [
    sendCodeAnalysisMessage,
    { isLoading: isSendingMessage, error: sendMessageError },
  ] = useSendCodeAnalysisMessageMutation();

  const [
    pushCodeAndCreatePR,
    { isLoading: isPushingCode, error: pushCodeError },
  ] = usePushCodeAndCreatePRMutation();

  const [
    deleteCodeAnalysisSession,
    { isLoading: isDeletingSession, error: deleteSessionError },
  ] = useDeleteCodeAnalysisSessionMutation();

  // --- Effects ---
  useEffect(() => {
    if (statusResponse?.success) {
      setIsAuthenticated(statusResponse.isAuthenticated);
      if (statusResponse.isAuthenticated && statusResponse.data) {
        setGithubData(statusResponse.data);
      } else {
        setGithubData(null);
      }
    }
  }, [statusResponse]);

  useEffect(() => {
    if (projectData?.project) {
      setProject(projectData.project);
    }
  }, [projectData]);

  useEffect(() => {
    if (branchesData?.branches && Array.isArray(branchesData.branches)) {
      const sortedBranchesByName = [...branchesData.branches]
        .filter((branch) => branch && typeof branch.name === "string")
        .sort((a, b) => a.name.localeCompare(b.name));
      setBranches(sortedBranchesByName);
      setBranchFetchError(null);

      if (sortedBranchesByName.length > 0 && !selectedBranch) {
        const mainBranch = sortedBranchesByName.find((b) => b.name === "main");
        const defaultBranchName = mainBranch
          ? mainBranch.name
          : sortedBranchesByName[0].name;
        setSelectedBranch(defaultBranchName);
        if (!baseBranch) {
          setBaseBranch(defaultBranchName);
        }
      } else if (sortedBranchesByName.length === 0) {
        setSelectedBranch("");
        setBaseBranch("");
      }
    } else if (branchesError) {
      console.error("Error fetching branches:", branchesError);
      let errorMessage = "Failed to load branches. ";
      if (branchesError.data?.message) {
        errorMessage += branchesError.data.message;
      } else if (branchesError.message) {
        errorMessage += branchesError.message;
      } else if (branchesError.status) {
        errorMessage += `Status: ${branchesError.status}.`;
        if (branchesError.status === 404) {
          errorMessage +=
            " The repository might not exist, or you might not have access to it.";
        } else if (branchesError.status === 403) {
          errorMessage +=
            " You do not have permission to access this repository.";
        }
      } else {
        errorMessage += "An unknown error occurred.";
      }
      errorMessage +=
        " Please ensure you are a collaborator on the GitHub repository and your GitHub account is linked.";
      setBranchFetchError(errorMessage);
      setBranches([]);
      setSelectedBranch("");
      setBaseBranch("");
    }
  }, [branchesData, branchesError, selectedBranch, baseBranch]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    } else if (currentChatSessionId && !isLoadingMessages && !messagesError) {
      setMessages([]);
    }
    if (messagesError) {
      console.error(
        "Error fetching messages for session:",
        currentChatSessionId,
        messagesError
      );
      setMessages([]);
    }
  }, [messagesData, messagesError, currentChatSessionId, isLoadingMessages]);

  const messagesContainerRef = useRef(null); // Ref for scrolling

  // Effect to scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 20;
      if (isScrolledToBottom || messages.length <= 2) {
        // Auto-scroll if near bottom or few messages
        messagesContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  // --- Handlers ---
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSessionChange = useCallback(
    async (sessionId = null) => {
      setLastAiResponseForCodePush(null);
      if (sessionId) {
        if (currentChatSessionId !== sessionId) {
          setCurrentChatSessionId(sessionId);
        }
      } else {
        if (
          !project ||
          !selectedBranch ||
          !isAuthenticated ||
          !loggedInUserId ||
          !repoOwner ||
          !repoName
        ) {
          console.error("Cannot start new session: Missing critical data.", {
            projectExists: !!project,
            selectedBranch,
            isAuthenticated,
            loggedInUserId,
            repoOwner,
            repoName,
          });
          return;
        }
        try {
          const result = await startCodeAnalysisSession({
            projectId: projectId,
            githubRepoName: `${repoOwner}/${repoName}`,
            selectedBranch,
          }).unwrap();
          if (result.session?._id) {
            setCurrentChatSessionId(result.session._id);
          } else {
            console.error("New session started but no ID returned:", result);
          }
        } catch (err) {
          console.error(
            "Failed to start new session:",
            err.data?.message || err.message || err
          );
        }
      }
    },
    [
      project,
      selectedBranch,
      startCodeAnalysisSession,
      isAuthenticated,
      loggedInUserId,
      projectId,
      repoOwner,
      repoName,
      currentChatSessionId,
    ]
  );

  // Effect to automatically select or start a session
  useEffect(() => {
    if (
      !isLoadingProject &&
      !isLoadingBranches &&
      !isStartingSession &&
      project &&
      selectedBranch &&
      sessionsData?.sessions &&
      isAuthenticated &&
      loggedInUserId &&
      repoOwner &&
      repoName
    ) {
      if (!currentChatSessionId) {
        const existingSessionForBranch = sessionsData.sessions.find(
          (session) =>
            session.projectId === projectId &&
            session.selectedBranch === selectedBranch &&
            session.githubRepoName === `${repoOwner}/${repoName}` &&
            session.userId === loggedInUserId
        );
        if (existingSessionForBranch) {
          setCurrentChatSessionId(existingSessionForBranch._id);
        } else if (!isStartingSession) {
          handleSessionChange(); // Start a new session if none exists for this project/branch/user
        }
      }
    }
  }, [
    currentChatSessionId,
    project,
    selectedBranch,
    isLoadingProject,
    isLoadingBranches,
    isStartingSession,
    sessionsData,
    handleSessionChange,
    projectId,
    isAuthenticated,
    loggedInUserId,
    repoOwner,
    repoName,
  ]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatSessionId || isSendingMessage)
      return;
    const userMessageText = inputMessage;
    setInputMessage("");
    const tempUserMessage = {
      _id: `temp-user-${Date.now()}`,
      sessionId: currentChatSessionId,
      sender: "user",
      text: userMessageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setLastAiResponseForCodePush(null);

    try {
      const result = await sendCodeAnalysisMessage({
        sessionId: currentChatSessionId,
        text: userMessageText,
      }).unwrap();
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMessage._id));
      if (result.aiMessage?.text) {
        setLastAiResponseForCodePush(result.aiMessage.text);
      }
    } catch (error) {
      console.error("Error sending code analysis message:", error);
      const message =
        error?.message ||
        (typeof error === "string" ? error : null) ||
        "Internal server error";
      setMessages((prev) => [
        ...prev,
        {
          _id: `error-${Date.now()}`,
          sessionId: currentChatSessionId,
          sender: "system",
          text: message,
          isError: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleCreateNewBranch = async () => {
    if (
      !project ||
      !newBranchName.trim() ||
      !baseBranch.trim() ||
      !isAuthenticated ||
      !repoOwner ||
      !repoName
    ) {
      console.error("Missing data for creating branch.");
      return;
    }
    try {
      const result = await createGitHubBranch({
        owner: repoOwner,
        repo: repoName,
        newBranchName: newBranchName.trim(),
        baseBranch,
      }).unwrap();
      const createdBranchName =
        result.branch?.name ||
        result.branch?.ref?.split("/").pop() ||
        newBranchName.trim();
      setSelectedBranch(createdBranchName);
      setNewBranchName("");
      setIsNewBranchModalOpen(false);
      setCurrentChatSessionId(null); // Force new session for new branch
      const systemMessage = {
        _id: `system-branch-${Date.now()}`,
        text: `Successfully created branch: ${createdBranchName} (from ${baseBranch}). Switched to this branch.`,
        sender: "system",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error("Failed to create branch:", err);
      const systemErrorMessage = {
        _id: `error-branch-create-${Date.now()}`,
        sender: "system",
        text: `Failed to create branch: ${
          err.data?.message || err.message || "Unknown error"
        }`,
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemErrorMessage]);
    }
  };

  const handleGenerateAndPushCode = async () => {
    if (
      !project ||
      !selectedBranch ||
      !lastAiResponseForCodePush ||
      !currentChatSessionId ||
      !isAuthenticated ||
      !repoOwner ||
      !repoName
    ) {
      console.error("Missing data for code push.");
      return;
    }
    const generatedCodeContent = lastAiResponseForCodePush;
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.sender === "user");
    const commitTitle = `AI changes for: ${
      lastUserMessage?.text?.substring(0, 45) || "code analysis"
    }...`;
    const commitBody = `AI-generated changes based on analysis.\n\nPrompt: ${
      lastUserMessage?.text || "User prompt not found."
    }\n\nFull AI Response (for context):\n${generatedCodeContent.substring(
      0,
      300
    )}...`;
    const commitMessage = `${commitTitle}\n\n${commitBody}`;
    const aiBranchName = `ai-${selectedBranch.replace(
      /[^a-zA-Z0-9-]/g,
      "-"
    )}-${Date.now().toString().slice(-5)}`;

    try {
      const result = await pushCodeAndCreatePR({
        projectId: projectId,
        selectedBranch,
        aiBranchName,
        generatedCode: generatedCodeContent,
        commitMessage,
      }).unwrap();
      const systemMessage = {
        _id: `system-pr-${Date.now()}`,
        text: `Successfully pushed to '${
          result.branchName || aiBranchName
        }' and created PR.`,
        sender: "system",
        prUrl: result.prUrl,
        generatedCode: lastAiResponseForCodePush,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setLastAiResponseForCodePush(null);
    } catch (error) {
      console.error("Error sending code analysis message:", error);
      const message =
        error?.message ||
        (typeof error === "string" ? error : null) ||
        "Internal server error";
      setMessages((prev) => [
        ...prev,
        {
          _id: `error-${Date.now()}`,
          sessionId: currentChatSessionId,
          sender: "system",
          text: message,
          isError: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const openDeleteModal = (sessionIdToDelete) => {
    setSessionToDeleteId(sessionIdToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (sessionToDeleteId) {
      try {
        await deleteCodeAnalysisSession(sessionToDeleteId).unwrap();
        if (currentChatSessionId === sessionToDeleteId) {
          setCurrentChatSessionId(null);
          setMessages([]);
        }
        setSessionToDeleteId(null);
        setIsDeleteModalOpen(false);
      } catch (err) {
        console.error("Failed to delete session:", err);
        setSessionToDeleteId(null);
        setIsDeleteModalOpen(false);
        const systemErrorMessage = {
          _id: `error-delete-${Date.now()}`,
          sender: "system",
          text: `Failed to delete session: ${
            err.data?.message || err.message || "Unknown error"
          }`,
          isError: true,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemErrorMessage]);
      }
    }
  };

  // --- Render Logic ---
  if (isLoadingProject && !projectData) {
    return <LoadingScreen message="Loading Project..." />;
  }

  if (projectError) {
    return (
      <ErrorScreen
        title="Project Load Error"
        message="Could not load project details. Please try again."
        errorDetails={
          projectError.data?.message ||
          projectError.status?.toString() ||
          "Unknown error"
        }
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gray-800 text-gray-200 overflow-hidden w-full">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed z-30 bottom-4 left-4 p-3 rounded-full shadow-lg bg-gray-700 border border-gray-600 transition-all ${
          isSidebarOpen ? "transform -translate-x-60" : ""
        }`}
      >
        {isSidebarOpen ? (
          <X size={20} className="text-gray-200" />
        ) : (
          <MessageSquare size={20} className="text-gray-200" />
        )}
      </button>

      {/* Chat History Sidebar */}
      <ChatSidebar
        userId={loggedInUserId}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen} // ✅ FIX: match the state setter name
        onClose={() => setIsSidebarOpen(false)}
        sessionsData={sessionsData}
        isLoadingHistory={isLoadingHistory}
        currentChatSessionId={currentChatSessionId}
        handleSessionChange={handleSessionChange}
        openDeleteModal={openDeleteModal}
        isStartingSession={isStartingSession}
        project={project}
        selectedBranch={selectedBranch}
        isAuthenticated={isAuthenticated}
        handleGoBack={handleGoBack}
      />

      {/* Main Chat Area */}
      <ChatMainArea
        project={project}
        selectedBranch={selectedBranch}
        branches={branches}
        isLoadingBranches={isLoadingBranches}
        isAuthenticated={isAuthenticated}
        branchFetchError={branchFetchError}
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        isLoadingMessages={isLoadingMessages}
        currentChatSessionId={currentChatSessionId}
        isStartingSession={isStartingSession}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
        lastAiResponseForCodePush={lastAiResponseForCodePush}
        isPushingCode={isPushingCode}
        handleGenerateAndPushCode={handleGenerateAndPushCode}
        setIsNewBranchModalOpen={setIsNewBranchModalOpen}
        setBaseBranch={setBaseBranch}
        setSelectedBranch={setSelectedBranch}
        repoOwner={repoOwner}
        repoName={repoName}
        isLoadingHistory={isLoadingHistory}
      />

      {/* New Branch Modal */}
      <NewBranchModal
        isOpen={isNewBranchModalOpen}
        onClose={() => setIsNewBranchModalOpen(false)}
        newBranchName={newBranchName}
        setNewBranchName={setNewBranchName}
        baseBranch={baseBranch}
        setBaseBranch={setBaseBranch}
        branches={branches}
        isAuthenticated={isAuthenticated}
        isCreatingBranch={isCreatingBranch}
        handleCreateNewBranch={handleCreateNewBranch}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        handleDeleteConfirmed={handleDeleteConfirmed}
      />
    </div>
  );
};

export default CodeAnalysisPage;
