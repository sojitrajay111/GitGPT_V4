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
  Link as MuiLink,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline"; // Using outline for a lighter feel
import MergeTypeIcon from "@mui/icons-material/MergeType";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CloseIcon from "@mui/icons-material/Close";

import AccountTreeIcon from "@mui/icons-material/AccountTreeOutlined"; // Outline
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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
  useGetUserAndGithubDataQuery,
} from "@/features/githubApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice"; // For reviewers
import { ChevronLeft } from "lucide-react";
import { useGetCollaboratorPermissionsQuery } from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

// Futuristic Light Theme
const futuristicLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3E63DD", // A vibrant, futuristic blue
      light: "#7986FA",
      dark: "#2A4AB0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00C49F", // A cool teal/mint
      light: "#66FFC2",
      dark: "#008C73",
      contrastText: "#000000",
    },
    background: {
      default: "#F4F7F9", // Very light grey, almost white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50", // Dark grey, not quite black
      secondary: "#566573", // Lighter grey
      disabled: "#AEB6BF",
    },
    error: { main: "#E74C3C" }, // Softer red
    warning: { main: "#F39C12" }, // Softer orange
    success: { main: "#2ECC71" }, // Softer green
    info: { main: "#3498DB" }, // Softer blue for info
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 700,
      fontSize: "1.65rem", // Slightly reduced for modern feel
      lineHeight: 1.3,
      color: "#2C3E50",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.15rem", // Slightly reduced
      lineHeight: 1.4,
      color: "#2C3E50",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    body1: {
      color: "#2C3E50",
    },
    body2: {
      color: "#566573",
    },
  },
  shape: {
    borderRadius: 10, // More rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 20px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#2A4AB0",
          },
        },
        outlinedPrimary: {
          borderColor: "#3E63DD",
          "&:hover": {
            backgroundColor: "rgba(62, 99, 221, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(100, 120, 150, 0.08)", // Softer, more diffused shadow
          // backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))" // Subtle gradient for depth
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #E0E6ED",
          backgroundColor: "#FFFFFF",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8F9FA", // Lighter header
            borderBottom: "1px solid #E0E6ED",
            color: "#3E63DD", // Primary color for header text
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "uppercase",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #F0F2F5", // Lighter cell borders
            fontSize: "0.875rem",
            "&:focus": {
              outline: "none", // Remove default focus outline
            },
            "&:focus-within": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "rgba(62, 99, 221, 0.04)", // Subtle hover
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(62, 99, 221, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(62, 99, 221, 0.1)",
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #E0E6ED",
          },
          "& .MuiDataGrid-iconButtonContainer": {
            "& .MuiIconButton-root": {
              color: "#566573", // Neutral color for icons
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16, // More prominent rounding for dialogs
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8F9FA",
          color: "#3E63DD",
          fontWeight: 700,
          fontSize: "1.25rem",
          padding: "16px 24px",
          borderBottom: "1px solid #E0E6ED",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #E0E6ED",
          padding: "16px 24px",
          backgroundColor: "#FDFEFE",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined", // Default to outlined for a modern look
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8, // Rounded fields
            backgroundColor: "rgba(255,255,255, 0.5)", // Slight transparency if needed over a bg
            "& fieldset": {
              borderColor: "#CFD8DC", // Softer border color
            },
            "&:hover fieldset": {
              borderColor: "#B0BEC5",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3E63DD", // Primary color for focus
              boxShadow: "0 0 0 2px rgba(62, 99, 221, 0.2)", // Focus ring
            },
          },
          "& .MuiInputLabel-root": {
            color: "#566573",
            fontWeight: 500,
            "&.Mui-focused": {
              color: "#3E63DD",
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255, 0.5)",
          "& fieldset": {
            borderColor: "#CFD8DC",
          },
          "&:hover fieldset": {
            borderColor: "#B0BEC5",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#3E63DD",
            boxShadow: "0 0 0 2px rgba(62, 99, 221, 0.2)",
          },
        },
        icon: {
          color: "#3E63DD", // Color for the dropdown arrow
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: "4px 8px",
          backgroundColor: "rgba(62, 99, 221, 0.1)", // Primary light background
          color: "#2A4AB0", // Primary dark text
        },
        avatar: {
          marginLeft: "2px !important",
          marginRight: "-2px !important",
          width: "20px !important",
          height: "20px !important",
        },
        labelSmall: {
          fontSize: "0.75rem",
        },
        sizeSmall: {
          height: "24px",
          padding: "0 8px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2C3E50", // Dark tooltip for contrast
          color: "#FFFFFF",
          borderRadius: 6,
          fontSize: "0.8rem",
          padding: "6px 10px",
        },
        arrow: {
          color: "#2C3E50",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px", // Adjust padding
          alignItems: "center", // Vertically align icon and text
        },
        standardSuccess: {
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          color: "#1D8348",
          "& .MuiAlert-icon": { color: "#2ECC71" },
        },
        standardError: {
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          color: "#B03A2E",
          "& .MuiAlert-icon": { color: "#E74C3C" },
        },
        standardWarning: {
          backgroundColor: "rgba(243, 156, 18, 0.1)",
          color: "#AF640D",
          "& .MuiAlert-icon": { color: "#F39C12" },
        },
        standardInfo: {
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          color: "#21618C",
          "& .MuiAlert-icon": { color: "#3498DB" },
        },
        icon: {
          marginRight: 12, // More space between icon and text
          fontSize: 22, // Slightly larger icons
        },
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
    // Using a custom dialog for confirmation instead of window.confirm
    // This would require more state and a new dialog component.
    // For now, using window.confirm as per original logic.
    if (
      !owner ||
      !repo ||
      !window.confirm(
        // Replace with custom dialog for better UX
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
        // Replace with custom Alert/Toast notification
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
      !window.confirm(`Are you sure you want to close PR #${prNumber}?`) // Replace with custom dialog
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
      headerName: "Branch",
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MuiLink
            href={`https://github.com/${owner}/${repo}/tree/${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 500,
              color: "primary.dark",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {params.value}
          </MuiLink>
          {params.row.isDefault && (
            <Chip
              label="Default"
              size="small"
              sx={{
                backgroundColor: futuristicLightTheme.palette.primary.light,
                color: futuristicLightTheme.palette.primary.contrastText,
                height: "20px",
              }}
            />
          )}
          {params.row.protected && (
            <Chip
              label="Protected"
              size="small"
              sx={{
                backgroundColor: futuristicLightTheme.palette.warning.light,
                color: futuristicLightTheme.palette.warning.contrastText,
                height: "20px",
              }}
            />
          )}
        </Box>
      ),
    },
    {
      field: "commitSha",
      headerName: "Last Commit",
      flex: 1,
      valueGetter: (params) => params.row?.commitSha?.substring(0, 7) || "N/A",
      renderCell: (params) =>
        params.row.commitSha ? (
          <Tooltip
            title={`View commit ${params.row.commitSha} on GitHub`}
            arrow
          >
            <MuiLink
              href={`https://github.com/${owner}/${repo}/commit/${params.row.commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "monospace",
                color: "text.secondary",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {params.value}
            </MuiLink>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120, // Fixed width for actions
      getActions: (params) => [
        <Tooltip title="View on GitHub" arrow>
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="View on GitHub"
            onClick={() =>
              window.open(
                `https://github.com/${owner}/${repo}/tree/${params.row.name}`,
                "_blank"
              )
            }
            sx={{ color: "primary.main" }}
          />
        </Tooltip>,
        <Tooltip title="Delete Branch" arrow>
          <GridActionsCellItem
            icon={<DeleteIcon fontSize="small" />}
            label="Delete Branch"
            onClick={() => handleDeleteBranch(params.row.name)}
            disabled={params.row.isDefault || params.row.protected}
            sx={{
              color:
                params.row.isDefault || params.row.protected
                  ? "text.disabled"
                  : "error.main",
            }}
          />
        </Tooltip>,
      ],
    },
  ];

  const prColumns = [
    {
      field: "titleWithLink",
      headerName: "Pull Request",
      flex: 2.5,
      renderCell: (params) => (
        <Tooltip title={`View PR #${params.row.number} on GitHub`} arrow>
          <MuiLink
            href={params.row.html_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 500,
              color: "primary.dark",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            #{params.row.number}: {params.row.title}
          </MuiLink>
        </Tooltip>
      ),
    },
    {
      field: "userLogin",
      headerName: "Author",
      flex: 1,
      valueGetter: (params) => params?.row?.user?.login || "N/A",
      renderCell: (params) =>
        params.value !== "N/A" ? (
          <Chip
            avatar={
              <Avatar
                src={params.row?.user?.avatar_url}
                sx={{ width: 20, height: 20 }}
              />
            }
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ borderColor: "divider", backgroundColor: "transparent" }}
          />
        ) : (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        ),
    },
    {
      field: "state",
      headerName: "Status",
      flex: 0.7,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          icon={
            params.value === "open" ? (
              <CheckCircleOutlineIcon
                fontSize="small"
                sx={{ color: "inherit !important" }}
              />
            ) : (
              <ErrorOutlineIcon
                fontSize="small"
                sx={{ color: "inherit !important" }}
              />
            )
          }
          sx={{
            backgroundColor:
              params.value === "open"
                ? futuristicLightTheme.palette.success.light
                : futuristicLightTheme.palette.error.light,
            color:
              params.value === "open"
                ? futuristicLightTheme.palette.success.contrastText
                : futuristicLightTheme.palette.error.contrastText,
            height: "22px",
          }}
        />
      ),
    },
    {
      field: "reviewersList",
      headerName: "Reviewers",
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            overflow: "hidden",
            maxHeight: "50px",
          }}
        >
          {params.row.requested_reviewers?.length > 0 ? (
            params.row.requested_reviewers.map((r) => (
              <Tooltip key={r.login} title={r.login} arrow>
                <Avatar
                  src={r.avatar_url}
                  alt={r.login}
                  sx={{
                    width: 28,
                    height: 28,
                    border: `2px solid ${futuristicLightTheme.palette.background.paper}`,
                  }}
                />
              </Tooltip>
            ))
          ) : (
            <Typography variant="caption" color="textSecondary">
              None
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  if (user_role === "manager" || developerPermissions?.includes("Create PR")) {
    prColumns.push({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: (params) => [
        <Tooltip title="View on GitHub" arrow>
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="View on GitHub"
            onClick={() => window.open(params.row.html_url, "_blank")}
            sx={{ color: "primary.main" }}
          />
        </Tooltip>,
        <Tooltip title="Edit PR Title/Description" arrow>
          <GridActionsCellItem
            icon={<EditIcon fontSize="small" />}
            label="Edit PR"
            onClick={() => handleOpenEditPrDialog(params.row)}
            disabled={params.row.state === "closed"}
            sx={{
              color:
                params.row.state === "closed"
                  ? "text.disabled"
                  : "primary.main",
            }}
          />
        </Tooltip>,
        <Tooltip title="Close PR" arrow>
          <GridActionsCellItem
            icon={<CloseIcon fontSize="small" />}
            label="Close PR"
            onClick={() => handleClosePR(params.row.number)}
            disabled={params.row.state === "closed"}
            sx={{
              color:
                params.row.state === "closed" ? "text.disabled" : "error.main",
            }}
          />
        </Tooltip>,
      ],
    });
  } else {
    // ✅ If user doesn't have permission, still show "View on GitHub" in a separate column
    prColumns.push({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <Tooltip title="View on GitHub" arrow>
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="View on GitHub"
            onClick={() => window.open(params.row.html_url, "_blank")}
            sx={{ color: "primary.main" }}
          />
        </Tooltip>,
      ],
    });
  }

  if (projectLoading) {
    return (
      <ThemeProvider theme={futuristicLightTheme}>
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
      <ThemeProvider theme={futuristicLightTheme}>
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
      <ThemeProvider theme={futuristicLightTheme}>
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
    <ThemeProvider theme={futuristicLightTheme}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
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
          {" "}
          {/* Increased spacing */}
          {/* Branches Section */}
          <Grid item xs={12}>
            {" "}
            {/* Full width to stack */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
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
                >
                  New Branch
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              {branchesLoading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    my: 5,
                    flexDirection: "column",
                  }}
                >
                  <CircularProgress />
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Loading branches...
                  </Typography>
                </Box>
              )}
              {branchesError && (
                <Alert severity="error" icon={<ErrorOutlineIcon />}>
                  Error loading branches:{" "}
                  {branchesError.data?.message || branchesError.status}
                </Alert>
              )}
              {!branchesLoading && !branchesError && (
                <Box sx={{ height: 500, width: "100%" }}>
                  {" "}
                  {/* Increased height */}
                  <DataGrid
                    rows={branches}
                    columns={branchColumns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    getRowId={(row) => row.name}
                    disableRowSelectionOnClick
                    autoHeight={false} // Keep false if using fixed height
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          {/* Pull Requests Section */}
          <Grid item xs={12}>
            {" "}
            {/* Full width to stack */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
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
                  color="secondary" // Using secondary color for PR button
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreatePrDialog}
                  disabled={
                    !(
                      user_role === "manager" ||
                      developerPermissions?.includes("Create PR")
                    )
                  }
                >
                  New Pull Request
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              {prsLoading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    my: 5,
                    flexDirection: "column",
                  }}
                >
                  <CircularProgress color="secondary" />
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Loading pull requests...
                  </Typography>
                </Box>
              )}
              {prsError && (
                <Alert severity="error" icon={<ErrorOutlineIcon />}>
                  Error loading pull requests:{" "}
                  {prsError.data?.message || prsError.status}
                </Alert>
              )}
              {!prsLoading && !prsError && (
                <Box sx={{ height: 500, width: "100%" }}>
                  {" "}
                  {/* Increased height */}
                  <DataGrid
                    rows={pullRequests}
                    columns={prColumns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    getRowId={(row) => row.id || row.number}
                    disableRowSelectionOnClick
                    autoHeight={false} // Keep false if using fixed height
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
          PaperProps={{ elevation: 0 }}
        >
          <DialogTitle>Create New Branch</DialogTitle>
          <DialogContent sx={{ pt: "20px !important" }}>
            <TextField
              autoFocus
              margin="dense"
              label="New Branch Name"
              type="text"
              fullWidth
              value={newBranchName}
              onChange={(e) =>
                setNewBranchName(e.target.value.trim().replace(/\s+/g, "-"))
              } // Replace spaces with hyphens
              sx={{ mb: 2 }}
              helperText="e.g., feature/awesome-new-thing, fix/login-bug. Spaces will be replaced with hyphens."
              placeholder="feature/your-branch-name"
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
                MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name} {branch.isDefault && "(Default)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {createBranchApiError && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
                icon={<ErrorOutlineIcon />}
              >
                {createBranchApiError.data?.message ||
                  "Failed to create branch. Ensure the name is valid and the base branch exists."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseCreateBranchDialog}
              variant="outlined"
              sx={{ borderColor: "divider", color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              variant="contained"
              color="primary"
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
          PaperProps={{ elevation: 0 }}
        >
          <DialogTitle>Create New Pull Request</DialogTitle>
          <DialogContent sx={{ pt: "20px !important" }}>
            <TextField
              autoFocus
              margin="dense"
              label="PR Title"
              type="text"
              fullWidth
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
              placeholder="A brief, descriptive title for your pull request"
            />
            <TextField
              margin="dense"
              label="PR Description"
              type="text"
              fullWidth
              multiline
              rows={5} // Increased rows
              value={prDescription}
              onChange={(e) => setPrDescription(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Explain the changes and why they are being made. Supports Markdown."
              helperText="Tip: Use Markdown for lists, links, and code blocks."
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="pr-compare-branch-label">
                    Your Branch (Head)
                  </InputLabel>
                  <Select
                    labelId="pr-compare-branch-label"
                    value={prCompareBranch}
                    label="Your Branch (Head)"
                    onChange={(e) => setPrCompareBranch(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
                  >
                    {branches
                      .filter((b) => b.name !== prBaseBranch) // Cannot compare a branch to itself
                      .map((branch) => (
                        <MenuItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </MenuItem>
                      ))}
                  </Select>
                  <Typography variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                    The branch with your changes.
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="pr-base-branch-label">
                    Target Branch (Base)
                  </InputLabel>
                  <Select
                    labelId="pr-base-branch-label"
                    value={prBaseBranch}
                    label="Target Branch (Base)"
                    onChange={(e) => setPrBaseBranch(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.name} value={branch.name}>
                        {branch.name} {branch.isDefault && "(Default)"}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                    The branch you want to merge into.
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="reviewers-select-label">
                Assign Reviewers
              </InputLabel>
              <Select
                labelId="reviewers-select-label"
                multiple
                value={selectedReviewers}
                onChange={handleReviewerChange}
                label="Assign Reviewers"
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
                                sx={{ width: 22, height: 22 }}
                              />
                            ) : null
                          }
                          size="small"
                          onDelete={
                            selectedReviewers.length > 0
                              ? () =>
                                  setSelectedReviewers((prev) =>
                                    prev.filter((r) => r !== username)
                                  )
                              : undefined
                          }
                          deleteIcon={
                            <CloseIcon
                              onMouseDown={(event) => event.stopPropagation()}
                            />
                          }
                          sx={{
                            backgroundColor: "rgba(0, 196, 159, 0.1)",
                            color: "#005B4A",
                          }} // Secondary color chip
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {collaboratorsLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </MenuItem>
                )}
                {!collaboratorsLoading && collaborators.length === 0 && (
                  <MenuItem disabled>No collaborators found</MenuItem>
                )}
                {collaborators.map((collaborator) => (
                  <MenuItem
                    key={collaborator.username}
                    value={collaborator.username}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Checkbox
                      checked={
                        selectedReviewers.indexOf(collaborator.username) > -1
                      }
                      size="small"
                      sx={{ mr: 1, p: 0.5 }}
                    />
                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1.5 }}>
                      <Avatar
                        src={collaborator.avatarUrl}
                        alt={collaborator.username}
                        sx={{ width: 30, height: 30 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={collaborator.username}
                      secondary={collaborator.githubId}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {createPRApiError && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
                icon={<ErrorOutlineIcon />}
              >
                {createPRApiError.data?.message ||
                  "Failed to create PR. Check branch names and permissions."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseCreatePrDialog}
              variant="outlined"
              sx={{ borderColor: "divider", color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePR}
              variant="contained"
              color="secondary" // Use secondary for PR creation action
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
            PaperProps={{ elevation: 0 }}
          >
            <DialogTitle>Edit Pull Request #{prToEdit.number}</DialogTitle>
            <DialogContent sx={{ pt: "20px !important" }}>
              <TextField
                autoFocus
                margin="dense"
                label="PR Title"
                type="text"
                fullWidth
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                label="PR Description"
                type="text"
                fullWidth
                multiline
                rows={5}
                value={prDescription}
                onChange={(e) => setPrDescription(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Supports Markdown."
              />
              <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 2 }}>
                Note: Base branch, head branch, and reviewers cannot be changed
                from here after PR creation. Please use GitHub for advanced
                changes.
              </Alert>
              {updatePRApiError && (
                <Alert
                  severity="error"
                  sx={{ mt: 2 }}
                  icon={<ErrorOutlineIcon />}
                >
                  {updatePRApiError.data?.message || "Failed to update PR."}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseEditPrDialog}
                variant="outlined"
                sx={{ borderColor: "divider", color: "text.secondary" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePR}
                variant="contained"
                color="primary"
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
