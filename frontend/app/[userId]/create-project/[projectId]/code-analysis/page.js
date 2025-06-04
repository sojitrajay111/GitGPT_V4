"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Icons from lucide-react
import {
  Bot,
  User,
  Send,
  Plus,
  GitFork,
  Github,
  ArrowLeft,
  Menu,
  X,
  Loader2,
  GitPullRequest,
  UploadCloud,
  Trash2,
  ShieldAlert,
  ArrowLeftCircle,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";

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
import { useParams } from "next/navigation";

// Helper function to parse AI response for code blocks
const parseAiCodeResponse = (aiResponseText) => {
  if (typeof aiResponseText !== "string") return [];
  const codeBlocks = [];
  const regex = /```(?:\w+)?\n(?:\/\/|#)\s*([^\n]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(aiResponseText)) !== null) {
    codeBlocks.push({
      filePath: match[1].trim(),
      content: match[2].trim(),
    });
  }
  return codeBlocks;
};

const App = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  const projectId = params.projectId;

  const [githubData, setGithubData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [project, setProject] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);

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

  // RTK Query Hooks
  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const { data: statusResponse } = useGetGitHubStatusQuery(userId, {
    skip: !userId,
  });

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

  const repolink = projectData?.project?.githubRepoLink;
  let repoName = "";
  if (repolink && typeof repolink === "string" && repolink.startsWith("http")) {
    try {
      const url = new URL(repolink);
      const pathParts = url.pathname.split("/");
      if (pathParts.length > 2) {
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
    { owner: githubData?.githubUsername, repo: repoName },
    { skip: !githubData?.githubUsername || !repoName }
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
  } = useGetCodeAnalysisSessionsQuery(projectId, { skip: !projectId });

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

  const messagesContainerRef = useRef(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 20;
      if (isScrolledToBottom || messages.length <= 2) {
        // Scroll if near bottom or very few messages
        messagesContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]); // Removed isSendingMessage as typing effect is removed

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
          !githubData?.githubUsername ||
          !repoName
        ) {
          console.error("Cannot start new session: Missing critical data.", {
            projectExists: !!project,
            selectedBranch,
            githubUser: githubData?.githubUsername,
            repoName,
          });
          return;
        }
        try {
          const result = await startCodeAnalysisSession({
            projectId: projectId,
            githubRepoName: `${githubData.githubUsername}/${repoName}`,
            selectedBranch,
          }).unwrap();
          if (result.session?._id) {
            setCurrentChatSessionId(result.session._id);
          } else {
            console.error("New session started but no ID returned:", result);
          }
        } catch (err) {
          console.error("Failed to start new session:", err);
        }
      }
    },
    [
      project,
      selectedBranch,
      startCodeAnalysisSession,
      githubData,
      projectId,
      repoName,
      currentChatSessionId,
    ]
  );

  useEffect(() => {
    if (
      !isLoadingProject &&
      !isLoadingBranches &&
      !isStartingSession &&
      project &&
      selectedBranch &&
      sessionsData?.sessions &&
      githubData?.githubUsername &&
      repoName
    ) {
      if (!currentChatSessionId) {
        const existingSessionForBranch = sessionsData.sessions.find(
          (session) =>
            session.projectId === projectId &&
            session.selectedBranch === selectedBranch &&
            session.githubRepoName ===
              `${githubData.githubUsername}/${repoName}`
        );
        if (existingSessionForBranch) {
          setCurrentChatSessionId(existingSessionForBranch._id);
        } else if (!isStartingSession) {
          handleSessionChange();
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
    githubData,
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
    } catch (err) {
      console.error("Failed to send message:", err);
      const systemErrorMessage = {
        _id: `error-send-${Date.now()}`,
        sessionId: currentChatSessionId,
        sender: "system",
        text: `Error sending message: ${
          err.data?.message || err.message || "Unknown error"
        }`,
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMessage._id),
        systemErrorMessage,
      ]);
    }
  };

  const handleCreateNewBranch = async () => {
    if (
      !project ||
      !newBranchName.trim() ||
      !baseBranch.trim() ||
      !githubData?.githubUsername ||
      !repoName
    ) {
      console.error("Missing data for creating branch.");
      return;
    }
    try {
      const result = await createGitHubBranch({
        owner: githubData.githubUsername,
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
      setCurrentChatSessionId(null);
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
      !githubData?.githubUsername ||
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
    }\n\nFull AI Response (for context):\n${lastAiResponseForCodePush.substring(
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
    } catch (err) {
      console.error("Failed to push code and create PR:", err);
      const errorMessage = {
        _id: `error-pr-push-${Date.now()}`,
        text: `Failed to push code & create PR: ${
          err.data?.message || err.message || "Unknown error"
        }`,
        sender: "system",
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const handleGoBack = () => {
    router.back();
  };

  // Simplified MessageDisplay without typing effect
  const MessageDisplay = React.memo(({ msg }) => {
    const isUser = msg.sender === "user";
    const isAI = msg.sender === "ai";
    const isSystem = msg.sender === "system";

    const codeBlocksFromAi = isAI ? parseAiCodeResponse(msg.text) : [];

    return (
      <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`py-3 px-4 rounded-2xl max-w-[85%] md:max-w-[75%] lg:max-w-[65%] 
            ${
              isUser
                ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md"
                : isAI
                ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-bl-none border border-gray-700 shadow-md"
                : "bg-gradient-to-br from-amber-700 to-amber-800 text-amber-50 border border-amber-600 rounded-lg w-full text-xs md:text-sm"
            }
            ${
              isSystem && msg.isError
                ? "bg-gradient-to-br from-red-700 to-red-800 text-red-50 border-red-600"
                : ""
            }`}
        >
          <div className="flex items-center mb-1.5">
            {isUser && (
              <User size={18} className="mr-2 text-purple-200 flex-shrink-0" />
            )}
            {isAI && (
              <Bot size={18} className="mr-2 text-gray-300 flex-shrink-0" />
            )}
            {isSystem && (
              <Github size={18} className="mr-2 text-amber-200 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">
              {isUser ? "You" : isAI ? "Code Assistant" : "System"}
            </span>
            {msg.createdAt && (
              <span
                className={`ml-auto text-xs opacity-80 ${
                  isUser ? "text-purple-100" : "text-gray-300"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {msg.text}
          </div>

          {isSystem && msg.prUrl && (
            <a
              href={msg.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-amber-300 hover:text-amber-100 underline font-medium transition-colors duration-200 text-xs"
            >
              View Pull Request{" "}
              <GitPullRequest size={14} className="inline ml-1" />
            </a>
          )}

          {codeBlocksFromAi.length > 0 && (
            <details className="mt-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
              <summary className="cursor-pointer text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center">
                <UploadCloud size={14} className="mr-1.5" /> View Extracted Code
              </summary>
              <div className="mt-2 space-y-2">
                {codeBlocksFromAi.map((block, index) => (
                  <div key={index}>
                    <p className="text-xs text-gray-400 font-mono mb-1">
                      {block.filePath}
                    </p>
                    <pre className="p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto font-mono">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  });

  // ... (keep all other existing functions the same)

  if (isLoadingProject && !projectData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader2 className="animate-spin h-10 w-10 text-purple-500" />
        <p className="ml-3 text-lg text-gray-300">Loading Project...</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-900 to-red-800 p-4">
        <div className="text-center bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-700 max-w-md w-full">
          <ShieldAlert size={44} className="mx-auto mb-3 text-red-400" />
          <h1 className="text-xl md:text-2xl font-semibold mb-2 text-white">
            Project Load Error
          </h1>
          <p className="text-sm md:text-base mb-3 text-gray-300">
            Could not load project details. Please try again.
          </p>
          <p className="mt-2 text-xs font-mono bg-red-900/50 p-2 rounded border border-red-800 text-red-200 overflow-x-auto">
            Error:{" "}
            {projectError.data?.message ||
              projectError.status?.toString() ||
              "Unknown error"}
          </p>
          <button
            onClick={handleGoBack}
            className="mt-5 flex items-center mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm md:text-base font-medium shadow-md transition-all"
          >
            <ArrowLeftCircle size={18} className="mr-1.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 overflow-hidden">
      {/* Mobile sidebar toggle (floating button) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed z-30 bottom-4 left-4 p-3 rounded-full shadow-lg bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400 transition-all ${
          isSidebarOpen ? "transform -translate-x-60" : ""
        }`}
      >
        {isSidebarOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageSquare size={20} className="text-white" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-20 h-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col border-r border-gray-700
          ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-20"
          } 
          ${isSidebarOpen ? "block" : "hidden"} md:flex`}
      >
        {isSidebarOpen ? (
          <>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200">
                Chat History
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-700"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full pt-10">
                  <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
                </div>
              ) : sessionsData?.sessions?.length > 0 ? (
                sessionsData.sessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() =>
                      currentChatSessionId !== session._id &&
                      handleSessionChange(session._id)
                    }
                    className={`p-2 rounded-lg cursor-pointer transition-colors duration-150 flex justify-between items-center group
                      ${
                        currentChatSessionId === session._id
                          ? "bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-100 border border-purple-700"
                          : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                      }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-medium text-sm truncate ${
                          currentChatSessionId === session._id
                            ? "text-purple-100"
                            : "text-gray-200"
                        }`}
                      >
                        {session.title || `Session ...${session._id.slice(-6)}`}
                      </p>
                      <p
                        className={`text-xs mt-0.5 opacity-70 truncate ${
                          currentChatSessionId === session._id
                            ? "text-purple-300"
                            : "text-gray-400"
                        }`}
                      >
                        {session.selectedBranch || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(session._id);
                      }}
                      className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        currentChatSessionId === session._id
                          ? "hover:bg-purple-700/50 opacity-70"
                          : "hover:bg-gray-500"
                      }`}
                    >
                      <Trash2
                        size={14}
                        className={`${
                          currentChatSessionId === session._id
                            ? "text-purple-300 group-hover:text-purple-100"
                            : "text-gray-400 group-hover:text-gray-200"
                        }`}
                      />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  No chat history
                </p>
              )}
            </div>
            <button
              onClick={() => handleSessionChange(null)}
              className="m-3 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all flex items-center justify-center"
              disabled={
                isStartingSession ||
                !project ||
                !selectedBranch ||
                !githubData?.githubUsername
              }
            >
              {isStartingSession ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              New Chat
            </button>
          </>
        ) : (
          // Collapsed sidebar
          <div className="flex flex-col items-center py-4 h-full">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-gray-700 mb-4"
            >
              <Menu size={20} className="text-gray-300" />
            </button>
            <button
              onClick={() => handleSessionChange(null)}
              className="p-2 rounded-full hover:bg-gray-700 mb-4"
              title="New Chat"
            >
              <Plus size={20} className="text-gray-300" />
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-gray-900/80 to-gray-800/80">
        {/* Header with improved layout */}
        <header className="bg-gray-800 p-3 shadow-md z-10 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoBack}
                className="p-1.5 rounded-full hover:bg-gray-700"
                title="Go Back"
              >
                <ChevronLeft size={20} className="text-gray-300" />
              </button>

              {project && (
                <div className="flex items-center">
                  <Github size={18} className="text-gray-300 mr-2" />
                  <h1 className="text-sm font-semibold text-gray-100 truncate max-w-[160px] md:max-w-none">
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
                        setCurrentChatSessionId(null);
                      }
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-sm max-w-[120px] md:max-w-[150px]"
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
                  className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-md transition-all"
                  disabled={!branches || branches.length === 0}
                >
                  <Plus size={14} className="mr-1" /> Branch
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat messages area */}
        <main
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isLoadingMessages && !messages.length && currentChatSessionId && (
            <div className="flex justify-center items-center h-full pt-10">
              <Loader2 className="animate-spin h-7 w-7 text-purple-500" />
            </div>
          )}
          {!currentChatSessionId &&
            !isLoadingHistory &&
            !isStartingSession &&
            project && (
              <div className="text-center text-gray-400 pt-20">
                <Bot size={36} className="mx-auto mb-3 opacity-60" />
                <p className="text-sm">
                  {!selectedBranch && !isLoadingBranches
                    ? "Please select a branch"
                    : "Select or start a new chat"}
                </p>
              </div>
            )}
          {currentChatSessionId &&
            !isLoadingMessages &&
            messages.length === 0 && (
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
              <div className="py-3 px-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 rounded-bl-none border border-gray-700 shadow-md max-w-[75%]">
                <div className="flex items-center">
                  <Bot size={18} className="mr-2 text-gray-400" />
                  <span className="font-medium text-sm">Analyzing...</span>
                  <Loader2 className="animate-spin h-4 w-4 ml-2 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer with message input */}
        <footer className="bg-gray-800 p-3 border-t border-gray-700">
          {lastAiResponseForCodePush && !isPushingCode && (
            <div className="mb-2 flex justify-end">
              <button
                onClick={handleGenerateAndPushCode}
                className="flex items-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-all"
                disabled={!currentChatSessionId || isSendingMessage}
              >
                <UploadCloud size={14} className="mr-1" /> Push AI Code
              </button>
            </div>
          )}
          {isPushingCode && (
            <div className="mb-2 flex justify-end items-center text-xs text-amber-400 font-medium">
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
              Pushing code & creating PR...
            </div>
          )}

          <div className="flex items-center bg-gray-700 rounded-lg p-1.5 border border-gray-600">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isSendingMessage && handleSendMessage()
              }
              placeholder={
                currentChatSessionId
                  ? "Ask about your code..."
                  : "Select or start a session"
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-200 focus:outline-none placeholder-gray-400"
              disabled={
                isSendingMessage ||
                !project ||
                !selectedBranch ||
                !currentChatSessionId
              }
            />
            <button
              onClick={handleSendMessage}
              disabled={
                isSendingMessage ||
                !inputMessage.trim() ||
                !project ||
                !selectedBranch ||
                !currentChatSessionId
              }
              className="ml-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-md transition-all"
            >
              {isSendingMessage ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <div className="text-xs mt-2 text-gray-500 space-y-0.5">
            {!project && !isLoadingProject && (
              <p className="text-red-400">Project not loaded</p>
            )}
            {project && !selectedBranch && !isLoadingBranches && (
              <p className="text-amber-400">Select a branch</p>
            )}
            {project && !githubData?.githubUsername && (
              <p className="text-red-400">GitHub not authenticated</p>
            )}
          </div>
        </footer>
      </div>

      {/* New Branch Modal */}
      {isNewBranchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-5 rounded-xl shadow-xl w-full max-w-sm border border-gray-700">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                      e.target.value
                        .replace(/[^a-zA-Z0-9-._/]/g, "-")
                        .toLowerCase()
                    )
                  }
                  placeholder="feature/new-login"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsNewBranchModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewBranch}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium flex items-center border border-purple-500"
                disabled={!newBranchName.trim() || !baseBranch.trim()}
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
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-5 rounded-xl shadow-xl w-full max-w-sm border border-gray-700">
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
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium flex items-center border border-red-500"
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
