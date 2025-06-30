// page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Alert,
  Stack,
  Snackbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Import modularized components
import UserStoryHeader from "@/components/User-story/UserStoryHeader";
import UserStorySearchFilter from "@/components/User-story/UserStorySearchFilter";
import UserStoryCard from "@/components/User-story/UserStoryCard";
import UserStoryForm from "@/components/User-story/UserStoryForm";
import UserStoryDetail from "@/components/User-story/UserStoryDetail";
import DeleteConfirmationDialog from "@/components/User-story/DeleteConfirmationDialog";
import CodeGenerationLoadingDialog from "@/components/User-story/CodeGenerationLoadingDialog";
import AppTheme from "@/components/User-story/AppTheme";

import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useGenerateAiStoryMutation,
  useGenerateSalesforceCodeMutation,
  useGetCollaboratorUserStoriesQuery,
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery, useGetProjectByIdQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery, useMapGithubIdsToUserIdsMutation } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import { useSendUserStoryAssignmentNotificationMutation } from "@/features/notificationApiSlice";

// Define styled components that were previously in page.js, if they are only used here.
// If they are generic enough, they can be moved to a shared styles file or to AppTheme.

// Re-defining HeaderCard only if it's strictly used here and not generic
const HeaderCard = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)"
      : "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)",
  color: "white",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 10px 30px rgba(0,0,0,0.5), 0 -5px 15px rgba(255,255,255,0.05)"
      : "0 10px 30px rgba(0,0,0,0.2), 0 -5px 15px rgba(255,255,255,0.1)",
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
  // Note: keyframes 'rotate' used here needs to be defined or imported
  // For simplicity, defining it here or ensuring AppTheme exports it is needed.
  // For now, removing the animation if `rotate` is not globally available or passed.
  // "&::before": { ... animation: `${rotate} 20s linear infinite`, ... }
}));

const UserStoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId, projectId } = params;

  // State for forms and views
  const [activePanel, setActivePanel] = useState("list");
  const [selectedStory, setSelectedStory] = useState(null);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // State for code generation loading and status
  const [isGeneratingCodeProcess, setIsGeneratingCodeProcess] = useState(false);
  const [currentGenerationStatus, setCurrentGenerationStatus] = useState("");
  const [completedGenerationSteps, setCompletedGenerationSteps] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [activeGenerationStoryId, setActiveGenerationStoryId] = useState(null);

  // Form fields state
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");
  const [storyStatus, setStoryStatus] = useState("PLANNING");
  const [storyPriority, setStoryPriority] = useState("Medium");
  const [estimatedTime, setEstimatedTime] = useState("");

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for theme mode, initialized from RTK Query
  const {
    data: themeData,
    isLoading: isThemeLoading,
    isError: isThemeError,
  } = useGetThemeQuery(userId, {
    skip: !userId,
  });

  const themeMode = themeData?.theme || "light";

  // RTK Query Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const userRole = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  const projectGithubRepoUrl = "https://github.com/your-org/your-repo-name"; // Placeholder

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    { projectId, githubId },
    { skip: !projectId || !githubId || userRole !== "developer" }
  );
  const { data: developerUserStories } = useGetDeveloperUserStoriesQuery(
    githubId,
    { skip: !githubId }
  );
  const {
    data: userStoriesData,
    isLoading: storiesLoading,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(projectId, { skip: !projectId });

  const { data: collobratorUserStories } = useGetCollaboratorUserStoriesQuery({
    userId: userId,
    projectId: projectId,
  });

  const { data: collaboratorsData, isLoading: collaboratorsLoading } =
    useGetCollaboratorsQuery(projectId, { skip: !projectId });

  const [createUserStory, { isLoading: isCreating }] =
    useCreateUserStoryMutation();
  const [updateUserStory, { isLoading: isUpdating }] =
    useUpdateUserStoryMutation();
  const [deleteUserStory, { isLoading: isDeleting }] =
    useDeleteUserStoryMutation();
  const [generateAiStory, { isLoading: isGenerating }] =
    useGenerateAiStoryMutation();
  const [triggerSalesforceCodeGeneration] = useGenerateSalesforceCodeMutation();
  const [sendUserStoryAssignmentNotification] = useSendUserStoryAssignmentNotificationMutation();
  const [mapGithubIdsToUserIds] = useMapGithubIdsToUserIdsMutation();

  const { data: projectData } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const canManageStories =
    userRole === "manager" ||
    developerPermissions?.includes("User story creation");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => {
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
    setStoryStatus("PLANNING");
    setStoryPriority("Medium");
    setEstimatedTime("");
    setSelectedStory(null);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setActivePanel("create");
  };

  const handleOpenEditForm = (story) => {
    setSelectedStory(story);
    setUserStoryTitle(story.userStoryTitle);
    setDescription(story.description);
    setAcceptanceCriteria(story.acceptanceCriteria);
    setTestingScenarios(story.testingScenarios);
    setSelectedCollaboratorGithubIds(
      story.collaborators?.map((c) => c.githubId) || []
    );
    setGeneratedStoryContent(story.aiEnhancedUserStory || "");
    setStoryStatus(story.status || "PLANNING");
    setStoryPriority(story.priority || "Medium");
    setEstimatedTime(story.estimatedTime || "");
    setActivePanel("edit");
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setActivePanel("view");
  };

  const handleOpenDeleteDialog = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setDeleteDialogOpen(false);
    if (!isGeneratingCodeProcess) {
      setIsGeneratingCodeProcess(false);
      setCompletedGenerationSteps([]);
      setCurrentGenerationStatus("");
      setGenerationError(null);
      setGithubResult(null);
      setActiveGenerationStoryId(null);
    }
  };

  const handleCollaboratorChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCollaboratorGithubIds((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleGenerateStory = async () => {
    if (!userStoryTitle || !description) {
      showSnackbar(
        "Please fill in Title and Description before generating AI content.",
        "warning"
      );
      return;
    }
    try {
      const result = await generateAiStory({
        userStoryTitle,
        description,
        acceptanceCriteria,
        testingScenarios,
      }).unwrap();
      setGeneratedStoryContent(result.aiEnhancedText);
      setStoryStatus("IN REVIEW");
      showSnackbar("AI content generated successfully!");
    } catch (err) {
      const msg = err.data?.message || err.message || "Failed to generate AI content.";
      if (msg.includes("Gemini integration not configured") || msg.includes("AI service configuration error")) {
        showSnackbar("Please add your Gemini or OpenAI API key in settings to use AI features.", "error");
      } else {
        showSnackbar(msg, "error");
      }
    }
  };

  const handleGenerateSalesforceCode = async () => {
    const storyToGenerate = selectedStory;
    if (!storyToGenerate?._id) {
      showSnackbar("Please select a user story first.", "warning");
      return;
    }
    if (!projectGithubRepoUrl) {
      showSnackbar(
        "Project GitHub repository URL is not configured. Please update project settings.",
        "error"
      );
      return;
    }

    setIsGeneratingCodeProcess(true);
    setActiveGenerationStoryId(storyToGenerate._id);
    setCompletedGenerationSteps([]);
    setCurrentGenerationStatus("AI code generation initiated...");
    setGenerationError(null);
    setGithubResult(null);

    setCompletedGenerationSteps([
      { message: "AI code generation initiated..." },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-stories/${storyToGenerate._id}/generate-salesforce-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            projectId,
            githubRepoUrl: projectGithubRepoUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setGenerationError(
          errorData.message ||
            "An unknown error occurred during generation setup."
        );
        setCurrentGenerationStatus("Failed to start.");
        showSnackbar(
          errorData.message || "Failed to start code generation.",
          "error"
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lastIndex = 0;
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n\n", lastIndex)) !== -1) {
          const eventString = buffer.substring(lastIndex, newlineIndex);
          lastIndex = newlineIndex + 2;

          if (eventString.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(eventString.substring(6));

              setCompletedGenerationSteps((prev) => {
                if (
                  prev.length === 0 ||
                  prev[prev.length - 1]?.message !== eventData.message
                ) {
                  return [...prev, { message: eventData.message }];
                }
                return prev;
              });

              setCurrentGenerationStatus(eventData.message);

              if (eventData.type === "complete") {
                setGithubResult(eventData);
                showSnackbar(
                  "Salesforce code generated and PR created successfully!",
                  "success"
                );
                refetchUserStories();
                setSelectedStory((prev) => ({
                  ...prev,
                  githubBranch: eventData.githubBranch,
                  prUrl: eventData.prUrl,
                  status: "AI DEVELOPED",
                }));
              } else if (eventData.type === "error") {
                setGenerationError(eventData.message);
                setCurrentGenerationStatus("Process failed.");
                showSnackbar(eventData.message, "error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
        buffer = buffer.substring(lastIndex);
      }
    } catch (err) {
      const msg = err.data?.message || err.message || "Network error during code generation.";
      if (msg.includes("Gemini integration not configured") || msg.includes("AI service configuration error")) {
        showSnackbar("Please add your Gemini or OpenAI API key in settings to use AI features.", "error");
      } else {
        showSnackbar(msg, "error");
      }
      setGenerationError(msg);
      setCurrentGenerationStatus("Failed to connect or stream.");
    } finally {
      setTimeout(() => {
        setIsGeneratingCodeProcess(false);
        setActiveGenerationStoryId(null);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    const storyData = {
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaboratorGithubIds: selectedCollaboratorGithubIds,
      aiEnhancedUserStory: generatedStoryContent,
      status: storyStatus,
      priority: storyPriority,
      estimatedTime: estimatedTime,
    };

    try {
      if (selectedStory && activePanel === "edit") {
        await updateUserStory({
          userStoryId: selectedStory._id,
          ...storyData,
        }).unwrap();
        showSnackbar("User story updated successfully!");
      } else {
        await createUserStory({ projectId, ...storyData }).unwrap();
        showSnackbar("User story created successfully!");
      }
      resetForm();
      refetchUserStories();
      setActivePanel("list");

      if (selectedCollaboratorGithubIds.length > 0) {
        const { userIds } = await mapGithubIdsToUserIds(selectedCollaboratorGithubIds).unwrap();
        await sendUserStoryAssignmentNotification({
          collaboratorIds: userIds,
          userStoryTitle: userStoryTitle,
          projectId: projectId,
          projectName: projectData?.project?.projectName || "Project",
        });
      }
    } catch (err) {
      showSnackbar(err.data?.message || "An error occurred.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserStory(storyToDelete._id).unwrap();
      showSnackbar("User story deleted successfully!");
      handleCloseDialogs();
      refetchUserStories();
      setActivePanel("list");
      setSelectedStory(null);
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to delete user story.",
        "error"
      );
    }
  };

  const allUserStories =
    userRole === "developer"
      ? collobratorUserStories?.userStories || []
      : userStoriesData?.userStories || [];

  const filteredUserStories = useMemo(() => {
    return allUserStories?.filter((story) => {
      const matchesSearch = story.userStoryTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCompletedStatus = showCompleted
        ? story.status === "COMPLETED"
        : story.status !== "COMPLETED";
      return matchesSearch && matchesCompletedStatus;
    });
  }, [allUserStories, searchTerm, showCompleted]);

  filteredUserStories?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <AppTheme
      themeMode={themeMode}
      isThemeLoading={isThemeLoading}
      isThemeError={isThemeError}
    >
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.primary,
          overflowX: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "radial-gradient(circle at 20% 30%, rgba(128, 176, 255, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(224, 176, 255, 0.1) 0%, transparent 30%)"
                : "radial-gradient(circle at 20% 30%, rgba(94, 114, 228, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(17, 205, 239, 0.1) 0%, transparent 30%)",
            zIndex: 0,
          },
        }}
      >
        {/* Left Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", sm: 350 },
            flexShrink: 0,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
            p: 3,
            display:
              activePanel === "list" ? "flex" : { xs: "none", sm: "flex" },
            flexDirection: "column",
            overflowY: "auto",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "5px 0 15px rgba(0,0,0,0.5)"
                : "5px 0 15px rgba(0,0,0,0.1)",
            zIndex: 1,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(45deg, rgba(128,176,255,0.05) 0%, transparent 50%, rgba(224,176,255,0.05) 100%)"
                  : "linear-gradient(45deg, rgba(94,114,228,0.05) 0%, transparent 50%, rgba(17,205,239,0.05) 100%)",
              opacity: 0.3,
              zIndex: -1,
            },
          }}
        >
          <UserStoryHeader
            canManageStories={canManageStories}
            onOpenCreateForm={handleOpenCreateForm}
          />

          <UserStorySearchFilter
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            showCompleted={showCompleted}
            onShowCompletedChange={setShowCompleted}
          />

          {storiesLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : filteredUserStories?.length === 0 ? (
            <Box textAlign="center" py={2}>
              <Typography color="text.secondary" variant="body2">
                No user stories found.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: "auto" }}>
              {filteredUserStories?.map((story) => (
                <UserStoryCard
                  key={story._id}
                  story={story}
                  isSelected={selectedStory?._id === story._id}
                  onClick={() => handleViewStory(story)}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "transparent",
            overflowY: "auto",
            display:
              activePanel !== "list" ? "flex" : { xs: "none", sm: "flex" },
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          {activePanel === "create" || activePanel === "edit" ? (
            <UserStoryForm
              activePanel={activePanel}
              selectedStory={selectedStory}
              userStoryTitle={userStoryTitle}
              setUserStoryTitle={setUserStoryTitle}
              description={description}
              setDescription={setDescription}
              acceptanceCriteria={acceptanceCriteria}
              setAcceptanceCriteria={setAcceptanceCriteria}
              testingScenarios={testingScenarios}
              setTestingScenarios={setTestingScenarios}
              storyStatus={storyStatus}
              setStoryStatus={setStoryStatus}
              storyPriority={storyPriority}
              setStoryPriority={setStoryPriority}
              estimatedTime={estimatedTime}
              setEstimatedTime={setEstimatedTime}
              selectedCollaboratorGithubIds={selectedCollaboratorGithubIds}
              handleCollaboratorChange={handleCollaboratorChange}
              generatedStoryContent={generatedStoryContent}
              handleGenerateStory={handleGenerateStory}
              isGenerating={isGenerating}
              handleSubmit={handleSubmit}
              isCreating={isCreating}
              isUpdating={isUpdating}
              onCancel={() => setActivePanel("list")}
              collaboratorsData={collaboratorsData}
              collaboratorsLoading={collaboratorsLoading}
            />
          ) : (
            <UserStoryDetail
              selectedStory={selectedStory}
              onBackToList={() => setActivePanel("list")}
              onOpenEditForm={handleOpenEditForm}
              onOpenDeleteDialog={handleOpenDeleteDialog}
              canManageStories={canManageStories}
              projectGithubRepoUrl={projectGithubRepoUrl}
              handleGenerateSalesforceCode={handleGenerateSalesforceCode}
              isGeneratingCodeProcess={isGeneratingCodeProcess}
              activeGenerationStoryId={activeGenerationStoryId}
            />
          )}
        </Box>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCloseDialogs}
          storyToDelete={storyToDelete}
          onConfirmDelete={handleDelete}
          isDeleting={isDeleting}
        />

        <CodeGenerationLoadingDialog
          open={
            isGeneratingCodeProcess &&
            activeGenerationStoryId === selectedStory?._id
          }
          onClose={handleCloseDialogs}
          currentGenerationStatus={currentGenerationStatus}
          completedGenerationSteps={completedGenerationSteps}
          generationError={generationError}
          githubResult={githubResult}
          projectGithubRepoUrl={projectGithubRepoUrl}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
};

export default UserStoryPage;
