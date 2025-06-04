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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  Grid,
  Paper,
  Chip,
  Link as MuiLink, // Renamed to avoid conflict with NextLink if used
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import CallSplitIcon from "@mui/icons-material/CallSplit";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ThemeProvider, createTheme } from "@mui/material/styles";

// RTK Query Hooks
import { useGetProjectByIdQuery } from "@/features/projectApiSlice";
import {
  useGetGitHubRepoBranchesQuery,
  useCreateGitHubBranchMutation,
  useDeleteGitHubBranchMutation,
  useGetPullRequestsQuery,
  useCreatePullRequestMutation,
  useUpdatePullRequestMutation,
} from "@/features/githubApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice"; // For reviewers
import { ChevronLeft } from "lucide-react";

// Define a theme or import your existing lightTheme
const pageTheme = createTheme({
  palette: {
    primary: { main: "#4f46e5" },
    secondary: { main: "#0ea5e9" },
    success: { main: "#22c55e" },
    error: { main: "#ef4444" },
    warning: { main: "#f97316" },
    background: { default: "#f9fafb", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 700,
      fontSize: "1.75rem",
      lineHeight: 1.2,
      marginBottom: "1rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.3,
      marginBottom: "0.75rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          padding: "6px 16px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f3f4f6",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e5e7eb",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-root": {
            // Style buttons in toolbar
            marginRight: "8px",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#f0f9ff",
          color: "#4f46e5",
          fontWeight: 600,
          borderBottom: "1px solid #e5e7eb",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { borderTop: "1px solid #e5e7eb", padding: "12px 16px" },
      },
    },
  },
});

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
  const [baseBranchForNew, setBaseBranchForNew] = useState(""); // Renamed to avoid conflict

  const [openCreatePrDialog, setOpenCreatePrDialog] = useState(false);
  const [prTitle, setPrTitle] = useState("");
  const [prDescription, setPrDescription] = useState("");
  const [prBaseBranch, setPrBaseBranch] = useState(""); // Target branch for PR
  const [prCompareBranch, setPrCompareBranch] = useState(""); // Source branch for PR
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  const [prToEdit, setPrToEdit] = useState(null); // For PR editing dialog
  const [openEditPrDialog, setOpenEditPrDialog] = useState(false);

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
          // Allow for longer paths if repo is in a subgroup
          setOwner(pathParts[0]);
          setRepo(pathParts.slice(1).join("/")); // Join remaining parts for repo name
        }
        // Attempt to fetch default branch (this usually requires another API call or is part of repo details)
        // For now, we'll assume it might be part of projectData or set a common default
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
  ); // Default to open PRs

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
  // Memoize branches to prevent unnecessary re-renders of DataGrid
  const branches = useMemo(
    () =>
      (branchesData?.branches || []).map((b) => ({
        name: b.name,
        protected: b.protected,
        commitSha: b.commit.sha,
      })),
    [branchesData]
  );
  const pullRequests = useMemo(() => prData || [], [prData]); // Assuming transformResponse in slice returns array directly
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
      !confirm(
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
    // Reviewers and branches are not typically editable after PR creation via simple PATCH
    // Focus on title and description for editing.
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
      !confirm(`Are you sure you want to close PR #${prNumber}?`)
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

  // Columns for DataGrids
  const branchColumns = [
    {
      field: "name",
      headerName: "Branch Name",
      flex: 1.5,
      renderCell: (params) => (
        <MuiLink
          href={`https://github.com/${owner}/${repo}/tree/${params.value}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          {params.value}
          {params.row.name === defaultBranchName && (
            <Chip
              label="default"
              size="small"
              sx={{
                ml: 1,
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            />
          )}
          {params.row.protected && (
            <Chip
              label="protected"
              size="small"
              sx={{
                ml: 1,
                bgcolor: "warning.light",
                color: "warning.contrastText",
              }}
            />
          )}
        </MuiLink>
      ),
    },
    {
      field: "commitSha",
      headerName: "Last Commit SHA",
      flex: 1,
      valueGetter: (params) => params.row?.commitSha?.substring(0, 7) || "N/A",
      renderCell: (params) =>
        params.row.commitSha ? (
          <MuiLink
            href={`https://github.com/${owner}/${repo}/commit/${params.row.commitSha}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: "none" }}
          >
            {params.value}
          </MuiLink>
        ) : (
          "N/A"
        ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.5,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete Branch"
          onClick={() => handleDeleteBranch(params.row.name)}
          disabled={
            params.row.name === defaultBranchName || params.row.protected
          } // Disable delete for default or protected branches
          color="error"
        />,
        <GridActionsCellItem
          icon={<OpenInNewIcon />}
          label="View on GitHub"
          onClick={() =>
            window.open(
              `https://github.com/${owner}/${repo}/tree/${params.row.name}`,
              "_blank"
            )
          }
        />,
      ],
    },
  ];

  const prColumns = [
    {
      field: "titleWithLink",
      headerName: "PR Title",
      flex: 2.5,
      renderCell: (params) => (
        <MuiLink
          href={params.row.html_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: "none", fontWeight: 500 }}
        >
          #{params.row.number} {params.row.title}
        </MuiLink>
      ),
    },
    {
      field: "userLogin",
      headerName: "Author",
      flex: 1,
      valueGetter: (params) => params?.row?.user?.login || "N/A",
    },
    {
      field: "state",
      headerName: "Status",
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "open" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "reviewersList",
      headerName: "Reviewers",
      flex: 1.5,
      valueGetter: (params) =>
        params?.row?.requested_reviewers?.map((r) => r.login).join(", ") ||
        "None",
      renderCell: (params) => (
        <Tooltip
          title={
            params.row.requested_reviewers?.map((r) => r.login).join(", ") ||
            "No reviewers assigned"
          }
        >
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.row.requested_reviewers?.length > 0
              ? params.row.requested_reviewers.map((r) => (
                  <Chip
                    key={r.login}
                    label={r.login}
                    avatar={
                      <Avatar
                        src={r.avatar_url}
                        sx={{ width: 20, height: 20 }}
                      />
                    }
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))
              : "None"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit PR"
          onClick={() => handleOpenEditPrDialog(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />} // Using DeleteIcon for "Close PR" action
          label="Close PR"
          onClick={() => handleClosePR(params.row.number)}
          color="error"
          disabled={params.row.state === "closed"}
        />,
        <GridActionsCellItem
          icon={<OpenInNewIcon />}
          label="View on GitHub"
          onClick={() => window.open(params.row.html_url, "_blank")}
        />,
      ],
    },
  ];

  if (projectLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 128px)"
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (projectIsError || !project) {
    return (
      <ThemeProvider theme={pageTheme}>
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load project details or project not found.
        </Alert>
      </ThemeProvider>
    );
  }
  if (!owner || !repo) {
    return (
      <ThemeProvider theme={pageTheme}>
        <Alert severity="warning" sx={{ m: 2 }}>
          GitHub repository link is missing or invalid for this project. Please
          check project settings.
        </Alert>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={pageTheme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ display: "flex", alignItems: "center", color: "text.primary" }}
        >
          <Button onClick={handleGoBack} sx={{ color: "black" }}>
            <ChevronLeft />
          </Button>
          <AccountTreeIcon
            sx={{ mr: 1.5, fontSize: "2.2rem", color: "primary.main" }}
          />{" "}
          Manage Branches & Pull Requests: {project.projectName}
        </Typography>
        <MuiLink
          href={project.githubRepoLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center", mb: 3 }}
        >
          <GitHubIcon sx={{ mr: 0.5 }} /> View Repository on GitHub{" "}
          <OpenInNewIcon sx={{ ml: 0.5, fontSize: "1rem" }} />
        </MuiLink>

        <Grid container spacing={3}>
          {/* Branches Section */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <CallSplitIcon sx={{ mr: 1, color: "secondary.main" }} />{" "}
                  Branches
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateBranchDialog}
                  size="small"
                >
                  New Branch
                </Button>
              </Box>
              {branchesLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              {branchesError && (
                <Alert severity="error">
                  Error loading branches:{" "}
                  {branchesError.data?.message || branchesError.status}
                </Alert>
              )}
              {!branchesLoading && !branchesError && (
                <Box sx={{ height: 450, width: "100%" }}>
                  <DataGrid
                    rows={branches}
                    columns={branchColumns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    density="compact"
                    getRowId={(row) => row.name}
                    autoHeight={false} // Set to true if you want grid to take content height
                    disableRowSelectionOnClick
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Pull Requests Section */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <MergeTypeIcon sx={{ mr: 1, color: "success.main" }} /> Pull
                  Requests (Open)
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreatePrDialog}
                  size="small"
                >
                  New PR
                </Button>
              </Box>
              {prsLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              {prsError && (
                <Alert severity="error">
                  Error loading pull requests:{" "}
                  {prsError.data?.message || prsError.status}
                </Alert>
              )}
              {!prsLoading && !prsError && (
                <Box sx={{ height: 450, width: "100%" }}>
                  <DataGrid
                    rows={pullRequests}
                    columns={prColumns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    density="compact"
                    getRowId={(row) => row.id || row.number}
                    autoHeight={false}
                    disableRowSelectionOnClick
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Create Branch Dialog */}
        <Dialog
          open={openCreateBranchDialog}
          onClose={handleCloseCreateBranchDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New Branch</DialogTitle>
          <DialogContent sx={{ pt: "20px !important" }}>
            <TextField
              autoFocus
              margin="dense"
              label="New Branch Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value.trim())}
              sx={{ mb: 2 }}
              helperText="No spaces or special characters (e.g., feature/new-design, fix/bug-123)"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="base-branch-select-label">
                Base Branch (Create from)
              </InputLabel>
              <Select
                labelId="base-branch-select-label"
                value={baseBranchForNew}
                label="Base Branch (Create from)"
                onChange={(e) => setBaseBranchForNew(e.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {createBranchApiError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createBranchApiError.data?.message ||
                  "Failed to create branch"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateBranchDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              variant="contained"
              disabled={creatingBranch || !newBranchName || !baseBranchForNew}
            >
              {creatingBranch ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Branch"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create PR Dialog */}
        <Dialog
          open={openCreatePrDialog}
          onClose={handleCloseCreatePrDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Create New Pull Request</DialogTitle>
          <DialogContent sx={{ pt: "20px !important" }}>
            <TextField
              autoFocus
              margin="dense"
              label="PR Title"
              type="text"
              fullWidth
              variant="outlined"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              label="PR Description (Optional, supports Markdown)"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={prDescription}
              onChange={(e) => setPrDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Grid container fullWidth spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="pr-compare-branch-label">
                    Head Branch (Your branch to merge)
                  </InputLabel>
                  <Select
                    labelId="pr-compare-branch-label"
                    value={prCompareBranch}
                    label="Head Branch (Your branch to merge)"
                    onChange={(e) => setPrCompareBranch(e.target.value)}
                  >
                    {branches
                      .filter((b) => b.name !== prBaseBranch)
                      .map((branch) => (
                        <MenuItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="pr-base-branch-label">
                    Base Branch (Target of merge)
                  </InputLabel>
                  <Select
                    labelId="pr-base-branch-label"
                    value={prBaseBranch}
                    label="Base Branch (Target of merge)"
                    onChange={(e) => setPrBaseBranch(e.target.value)}
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="reviewers-select-label">
                Assign Reviewers (Optional)
              </InputLabel>
              <Select
                labelId="reviewers-select-label"
                multiple
                value={selectedReviewers}
                onChange={handleReviewerChange}
                label="Assign Reviewers (Optional)"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((username) => {
                      const reviewer = collaborators.find(
                        (c) => c.username === username
                      );
                      return (
                        <Chip
                          key={username}
                          label={username}
                          avatar={
                            reviewer ? (
                              <Avatar
                                src={reviewer.avatarUrl}
                                alt={username}
                                sx={{ width: 20, height: 20 }}
                              />
                            ) : null
                          }
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {collaboratorsLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading collaborators...
                  </MenuItem>
                )}
                {collaborators.map((collaborator) => (
                  <MenuItem
                    key={collaborator.username}
                    value={collaborator.username}
                  >
                    <Checkbox
                      checked={
                        selectedReviewers.indexOf(collaborator.username) > -1
                      }
                      size="small"
                    />
                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1.5 }}>
                      <Avatar
                        src={collaborator.avatarUrl}
                        alt={collaborator.username}
                        sx={{ width: 28, height: 28 }}
                      />
                    </ListItemAvatar>
                    <ListItemText primary={collaborator.username} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {createPRApiError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createPRApiError.data?.message || "Failed to create PR"}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreatePrDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePR}
              variant="contained"
              disabled={
                creatingPR || !prTitle || !prBaseBranch || !prCompareBranch
              }
            >
              {creatingPR ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Pull Request"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit PR Dialog */}
        {prToEdit && (
          <Dialog
            open={openEditPrDialog}
            onClose={handleCloseEditPrDialog}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Edit Pull Request #{prToEdit.number}</DialogTitle>
            <DialogContent sx={{ pt: "20px !important" }}>
              <TextField
                autoFocus
                margin="dense"
                label="PR Title"
                type="text"
                fullWidth
                variant="outlined"
                value={prTitle} // Reusing prTitle state for editing
                onChange={(e) => setPrTitle(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                label="PR Description (Optional, supports Markdown)"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={prDescription} // Reusing prDescription state
                onChange={(e) => setPrDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="textSecondary">
                Note: Base branch, head branch, and reviewers cannot be changed
                from here after PR creation.
              </Typography>
              {updatePRApiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {updatePRApiError.data?.message || "Failed to update PR"}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditPrDialog} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePR}
                variant="contained"
                disabled={updatingPR || !prTitle}
              >
                {updatingPR ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ManagePrBranchesPage;
