"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

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
} from "@/features/codeAnalysisApiSlice";
import { useParams } from "next/navigation";

const App = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const [githubData, setGithubData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    data: statusResponse,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useGetGitHubStatusQuery(userId);

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

  const [currentUserId, setCurrentUserId] = useState(userId);
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

  const messagesEndRef = useRef(null);

  // RTK Query Hooks
  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectByIdQuery(projectId);

  const repolink = projectData?.project?.githubRepoLink;

  let repoName = "";

  if (repolink && repolink.startsWith("http")) {
    const url = new URL(repolink);
    const pathParts = url.pathname.split("/");
    repoName = pathParts[2]; // Repo name
  }

  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useGetGitHubRepoBranchesQuery(
    { owner: githubData?.githubUsername, repo: repoName },
    {
      skip:
        !projectData?.project?.githubRepoLink || !githubData?.githubUsername,
    }
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
  } = useGetCodeAnalysisSessionsQuery(projectId);

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

  // Effect to set project data once loaded
  useEffect(() => {
    if (projectData?.project) {
      setProject(projectData.project);
    }
    if (projectError) {
      console.error("Error fetching project:", projectError);
    }
  }, [projectData, projectError]);

  // Effect to set branches once loaded
  useEffect(() => {
    if (branchesData?.branches) {
      const sortedBranches = [...branchesData.branches].sort();
      setBranches(sortedBranches);
      if (sortedBranches.length > 0 && !selectedBranch) {
        const defaultBranch = sortedBranches.includes("main")
          ? "main"
          : sortedBranches[0];
        setSelectedBranch(defaultBranch);
        setBaseBranch(defaultBranch); // Default for new branch creation
      }
    }
    if (branchesError) {
      console.error("Error fetching branches:", branchesError);
    }
  }, [branchesData, branchesError, selectedBranch]);

  // Effect to set messages once loaded
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }
  }, [messagesData, messagesError]);

  // Effect to scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle starting a new session or loading an existing one
  const handleSessionChange = useCallback(
    async (sessionId = null) => {
      if (sessionId) {
        setCurrentChatSessionId(sessionId);
        setMessages([]); // Clear messages when switching sessions
        setLastAiResponseForCodePush(null); // Clear AI response for new session
      } else {
        // Start a new session
        if (!project || !selectedBranch) {
          console.error(
            "Cannot start new session: Project or branch not selected."
          );
          return;
        }
        try {
          const result = await startCodeAnalysisSession({
            projectId: projectId,
            githubRepoName: githubData?.githubUsername + "/" + repoName,
            selectedBranch,
          }).unwrap();
          setCurrentChatSessionId(result.session._id);
          setMessages([]); // Clear messages for new session
          setLastAiResponseForCodePush(null);
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
    ]
  );

  // Automatically start a new session if no session is selected and project/branch are ready
  useEffect(() => {
    if (
      !currentChatSessionId &&
      project &&
      selectedBranch &&
      !isLoadingProject &&
      !isLoadingBranches &&
      !isStartingSession &&
      sessionsData?.sessions && // Ensure sessionsData is available
      githubData?.githubUsername // Ensure githubData is available
    ) {
      const existingSession = sessionsData.sessions.find(
        (session) =>
          session.projectId === projectId &&
          session.selectedBranch === selectedBranch &&
          session.githubRepoName === `${githubData.githubUsername}/${repoName}`
      );

      if (existingSession) {
        setCurrentChatSessionId(existingSession._id);
      } else {
        handleSessionChange();
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
    if (!inputMessage.trim() || !currentChatSessionId) return;

    const userMessageText = inputMessage;
    setInputMessage("");
    setLastAiResponseForCodePush(null);

    try {
      // In a real scenario, currentBranchCodeContext would be fetched dynamically
      // For now, it's a placeholder to indicate where the actual code context would go.
      const currentBranchCodeContext = `// Code context from branch: ${selectedBranch} (This is a placeholder. Actual code fetching needs to be implemented on the backend.)`;

      const result = await sendCodeAnalysisMessage({
        sessionId: currentChatSessionId,
        text: userMessageText,
        currentBranchCodeContext,
      }).unwrap();

      setLastAiResponseForCodePush(result.aiMessage.text);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateNewBranch = async () => {
    if (!project || !newBranchName.trim() || !baseBranch.trim()) {
      console.error("Missing branch name or base branch.");
      return;
    }

    try {
      const result = await createGitHubBranch({
        owner: githubData?.githubUsername,
        repo: repoName,
        newBranchName,
        baseBranch,
      }).unwrap();

      setSelectedBranch(result.branchName);
      setNewBranchName("");
      setIsNewBranchModalOpen(false);

      const systemMessage = {
        text: `Successfully created and switched to new branch: ${result.branchName} (from ${baseBranch})`,
        sender: "system",
        createdAt: new Date().toISOString(), // Add timestamp for system messages
      };
      // We don't need to send system messages to the AI via sendCodeAnalysisMessage
      // as they are purely UI notifications.
      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error("Failed to create branch:", err);
    }
  };

  const handleGenerateAndPushCode = async () => {
    if (
      !project ||
      !selectedBranch ||
      !lastAiResponseForCodePush ||
      !currentChatSessionId
    ) {
      console.error("Missing data for code push.");
      return;
    }

    // Use the last user prompt as part of the commit message for context
    const lastUserMessage = messages.findLast((msg) => msg.sender === "user");
    const commitMessage = `AI-generated changes based on analysis\n\nPrompt: ${
      lastUserMessage?.text || "User prompt"
    }\nResponse: ${lastAiResponseForCodePush.substring(
      0,
      Math.min(lastAiResponseForCodePush.length, 100)
    )}...`;

    const aiBranchName = `ai-generated-${selectedBranch}-${Date.now()
      .toString()
      .slice(-6)}`;

    try {
      const result = await pushCodeAndCreatePR({
        projectId: projectId,
        selectedBranch,
        aiBranchName,
        generatedCode: lastAiResponseForCodePush, // This is the code the AI generated
        commitMessage,
      }).unwrap();

      const systemMessage = {
        text: `Successfully generated code, pushed to new branch '${aiBranchName}', and created PR.`,
        sender: "system",
        prUrl: result.prUrl,
        generatedCode: lastAiResponseForCodePush,
        createdAt: new Date().toISOString(),
      };
      // Again, no need to send this system message to the AI
      setMessages((prev) => [...prev, systemMessage]);

      setLastAiResponseForCodePush(null); // Clear the AI response after pushing
    } catch (err) {
      console.error("Failed to push code and create PR:", err);
      const errorMessage = {
        text: `Failed to generate and push code: ${
          err.data?.message || err.message
        }`,
        sender: "system",
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const MessageDisplay = ({ msg }) => {
    const isUser = msg.sender === "user";
    const isAI = msg.sender === "ai";
    const isSystem = msg.sender === "system";

    return (
      <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`p-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01]
            ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none"
                : isAI
                ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-bl-none"
                : "bg-gradient-to-br from-yellow-300 to-orange-400 text-gray-900 rounded-lg w-full text-sm font-medium"
            }
            ${
              isSystem && msg.isError
                ? "from-red-500 to-red-700 text-white"
                : ""
            }
          `}
        >
          <div className="flex items-center mb-2">
            {isUser && <User size={20} className="mr-2 text-blue-100" />}
            {isAI && <Bot size={20} className="mr-2 text-gray-600" />}
            {isSystem && <Github size={20} className="mr-2 text-gray-700" />}
            <span className="font-bold text-base">
              {isUser ? "You" : isAI ? "AI Analyst" : "System Notification"}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {msg.text}
          </p>
          {isSystem && msg.prUrl && (
            <a
              href={msg.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center text-blue-700 hover:text-blue-900 underline font-semibold transition-colors duration-200"
            >
              View Pull Request{" "}
              <GitPullRequest size={16} className="inline ml-1" />
            </a>
          )}
          {isSystem && msg.generatedCode && (
            <details className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-inner">
              <summary className="cursor-pointer text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center">
                <UploadCloud size={14} className="mr-1" /> Show Generated Code
              </summary>
              <pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded-md text-xs overflow-x-auto font-mono leading-normal shadow-md">
                <code>{msg.generatedCode}</code>
              </pre>
            </details>
          )}
          {msg.createdAt && (
            <p
              className={`text-xs mt-2 opacity-75 text-right ${
                isUser
                  ? "text-blue-100"
                  : isAI
                  ? "text-gray-500"
                  : "text-gray-700"
              }`}
            >
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  const loadChatSession = (sessionId) => {
    setCurrentChatSessionId(sessionId);
  };

  // Check for critical errors
  if (projectError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-700 to-red-900 text-white p-8">
        <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-red-400">
          <h1 className="text-3xl font-extrabold mb-4 text-red-200">
            Project Load Error
          </h1>
          <p className="text-lg text-red-100">
            Failed to load project details. Please check your backend API and
            network connection.
          </p>
          <p className="mt-4 text-sm font-mono text-red-300">
            Error: {projectError.message || JSON.stringify(projectError)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      {/* Sidebar for Chat History */}
      <div
        className={`bg-white bg-opacity-90 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-72 p-4" : "w-0 p-0"}
          overflow-y-auto overflow-x-hidden relative md:block ${
            isSidebarOpen ? "" : "hidden"
          } border-r border-gray-200`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Chat History</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
              </div>
            ) : sessionsData?.sessions?.length > 0 ? (
              sessionsData.sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => loadChatSession(session._id)}
                  className={`p-3 mb-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-md
                    ${
                      currentChatSessionId === session._id
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <p
                    className={`font-semibold text-sm truncate ${
                      currentChatSessionId === session._id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {session.title ||
                      `Session: ${session._id.substring(
                        session._id.length - 6
                      )}`}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      currentChatSessionId === session._id
                        ? "text-blue-100"
                        : "text-gray-500"
                    } truncate`}
                  >
                    Branch: {session.selectedBranch || "N/A"}
                  </p>
                  {session.lastActivity && (
                    <p
                      className={`text-xs mt-1 ${
                        currentChatSessionId === session._id
                          ? "text-blue-200"
                          : "text-gray-400"
                      }`}
                    >
                      Last: {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-base text-gray-500 text-center py-4">
                No chat history found. Start a new session!
              </p>
            )}
            <button
              onClick={() => handleSessionChange(null)}
              className="mt-6 w-full flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-xl text-base font-semibold shadow-lg transform hover:scale-[1.01] transition-all duration-200"
              disabled={isStartingSession}
            >
              {isStartingSession ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Plus size={18} className="mr-2" />
              )}
              {isStartingSession ? "Starting..." : "New Chat Session"}
            </button>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-white bg-opacity-70 backdrop-blur-sm">
        {/* Header for project info and branch selection */}
        <header className="bg-white bg-opacity-90 backdrop-blur-md p-4 shadow-lg z-10 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-full hover:bg-gray-200 mr-3 transition-colors duration-200"
              >
                {isSidebarOpen ? (
                  <ArrowLeft size={20} className="text-gray-600" />
                ) : (
                  <Menu size={20} className="text-gray-600" />
                )}
              </button>
              {isLoadingProject ? (
                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              ) : project ? (
                <>
                  <Github size={22} className="mr-3 text-purple-600" />
                  <h1
                    className="text-xl font-extrabold text-gray-800 truncate"
                    title={project.githubRepoLink}
                  >
                    {project.projectName || "Loading Project..."}
                  </h1>
                </>
              ) : (
                <h1 className="text-xl font-extrabold text-red-500">
                  Project Not Found
                </h1>
              )}
            </div>

            {!isLoadingProject && project && (
              <div className="flex items-center space-x-4">
                {isLoadingBranches ? (
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                    disabled={branchesData?.branches?.length === 0}
                  >
                    {branchesData?.branches?.length === 0 ? (
                      <option>No branches</option>
                    ) : (
                      branchesData?.branches?.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))
                    )}
                  </select>
                )}
                <button
                  onClick={() => {
                    setBaseBranch(
                      selectedBranch ||
                        (branchesData?.branches?.length > 0
                          ? branchesData.branches[0]
                          : "")
                    );
                    setIsNewBranchModalOpen(true);
                  }}
                  className="flex items-center bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-base font-semibold shadow-md transform hover:scale-[1.01] transition-all duration-200"
                  disabled={
                    isLoadingBranches || branchesData?.branches?.length === 0
                  }
                >
                  <Plus size={18} className="mr-2" /> New Branch
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100">
          {messages.map((msg, index) => (
            <MessageDisplay key={msg._id || `msg-${index}`} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
          {(isLoadingMessages || isSendingMessage) && (
            <div className="flex justify-start mb-4">
              <div className="p-4 rounded-xl max-w-md bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-bl-none shadow-lg">
                <div className="flex items-center">
                  <Bot size={20} className="mr-2 text-gray-600" />
                  <span className="font-semibold text-base">
                    AI Analyst is typing...
                  </span>
                  <Loader2 className="animate-spin h-5 w-5 ml-2 text-blue-500" />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="bg-white bg-opacity-90 backdrop-blur-md p-5 shadow-up z-10 border-t border-gray-200">
          {lastAiResponseForCodePush && !isPushingCode && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleGenerateAndPushCode}
                className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-lg text-base font-semibold shadow-lg transform hover:scale-[1.01] transition-all duration-200"
                disabled={!currentChatSessionId}
              >
                <UploadCloud size={18} className="mr-2" /> Generate & Push Code
                to GitHub
              </button>
            </div>
          )}
          {isPushingCode && (
            <div className="mb-4 flex justify-end items-center text-base text-purple-600 font-medium">
              <Loader2 className="animate-spin h-6 w-6 mr-3" />
              Generating code and interacting with GitHub...
            </div>
          )}
          <div className="flex items-center bg-gray-100 rounded-xl p-2 shadow-inner border border-gray-200">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isSendingMessage && handleSendMessage()
              }
              placeholder="Type your prompt here... (e.g., 'Analyze this function for potential bugs')"
              className="flex-1 bg-transparent p-3 text-base text-gray-800 focus:outline-none placeholder-gray-400"
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
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:scale-[1.05] transition-all duration-200"
            >
              {isSendingMessage ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <Send size={22} />
              )}
            </button>
          </div>
          {!project && !isLoadingProject && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              Project details not loaded. Cannot send messages.
            </p>
          )}
          {project && !selectedBranch && !isLoadingBranches && (
            <p className="text-xs text-orange-500 mt-2 font-medium">
              Please select or create a branch to start analysis.
            </p>
          )}
          {startSessionError && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              Error starting session:{" "}
              {startSessionError.data?.message || startSessionError.message}
            </p>
          )}
          {sendMessageError && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              Error sending message:{" "}
              {sendMessageError.data?.message || sendMessageError.message}
            </p>
          )}
          {createBranchError && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              Error creating branch:{" "}
              {createBranchError.data?.message || createBranchError.message}
            </p>
          )}
          {pushCodeError && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              Error pushing code:{" "}
              {pushCodeError.data?.message || pushCodeError.message}
            </p>
          )}
        </footer>
      </div>

      {/* New Branch Modal */}
      {isNewBranchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-200 transform scale-105 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Create New Branch
            </h3>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="baseBranch"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Base Branch:
                </label>
                <select
                  id="baseBranch"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                >
                  {branchesData?.branches?.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="newBranchName"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  New Branch Name:
                </label>
                <input
                  type="text"
                  id="newBranchName"
                  value={newBranchName}
                  onChange={(e) =>
                    setNewBranchName(e.target.value.replace(/\s+/g, "-"))
                  }
                  placeholder="e.g., feature/new-login-flow"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsNewBranchModalOpen(false)}
                className="px-5 py-2.5 text-base rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors duration-200 shadow-md"
                disabled={isCreatingBranch}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewBranch}
                className="px-5 py-2.5 text-base rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold flex items-center shadow-md transform hover:scale-[1.01] transition-all duration-200"
                disabled={
                  isCreatingBranch ||
                  !newBranchName.trim() ||
                  !baseBranch.trim()
                }
              >
                {isCreatingBranch ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <GitFork size={18} className="mr-2" />
                )}
                {isCreatingBranch ? "Creating..." : "Create Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
