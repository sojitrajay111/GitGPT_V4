// app/[userId]/create-project/[projectId]/manager-pr-branches/page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import AccountTreeIcon from "@mui/icons-material/AccountTreeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ChevronLeft } from "lucide-react";

// RTK Query Hooks
import { useGetProjectByIdQuery } from "@/features/projectApiSlice";
import {
  useGetGitHubRepoBranchesQuery,
  useCreateGitHubBranchMutation,
  useDeleteGitHubBranchMutation,
  useGetPullRequestsQuery,
  useCreatePullRequestMutation,
  useUpdatePullRequestMutation,
  useGetUserAndGithubDataQuery,
} from "@/features/githubApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetCollaboratorPermissionsQuery } from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetThemeQuery, useUpdateThemeMutation } from "@/features/themeApiSlice";

// Components
import { futuristicLightTheme, futuristicDarkTheme } from "@/components/manager-pr-branches_components/themes";
import { BranchManagement } from "@/components/manager-pr-branches_components/BranchManagement";
import { PRManagement } from "@/components/manager-pr-branches_components/PRManagement";
import {
  CreateBranchDialog,
  CreatePRDialog,
  EditPRDialog,
} from "@/components/manager-pr-branches_components/Dialogs";

const ManagePrBranchesPage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const router = useRouter();

  const [owner, setOwner] = useState(null);
  const [repo, setRepo] = useState(null);
  const [defaultBranchName, setDefaultBranchName] = useState(null);

  // Dialog states
  const [openCreateBranchDialog, setOpenCreateBranchDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [baseBranchForNew, setBaseBranchForNew] = useState("");

  const [openCreatePrDialog, setOpenCreatePrDialog] = useState(false);
  const [prTitle, setPrTitle] = useState("");
  const [prDescription, setPrDescription] = useState("");
  const [prBaseBranch, setPrBaseBranch] = useState("");
  const [prCompareBranch, setPrCompareBranch] = useState("");
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  const [prToEdit, setPrToEdit] = useState(null);
  const [openEditPrDialog, setOpenEditPrDialog] = useState(false);

  const { data: userData } = useGetUserAndGithubDataQuery(userId);

  const user_role = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    projectId && githubId && user_role === "developer"
      ? { projectId, githubId }
      : skipToken
  );

  // Data fetching
  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectIsError,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  useEffect(() => {
    if (projectData?.project?.githubRepoLink) {
      try {
        const url = new URL(projectData.project.githubRepoLink);
        const pathParts = url.pathname
          .substring(1)
          .replace(/\.git$/, "")
          .split("/");
        if (pathParts.length >= 2) {
          setOwner(pathParts[0]);
          setRepo(pathParts.slice(1).join("/"));
        }
        setDefaultBranchName(projectData.project.defaultBranch || "main");
      } catch (e) {
        console.error("Failed to parse GitHub repo link:", e);
      }
    }
  }, [projectData]);

  const {
    data: branchesData,
    isLoading: branchesLoading,
    refetch: refetchBranches,
    error: branchesError,
  } = useGetGitHubRepoBranchesQuery({ owner, repo }, { skip: !owner || !repo });

  const {
    data: prData,
    isLoading: prsLoading,
    refetch: refetchPRs,
    error: prsError,
  } = useGetPullRequestsQuery(
    { owner, repo, state: "open" },
    { skip: !owner || !repo }
  );

  const { data: collaboratorsData, isLoading: collaboratorsLoading } =
    useGetCollaboratorsQuery(projectId, { skip: !projectId });

  // Mutations
  const [
    createGitHubBranch,
    { isLoading: creatingBranch, error: createBranchApiError },
  ] = useCreateGitHubBranchMutation();
  const [
    deleteGitHubBranch,
    { isLoading: deletingBranch, error: deleteBranchApiError },
  ] = useDeleteGitHubBranchMutation();
  const [
    createPullRequest,
    { isLoading: creatingPR, error: createPRApiError },
  ] = useCreatePullRequestMutation();
  const [
    updatePullRequest,
    { isLoading: updatingPR, error: updatePRApiError },
  ] = useUpdatePullRequestMutation();

  const project = projectData?.project;
  const branches = useMemo(
    () =>
      (branchesData?.branches || []).map((b) => ({
        name: b.name,
        protected: b.protected,
        commitSha: b.commit.sha,
        isDefault: b.name === defaultBranchName,
      })),
    [branchesData, defaultBranchName]
  );
  const pullRequests = useMemo(() => prData || [], [prData]);
  const collaborators = useMemo(
    () => collaboratorsData?.collaborators || [],
    [collaboratorsData]
  );

  // Branch Dialog Handlers
  const handleOpenCreateBranchDialog = () => {
    setNewBranchName("");
    setBaseBranchForNew(
      defaultBranchName || (branches.length > 0 ? branches[0].name : "")
    );
    setOpenCreateBranchDialog(true);
  };
  const handleCloseCreateBranchDialog = () => setOpenCreateBranchDialog(false);

  const handleCreateBranch = async () => {
    if (!newBranchName || !baseBranchForNew || !owner || !repo) return;
    try {
      await createGitHubBranch({
        owner,
        repo,
        newBranchName,
        baseBranch: baseBranchForNew,
      }).unwrap();
      handleCloseCreateBranchDialog();
      refetchBranches();
    } catch (err) {
      console.error("Failed to create branch:", err);
    }
  };

  const handleDeleteBranch = async (branchNameToDelete) => {
    if (
      !owner ||
      !repo ||
      !window.confirm(
        `Are you sure you want to delete branch "${branchNameToDelete}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await deleteGitHubBranch({
        owner,
        repo,
        branchName: branchNameToDelete,
      }).unwrap();
      refetchBranches();
    } catch (err) {
      console.error("Failed to delete branch:", err);
      alert(
        `Error: ${
          err.data?.message ||
          "Could not delete branch. It might be protected or the default branch."
        }`
      );
    }
  };

  // PR Dialog Handlers
  const handleOpenCreatePrDialog = () => {
    setPrTitle("");
    setPrDescription("");
    setPrBaseBranch(
      defaultBranchName || (branches.length > 0 ? branches[0].name : "")
    );
    setPrCompareBranch("");
    setSelectedReviewers([]);
    setOpenCreatePrDialog(true);
  };
  const handleCloseCreatePrDialog = () => setOpenCreatePrDialog(false);

  const handleCreatePR = async () => {
    if (!prTitle || !prBaseBranch || !prCompareBranch || !owner || !repo) {
      alert("Please fill in all required fields for the Pull Request.");
      return;
    }
    if (prBaseBranch === prCompareBranch) {
      alert("Base and Head branches cannot be the same.");
      return;
    }
    try {
      await createPullRequest({
        owner,
        repo,
        title: prTitle,
        body: prDescription,
        head: prCompareBranch,
        base: prBaseBranch,
        reviewers: selectedReviewers,
      }).unwrap();
      handleCloseCreatePrDialog();
      refetchPRs();
    } catch (err) {
      console.error("Failed to create PR:", err);
    }
  };

  const handleOpenEditPrDialog = (pr) => {
    setPrToEdit(pr);
    setPrTitle(pr.title);
    setPrDescription(pr.body || "");
    setOpenEditPrDialog(true);
  };
  const handleCloseEditPrDialog = () => {
    setOpenEditPrDialog(false);
    setPrToEdit(null);
    setPrTitle("");
    setPrDescription("");
  };

  const handleUpdatePR = async () => {
    if (!prToEdit || !prTitle) return;
    try {
      await updatePullRequest({
        owner,
        repo,
        pullNumber: prToEdit.number,
        title: prTitle,
        body: prDescription,
      }).unwrap();
      handleCloseEditPrDialog();
      refetchPRs();
    } catch (err) {
      console.error("Failed to update PR:", err);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleClosePR = async (prNumber) => {
    if (
      !owner ||
      !repo ||
      !window.confirm(`Are you sure you want to close PR #${prNumber}?`)
    )
      return;
    try {
      await updatePullRequest({
        owner,
        repo,
        pullNumber: prNumber,
        state: "closed",
      }).unwrap();
      refetchPRs();
    } catch (err) {
      console.error("Failed to close PR:", err);
      alert(`Error: ${err.data?.message || "Could not close PR."}`);
    }
  };

  const handleReviewerChange = (event) => {
    const { value } = event.target;
    setSelectedReviewers(typeof value === "string" ? value.split(",") : value);
  };

  const { data: themeData, isLoading: isThemeLoading, refetch: refetchTheme } = useGetThemeQuery(userId);
  const [updateTheme] = useUpdateThemeMutation();
  const darkMode = themeData?.theme === "dark";

  const handleThemeToggle = async () => {
    try {
      const newTheme = darkMode ? "light" : "dark";
      await updateTheme({ userId, theme: newTheme }).unwrap();
      refetchTheme();
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const currentTheme = darkMode ? futuristicDarkTheme : futuristicLightTheme;

  if (projectLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="calc(100vh - 128px)"
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading Project Data...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (projectIsError || !project) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" icon={<ErrorOutlineIcon />}>
            Failed to load project details or project not found. Please try
            again or check project ID.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  if (!owner || !repo) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" icon={<InfoOutlinedIcon />}>
            GitHub repository link is missing or invalid for this project.
            Please check the project settings.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: currentTheme.palette.background.default,
          color: currentTheme.palette.text.primary,
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ChevronLeft />}
            sx={{ mr: 2, borderColor: "divider", color: "text.secondary" }}
          >
            Back
          </Button>
          <AccountTreeIcon
            sx={{ mr: 1.5, fontSize: "2.5rem", color: "primary.main" }}
          />
          <Typography variant="h5" component="h1">
            Manage Branches & PRs:{" "}
            <span
              style={{
                fontWeight: 700,
                color: futuristicLightTheme.palette.primary.dark,
              }}
            >
              {project.projectName}
            </span>
          </Typography>
        </Box>
        <MuiLink
          href={project.githubRepoLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            mb: 4,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <GitHubIcon sx={{ mr: 0.5 }} /> View Repository on GitHub
          <OpenInNewIcon sx={{ ml: 0.5, fontSize: "1.1rem" }} />
        </MuiLink>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <BranchManagement
              branches={branches}
              branchesLoading={branchesLoading}
              branchesError={branchesError}
              handleOpenCreateBranchDialog={handleOpenCreateBranchDialog}
              handleDeleteBranch={handleDeleteBranch}
              owner={owner}
              repo={repo}
              defaultBranchName={defaultBranchName}
              currentTheme={currentTheme}
            />
          </Grid>
          <Grid item xs={12}>
            <PRManagement
              pullRequests={pullRequests}
              prsLoading={prsLoading}
              prsError={prsError}
              handleOpenCreatePrDialog={handleOpenCreatePrDialog}
              handleOpenEditPrDialog={handleOpenEditPrDialog}
              handleClosePR={handleClosePR}
              user_role={user_role}
              developerPermissions={developerPermissions}
              currentTheme={currentTheme}
            />
          </Grid>
        </Grid>

        <CreateBranchDialog
          open={openCreateBranchDialog}
          onClose={handleCloseCreateBranchDialog}
          newBranchName={newBranchName}
          setNewBranchName={setNewBranchName}
          baseBranchForNew={baseBranchForNew}
          setBaseBranchForNew={setBaseBranchForNew}
          branches={branches}
          handleCreateBranch={handleCreateBranch}
          creatingBranch={creatingBranch}
          createBranchApiError={createBranchApiError}
        />

        <CreatePRDialog
          open={openCreatePrDialog}
          onClose={handleCloseCreatePrDialog}
          prTitle={prTitle}
          setPrTitle={setPrTitle}
          prDescription={prDescription}
          setPrDescription={setPrDescription}
          prBaseBranch={prBaseBranch}
          setPrBaseBranch={setPrBaseBranch}
          prCompareBranch={prCompareBranch}
          setPrCompareBranch={setPrCompareBranch}
          branches={branches}
          selectedReviewers={selectedReviewers}
          setSelectedReviewers={setSelectedReviewers}
          collaborators={collaborators}
          collaboratorsLoading={collaboratorsLoading}
          handleCreatePR={handleCreatePR}
          creatingPR={creatingPR}
          createPRApiError={createPRApiError}
          handleReviewerChange={handleReviewerChange}
        />

        <EditPRDialog
          open={openEditPrDialog}
          onClose={handleCloseEditPrDialog}
          prToEdit={prToEdit}
          prTitle={prTitle}
          setPrTitle={setPrTitle}
          prDescription={prDescription}
          setPrDescription={setPrDescription}
          handleUpdatePR={handleUpdatePR}
          updatingPR={updatingPR}
          updatePRApiError={updatePRApiError}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ManagePrBranchesPage;