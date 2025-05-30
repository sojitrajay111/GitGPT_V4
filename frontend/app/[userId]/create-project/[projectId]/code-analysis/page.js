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
} from "@/features/githubApiSlice";
import {
  useGetCodeAnalysisMessagesQuery,
  useGetCodeAnalysisSessionsQuery,
  usePushCodeAndCreatePRMutation,
  useSendCodeAnalysisMessageMutation,
  useStartCodeAnalysisSessionMutation,
} from "@/features/codeAnalysisApiSlice";

// Import Redux Toolkit Query hooks

// Mock user ID and Project ID for demonstration. In a real app, these would come from auth context or router.
const MOCK_USER_ID = "683704365472a67600163678"; // Replace with a valid MongoDB ObjectId for testing
const MOCK_PROJECT_ID = "68380bcf206b1a77dce7a991"; // Replace with a valid MongoDB ObjectId for testing
const MOCK_GITHUB_REPO_OWNER = "raj-patel-149"; // Replace with your GitHub username
const MOCK_GITHUB_REPO_NAME = "Code_pilot"; // Replace with a repo name you own for testing

const App = () => {
  const [currentUserId, setCurrentUserId] = useState(MOCK_USER_ID);
  const [project, setProject] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  // Define branches state
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
  } = useGetProjectByIdQuery(MOCK_PROJECT_ID);

  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useGetGitHubRepoBranchesQuery(
    { owner: MOCK_GITHUB_REPO_OWNER, repo: MOCK_GITHUB_REPO_NAME },
    { skip: !projectData?.project?.githubRepoLink }
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
  } = useGetCodeAnalysisSessionsQuery(MOCK_PROJECT_ID);

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
      setBranches(sortedBranches); // This line now correctly uses the defined setBranches
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
  }, [branchesData, branchesError, selectedBranch]); // Added branches to dependency array

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
            projectId: MOCK_PROJECT_ID,
            githubRepoName:
              MOCK_GITHUB_REPO_OWNER + "/" + MOCK_GITHUB_REPO_NAME,
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
    [project, selectedBranch, startCodeAnalysisSession]
  );

  // Automatically start a new session if no session is selected and project/branch are ready
  useEffect(() => {
    if (
      !currentChatSessionId &&
      project &&
      selectedBranch &&
      !isLoadingProject &&
      !isLoadingBranches &&
      !isStartingSession
    ) {
      const existingSession = sessionsData?.sessions?.find(
        (session) =>
          session.projectId === MOCK_PROJECT_ID &&
          session.selectedBranch === selectedBranch
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
  ]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatSessionId) return;

    const userMessageText = inputMessage;
    setInputMessage("");
    setLastAiResponseForCodePush(null);

    try {
      const currentBranchCodeContext = `// Code context from branch: ${selectedBranch} (simulated for now)`;

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
        owner: MOCK_GITHUB_REPO_OWNER,
        repo: MOCK_GITHUB_REPO_NAME,
        newBranchName,
        baseBranch,
      }).unwrap();

      setSelectedBranch(result.branchName);
      setNewBranchName("");
      setIsNewBranchModalOpen(false);

      const systemMessage = {
        text: `Successfully created and switched to new branch: ${result.branchName} (from ${baseBranch})`,
        sender: "system",
      };
      if (currentChatSessionId) {
        await sendCodeAnalysisMessage({
          sessionId: currentChatSessionId,
          text: systemMessage.text,
          sender: "system",
        });
      }
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

    const commitMessage = `AI-generated changes based on analysis\n\nPrompt: ${
      messages[messages.length - 2]?.text || "User prompt"
    }\nResponse: ${lastAiResponseForCodePush.substring(0, 100)}...`;

    const aiBranchName = `ai-generated-${selectedBranch}-${Date.now()
      .toString()
      .slice(-6)}`;

    try {
      const result = await pushCodeAndCreatePR({
        projectId: MOCK_PROJECT_ID,
        selectedBranch,
        aiBranchName,
        generatedCode: lastAiResponseForCodePush,
        commitMessage,
      }).unwrap();

      const systemMessage = {
        text: `Successfully generated code, pushed to new branch '${aiBranchName}', and created PR: ${result.prUrl}`,
        sender: "system",
        prUrl: result.prUrl,
        generatedCode: lastAiResponseForCodePush,
      };
      if (currentChatSessionId) {
        await sendCodeAnalysisMessage({
          sessionId: currentChatSessionId,
          text: systemMessage.text,
          sender: "system",
          generatedCode: systemMessage.generatedCode,
          prUrl: systemMessage.prUrl,
        });
      }
      setMessages((prev) => [...prev, systemMessage]);

      setLastAiResponseForCodePush(null);
    } catch (err) {
      console.error("Failed to push code and create PR:", err);
    }
  };

  const MessageDisplay = ({ msg }) => {
    const isUser = msg.sender === "user";
    const isAI = msg.sender === "ai";
    const isSystem = msg.sender === "system";

    return (
      <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`p-3 rounded-lg max-w-xl shadow ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : isAI
              ? "bg-gray-700 text-gray-100 rounded-bl-none"
              : "bg-yellow-400 text-gray-800 rounded-none w-full text-sm"
          }`}
        >
          <div className="flex items-center mb-1">
            {isUser && <User size={18} className="mr-2" />}
            {isAI && <Bot size={18} className="mr-2" />}
            {isSystem && <Github size={18} className="mr-2" />}
            <span className="font-semibold text-sm">
              {isUser ? "You" : isAI ? "AI Analyst" : "System Notification"}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          {isSystem && msg.prUrl && (
            <a
              href={msg.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 underline"
            >
              View Pull Request{" "}
              <GitPullRequest size={16} className="inline ml-1" />
            </a>
          )}
          {isSystem && msg.generatedCode && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                Show Generated Code
              </summary>
              <pre className="mt-1 p-2 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
                <code>{msg.generatedCode}</code>
              </pre>
            </details>
          )}
          {msg.createdAt && (
            <p
              className={`text-xs mt-2 ${
                isUser
                  ? "text-blue-200"
                  : isAI
                  ? "text-gray-400"
                  : "text-gray-600"
              } text-right`}
            >
              {new Date(msg.createdAt).toLocaleTimeString()}
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
      <div className="flex items-center justify-center h-screen bg-red-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Load Error</h1>
          <p>
            Failed to load project details. Please check your backend API and
            network connection.
          </p>
          <p className="mt-2 text-sm">
            Error: {projectError.message || JSON.stringify(projectError)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gray-900 text-gray-100">
      {/* Sidebar for Chat History */}
      <div
        className={`bg-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-72 p-4" : "w-0 p-0"
        } overflow-y-auto overflow-x-hidden relative md:block ${
          isSidebarOpen ? "" : "hidden"
        }`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chat History</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 rounded hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
              </div>
            ) : sessionsData?.sessions?.length > 0 ? (
              sessionsData.sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => loadChatSession(session._id)}
                  className={`p-2 mb-2 rounded cursor-pointer hover:bg-gray-700 ${
                    currentChatSessionId === session._id
                      ? "bg-blue-600"
                      : "bg-gray-700/50"
                  }`}
                >
                  <p className="font-medium text-sm truncate">
                    {session.title ||
                      `Session: ${session._id.substring(
                        session._id.length - 6
                      )}`}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Branch: {session.selectedBranch || "N/A"}
                  </p>
                  {session.lastActivity && (
                    <p className="text-xs text-gray-500">
                      Last: {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                No chat history found for this project. Start a new session!
              </p>
            )}
            <button
              onClick={() => handleSessionChange(null)}
              className="mt-4 w-full flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              disabled={isStartingSession}
            >
              {isStartingSession ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {isStartingSession ? "Starting..." : "New Chat Session"}
            </button>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header for project info and branch selection */}
        <header className="bg-gray-800 p-3 shadow-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded hover:bg-gray-700 mr-3"
              >
                {isSidebarOpen ? <ArrowLeft size={20} /> : <Menu size={20} />}
              </button>
              {isLoadingProject ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : project ? (
                <>
                  <Github size={20} className="mr-2 text-blue-400" />
                  <h1
                    className="text-lg font-semibold truncate"
                    title={project.githubRepoLink}
                  >
                    {project.projectName || "Loading Project..."}
                  </h1>
                </>
              ) : (
                <h1 className="text-lg font-semibold text-red-400">
                  Project Not Found
                </h1>
              )}
            </div>

            {!isLoadingProject && project && (
              <div className="flex items-center space-x-3">
                {isLoadingBranches ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={branchesData?.branches?.length === 0}
                  >
                    {branchesData?.branches?.length === 0 ? (
                      <option>No branches</option>
                    ) : (
                      branchesData.branches.map((branch) => (
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
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                  disabled={
                    isLoadingBranches || branchesData?.branches?.length === 0
                  }
                >
                  <Plus size={16} className="mr-1" /> New Branch
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-850">
          {" "}
          {/* Custom bg color */}
          {messages.map((msg, index) => (
            <MessageDisplay key={msg._id || `msg-${index}`} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
          {(isLoadingMessages || isSendingMessage) && (
            <div className="flex justify-start mb-4">
              <div className="p-3 rounded-lg max-w-md bg-gray-700 text-gray-100 rounded-bl-none shadow">
                <div className="flex items-center">
                  <Bot size={18} className="mr-2" />
                  <span className="font-semibold text-sm">
                    AI Analyst is typing...
                  </span>
                  <Loader2 className="animate-spin h-4 w-4 ml-2" />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="bg-gray-800 p-4 shadow-up z-10">
          {lastAiResponseForCodePush && !isPushingCode && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={handleGenerateAndPushCode}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                disabled={!currentChatSessionId}
              >
                <UploadCloud size={16} className="mr-2" /> Generate & Push Code
                to GitHub
              </button>
            </div>
          )}
          {isPushingCode && (
            <div className="mb-3 flex justify-end items-center text-sm text-purple-300">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Generating code and interacting with GitHub...
            </div>
          )}
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isSendingMessage && handleSendMessage()
              }
              placeholder="Type your prompt here... (e.g., 'Analyze this function for potential bugs')"
              className="flex-1 bg-transparent p-3 text-sm text-gray-100 focus:outline-none placeholder-gray-400"
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
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingMessage ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          {!project && !isLoadingProject && (
            <p className="text-xs text-red-400 mt-1">
              Project details not loaded. Cannot send messages.
            </p>
          )}
          {project && !selectedBranch && !isLoadingBranches && (
            <p className="text-xs text-yellow-400 mt-1">
              Please select or create a branch to start analysis.
            </p>
          )}
          {startSessionError && (
            <p className="text-xs text-red-400 mt-1">
              Error starting session:{" "}
              {startSessionError.data?.message || startSessionError.message}
            </p>
          )}
          {sendMessageError && (
            <p className="text-xs text-red-400 mt-1">
              Error sending message:{" "}
              {sendMessageError.data?.message || sendMessageError.message}
            </p>
          )}
          {createBranchError && (
            <p className="text-xs text-red-400 mt-1">
              Error creating branch:{" "}
              {createBranchError.data?.message || createBranchError.message}
            </p>
          )}
          {pushCodeError && (
            <p className="text-xs text-red-400 mt-1">
              Error pushing code:{" "}
              {pushCodeError.data?.message || pushCodeError.message}
            </p>
          )}
        </footer>
      </div>

      {/* New Branch Modal */}
      {isNewBranchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Branch</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="baseBranch"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Base Branch:
                </label>
                <select
                  id="baseBranch"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="block text-sm font-medium text-gray-300 mb-1"
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
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsNewBranchModalOpen(false)}
                className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500"
                disabled={isCreatingBranch}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewBranch}
                className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 flex items-center"
                disabled={
                  isCreatingBranch ||
                  !newBranchName.trim() ||
                  !baseBranch.trim()
                }
              >
                {isCreatingBranch ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <GitFork size={16} className="mr-2" />
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
