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
      <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`py-2 px-3 md:py-2.5 md:px-4 rounded-lg shadow-md max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl
            ${
              isUser
                ? "bg-blue-500 text-white rounded-br-none"
                : isAI
                ? "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                : "bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg w-full text-xs md:text-sm"
            }
            ${
              isSystem && msg.isError
                ? "bg-red-100 text-red-700 border-red-300"
                : ""
            }`}
        >
          <div className="flex items-center mb-1">
            {isUser && (
              <User size={16} className="mr-1.5 text-blue-100 flex-shrink-0" />
            )}
            {isAI && (
              <Bot size={16} className="mr-1.5 text-gray-500 flex-shrink-0" />
            )}
            {isSystem && (
              <Github
                size={16}
                className="mr-1.5 text-gray-600 flex-shrink-0"
              />
            )}
            <span className="font-semibold text-xs md:text-sm">
              {isUser ? "You" : isAI ? "AI Analyst" : "System"}
            </span>
          </div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {msg.text}
          </div>
          {isSystem && msg.prUrl && (
            <a
              href={msg.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200 text-xs md:text-sm"
            >
              View Pull Request{" "}
              <GitPullRequest size={14} className="inline ml-1" />
            </a>
          )}
          {isSystem && msg.generatedCode && (
            <details className="mt-1.5 bg-gray-50 p-1.5 rounded border border-gray-200">
              <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-800 flex items-center">
                <UploadCloud size={12} className="mr-1" /> Show AI Response
                Detail
              </summary>
              <pre className="mt-1 p-1.5 bg-gray-800 text-green-300 rounded text-xs overflow-x-auto font-mono leading-normal max-h-40 md:max-h-52">
                <code>{msg.generatedCode}</code>
              </pre>
            </details>
          )}
          {codeBlocksFromAi.length > 0 && (
            <details className="mt-1.5 bg-gray-700 p-1.5 rounded border border-gray-600">
              <summary className="cursor-pointer text-xs font-medium text-gray-200 hover:text-white flex items-center">
                <UploadCloud size={12} className="mr-1" /> View Extracted
                Code(s)
              </summary>
              {codeBlocksFromAi.map((block, index) => (
                <div key={index} className="mt-1">
                  <p className="text-xs text-gray-400 font-mono mb-0.5">
                    // File: {block.filePath}
                  </p>
                  <pre className="p-1.5 bg-black text-green-300 rounded text-xs overflow-x-auto font-mono leading-normal max-h-40 md:max-h-52">
                    <code>{block.content}</code>
                  </pre>
                </div>
              ))}
            </details>
          )}
          {msg.createdAt && (
            <p
              className={`text-xs mt-1 opacity-60 text-right ${
                isUser
                  ? "text-blue-100"
                  : isAI
                  ? "text-gray-500"
                  : isSystem && msg.isError
                  ? "text-red-200"
                  : "text-gray-600"
              }`}
            >
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  });
  MessageDisplay.displayName = "MessageDisplay";

  if (isLoadingProject && !projectData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Loading Project...</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
        <div className="text-center bg-white p-6 md:p-8 rounded-lg shadow-xl border border-red-200 max-w-md w-full">
          <ShieldAlert size={44} className="mx-auto mb-3 text-red-500" />
          <h1 className="text-xl md:text-2xl font-semibold mb-2">
            Project Load Error
          </h1>
          <p className="text-sm md:text-base mb-3">
            Could not load project details. Please try again.
          </p>
          <p className="mt-2 text-xs font-mono bg-red-100 p-1.5 rounded border border-red-200 text-red-600 overflow-x-auto">
            Error:{" "}
            {projectError.data?.message ||
              projectError.status?.toString() ||
              "Unknown error"}
          </p>
          <button
            onClick={handleGoBack}
            className="mt-5 flex items-center mx-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm md:text-base font-medium shadow-md transition-colors"
          >
            <ArrowLeftCircle size={18} className="mr-1.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200
          ${isSidebarOpen ? "w-60 md:w-64 p-3" : "w-0 p-0"} ${
          isSidebarOpen ? "block" : "hidden"
        } md:flex`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                Chat History
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 rounded hover:bg-gray-200"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto mb-2 pr-0.5 space-y-1.5">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full pt-10">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                </div>
              ) : sessionsData?.sessions?.length > 0 ? (
                sessionsData.sessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() =>
                      currentChatSessionId !== session._id &&
                      loadChatSession(session._id)
                    }
                    className={`p-2 rounded-md cursor-pointer transition-colors duration-150 flex justify-between items-center group
                      ${
                        currentChatSessionId === session._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-medium text-xs md:text-sm truncate ${
                          currentChatSessionId === session._id
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                        title={
                          session.title || `Session ...${session._id.slice(-6)}`
                        }
                      >
                        {session.title || `Session ...${session._id.slice(-6)}`}
                      </p>
                      <p
                        className={`text-xs mt-0.5 opacity-70 truncate ${
                          currentChatSessionId === session._id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                        title={session.selectedBranch || "N/A"}
                      >
                        {session.selectedBranch || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(session._id);
                      }}
                      className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1 ${
                        currentChatSessionId === session._id
                          ? "hover:bg-red-400 opacity-70"
                          : "hover:bg-red-100"
                      }`}
                      title="Delete session"
                    >
                      <Trash2
                        size={14}
                        className={`${
                          currentChatSessionId === session._id
                            ? "text-red-100 group-hover:text-white"
                            : "text-red-500 group-hover:text-red-600"
                        }`}
                      />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  No chat history.
                </p>
              )}
            </div>
            <button
              onClick={() => handleSessionChange(null)}
              className="mt-auto w-full flex items-center justify-center p-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
              disabled={
                isStartingSession ||
                !project ||
                !selectedBranch ||
                !githubData?.githubUsername
              }
            >
              {isStartingSession ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
              ) : (
                <Plus size={16} className="mr-1" />
              )}
              New Chat
            </button>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gray-100">
        <header className="bg-white p-3 shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="p-1.5 rounded-full hover:bg-gray-200 mr-1.5 md:mr-2"
                title="Go Back"
              >
                <ArrowLeftCircle size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-full hover:bg-gray-200 mr-2 md:mr-3"
              >
                <Menu size={18} className="text-gray-600" />
              </button>
              {isLoadingProject && !project ? (
                <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
              ) : project ? (
                <>
                  <Github
                    size={18}
                    className="mr-1.5 text-purple-500 flex-shrink-0"
                  />
                  <h1
                    className="text-sm md:text-lg font-semibold text-gray-700 truncate"
                    title={project.githubRepoLink || project.projectName}
                  >
                    {project.projectName || "Project Analysis"}
                  </h1>
                </>
              ) : (
                <h1 className="text-sm md:text-lg font-semibold text-red-500">
                  Project Not Found
                </h1>
              )}
            </div>

            {!isLoadingProject && project && (
              <div className="flex items-center space-x-2 md:space-x-3">
                {isLoadingBranches ? (
                  <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => {
                      const newBranch = e.target.value;
                      if (selectedBranch !== newBranch) {
                        setSelectedBranch(newBranch);
                        setCurrentChatSessionId(null);
                      }
                    }}
                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs md:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 shadow-sm max-w-[100px] md:max-w-[150px]"
                    disabled={!branches || branches.length === 0}
                  >
                    {!branches || branches.length === 0 ? (
                      <option value="">No branches</option>
                    ) : (
                      branches.map((branch) => (
                        <option key={branch.name} value={branch.name}>
                          {" "}
                          {branch.name}{" "}
                        </option>
                      ))
                    )}
                  </select>
                )}
                <button
                  onClick={() => {
                    setBaseBranch(
                      selectedBranch ||
                        (branches?.length > 0 ? branches[0].name : "")
                    );
                    setIsNewBranchModalOpen(true);
                  }}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs md:text-sm font-medium shadow-sm transition-colors"
                  disabled={
                    isLoadingBranches ||
                    !branches ||
                    branches.length === 0 ||
                    !githubData?.githubUsername
                  }
                >
                  <Plus size={14} className="mr-1" /> Branch
                </button>
              </div>
            )}
          </div>
        </header>

        <main
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5 md:space-y-3"
        >
          {isLoadingMessages && !messages.length && currentChatSessionId && (
            <div className="flex justify-center items-center h-full pt-10">
              <Loader2 className="animate-spin h-7 w-7 text-blue-500" />
            </div>
          )}
          {!currentChatSessionId &&
            !isLoadingHistory &&
            !isStartingSession &&
            project && (
              <div className="text-center text-gray-500 pt-10">
                <Bot size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm md:text-base">
                  {!selectedBranch && !isLoadingBranches
                    ? "Please select a branch."
                    : "Select or start a new chat."}
                </p>
              </div>
            )}
          {currentChatSessionId &&
            !isLoadingMessages &&
            messages.length === 0 && (
              <div className="text-center text-gray-500 pt-10">
                <Bot size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm md:text-base">This chat is empty.</p>
                <p className="text-xs">
                  Send a message to start the AI analysis.
                </p>
              </div>
            )}
          {messages.map((msg) => (
            <MessageDisplay
              key={msg._id || `msg-${msg.sender}-${msg.createdAt}`}
              msg={msg}
            />
          ))}
          {/* AI Processing Indicator (if needed, without typing effect) */}
          {isSendingMessage &&
            !messages.find(
              (m) => m.sender === "ai" && !m._id?.startsWith("temp")
            ) && (
              <div className="flex justify-start mb-3">
                <div className="py-2 px-3 md:py-2.5 md:px-4 rounded-lg shadow-md bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 max-w-xs sm:max-w-md">
                  <div className="flex items-center">
                    <Bot size={16} className="mr-1.5 text-gray-500" />
                    <span className="font-semibold text-xs md:text-sm">
                      AI is processing...
                    </span>
                    <Loader2 className="animate-spin h-4 w-4 ml-2 text-blue-500" />
                  </div>
                </div>
              </div>
            )}
        </main>

        <footer className="bg-white p-2.5 md:p-3 shadow- ऊपर z-10 border-t border-gray-200">
          {lastAiResponseForCodePush && !isPushingCode && (
            <div className="mb-2 flex justify-end">
              <button
                onClick={handleGenerateAndPushCode}
                className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs md:text-sm font-medium shadow-sm transition-colors"
                disabled={!currentChatSessionId || isSendingMessage}
              >
                <UploadCloud size={14} className="mr-1" /> Push AI Code
              </button>
            </div>
          )}
          {isPushingCode && (
            <div className="mb-2 flex justify-end items-center text-xs md:text-sm text-purple-600 font-medium">
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
              Pushing code & creating PR...
            </div>
          )}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isSendingMessage && handleSendMessage()
              }
              placeholder={
                currentChatSessionId ? "Ask AI..." : "Select or start a session"
              }
              className="flex-1 bg-transparent px-2 py-1.5 text-sm md:text-base text-gray-700 focus:outline-none placeholder-gray-400"
              disabled={
                isSendingMessage ||
                !project ||
                !selectedBranch ||
                !currentChatSessionId ||
                !githubData?.githubUsername
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
                !githubData?.githubUsername
              }
              className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 md:p-2 rounded-md disabled:opacity-50 shadow-sm transition-colors"
            >
              {isSendingMessage ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <div className="text-xs mt-1 space-y-0.5 max-h-10 overflow-y-auto">
            {!project && !isLoadingProject && (
              <p className="text-red-600 font-medium">Project not loaded.</p>
            )}
            {project &&
              !selectedBranch &&
              !isLoadingBranches &&
              branches?.length > 0 && (
                <p className="text-orange-600 font-medium">Select a branch.</p>
              )}
            {project &&
              !githubData?.githubUsername &&
              !statusResponse?.isLoading && (
                <p className="text-red-600 font-medium">
                  GitHub not authenticated.
                </p>
              )}
            {startSessionError && (
              <p className="text-red-600">
                Session Error:{" "}
                {startSessionError.data?.message || startSessionError.message}
              </p>
            )}
            {sendMessageError && (
              <p className="text-red-600">
                Send Error:{" "}
                {sendMessageError.data?.message || sendMessageError.message}
              </p>
            )}
            {createBranchError && (
              <p className="text-red-600">
                Branch Error:{" "}
                {createBranchError.data?.message || createBranchError.message}
              </p>
            )}
            {pushCodeError && (
              <p className="text-red-600">
                Push/PR Error:{" "}
                {pushCodeError.data?.message || pushCodeError.message}
              </p>
            )}
            {deleteSessionError && (
              <p className="text-red-600">
                Delete Error:{" "}
                {deleteSessionError.data?.message || deleteSessionError.message}
              </p>
            )}
          </div>
        </footer>
      </div>

      {/* New Branch Modal */}
      {isNewBranchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 md:p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-300">
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 text-center">
              Create New Branch
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="baseBranchModal"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Base Branch:
                </label>
                <select
                  id="baseBranchModal"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {branches?.map((b) => (
                    <option key={b.name} value={b.name}>
                      {" "}
                      {b.name}{" "}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="newBranchNameModal"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  New Branch Name:
                </label>
                <input
                  type="text"
                  id="newBranchNameModal"
                  value={newBranchName}
                  onChange={(e) =>
                    setNewBranchName(
                      e.target.value
                        .replace(/[^a-zA-Z0-9-._/]/g, "-")
                        .toLowerCase()
                    )
                  }
                  placeholder="e.g., feature/new-login"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setIsNewBranchModalOpen(false)}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                disabled={isCreatingBranch}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewBranch}
                className="px-3 py-1.5 text-sm rounded-md bg-green-500 hover:bg-green-600 text-white font-medium flex items-center"
                disabled={
                  isCreatingBranch ||
                  !newBranchName.trim() ||
                  !baseBranch.trim()
                }
              >
                {isCreatingBranch ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
                ) : (
                  <GitFork size={14} className="mr-1" />
                )}
                {isCreatingBranch ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 md:p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-300">
            <div className="text-center">
              <ShieldAlert size={36} className="mx-auto mb-2 text-red-500" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-1.5">
                Confirm Deletion
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Delete this chat session and all messages? This cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                disabled={isDeletingSession}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white font-medium flex items-center"
                disabled={isDeletingSession}
              >
                {isDeletingSession ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
                ) : (
                  <Trash2 size={14} className="mr-1" />
                )}
                {isDeletingSession ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
