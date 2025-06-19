"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import MuiAlert from "@mui/material/Alert";

// Icons
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import FileOpenIcon from "@mui/icons-material/LaunchOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";

import {
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useSaveGeneratedDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useInitGoogleDriveMutation,
} from "@/features/documentApiSlice"; // Assuming this path is correct
import { useRouter, useParams } from "next/navigation";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import { SynthButton } from "@/components/ui/SynthButton";

// --- Modern Light Theme (Copied from previous response for consistency) ---
const modernLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3E63DD", // Vibrant Blue
      light: "#7986FA",
      dark: "#2A4AB0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00C49F", // Cool Teal
      light: "#66FFC2",
      dark: "#008C73",
      contrastText: "#000000",
    },
    background: {
      default: "#F8F9FC", // Softer, lighter grey
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50", // Dark grey
      secondary: "#566573", // Medium grey
      disabled: "#AEB6BF",
    },
    error: { main: "#E74C3C" },
    warning: { main: "#F39C12" },
    success: { main: "#2ECC71" },
    info: { main: "#3498DB" },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      color: "#2C3E50",
      fontSize: "2rem",
    },
    h5: {
      fontWeight: 600,
      color: "#2C3E50",
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 600,
      color: "#2C3E50",
      fontSize: "1.15rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      borderRadius: "8px",
    },
    body1: {
      color: "#2C3E50",
      fontSize: "0.95rem",
    },
    body2: {
      color: "#566573",
      fontSize: "0.875rem",
    },
    caption: {
      color: "#566573",
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(100, 120, 150, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 12px 28px rgba(100, 120, 150, 0.12)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8F9FC",
          fontWeight: 700,
          fontSize: "1.25rem",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
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
          "& .MuiInputLabel-root": {
            fontWeight: 500,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2C3E50",
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
          padding: "8px 16px",
        },
        icon: {
          marginRight: 12,
          fontSize: 22,
        },
      },
    },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const FileInputButton = styled(Button)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "120px",
  color: theme.palette.text.secondary,
  transition: "border-color 0.3s ease, background-color 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: "rgba(62, 99, 221, 0.05)",
  },
}));

const DocumentationPage = ({ projectDataFromParent }) => {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;
  const currentProjectId = params.projectId;

  // THEME
  const { data: themeData } = useGetThemeQuery(userId);
  const theme = themeData?.theme || localStorage.getItem("theme") || "light";
  const isDark = theme === "dark";

  const {
    data: documentsResponse,
    isLoading: documentsLoading,
    isError: documentsIsError,
    error: documentsError,
    refetch: refetchDocuments,
  } = useGetProjectDocumentsQuery(currentProjectId, {
    skip: !currentProjectId,
  });
  const documents = useMemo(
    () => documentsResponse?.documents || [],
    [documentsResponse]
  );

  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [saveGeneratedDocument, { isLoading: isGenerating }] =
    useSaveGeneratedDocumentMutation();
  const [updateDocumentMutation, { isLoading: isUpdating }] =
    useUpdateDocumentMutation(); // Renamed to avoid conflict
  const [deleteDocumentMutation, { isLoading: isDeleting }] =
    useDeleteDocumentMutation(); // Renamed to avoid conflict

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    documentTitle: "",
    documentShortDescription: "",
    documentFile: null,
  });
  const [generateForm, setGenerateForm] = useState({
    documentTitle: "",
    documentShortDescription: "",
    documentFullDescription: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    documentTitle: "",
    documentShortDescription: "",
    documentFile: null,
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [showFilters, setShowFilters] = useState(false);

  // Google Drive state
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isConnectingGoogleDrive, setIsConnectingGoogleDrive] = useState(false);
  const [googleDriveError, setGoogleDriveError] = useState(null);

  const [initGoogleDrive] = useInitGoogleDriveMutation();

  // Check Google Drive connection status on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cloud') === 'success') {
      setIsGoogleDriveConnected(true);
      localStorage.setItem('googleDriveConnected', 'true');
      showSnackbar('Google Drive connected successfully! You can now upload documents.', 'success');

      // Auto-redirect to the correct documentation page if not already there
      const pendingUserId = localStorage.getItem('pendingUserId');
      const pendingProjectId = localStorage.getItem('pendingProjectId');
      const currentPath = window.location.pathname;
      const targetPath = `/${pendingUserId}/create-project/${pendingProjectId}/documentation`;

      if (pendingUserId && pendingProjectId && currentPath !== targetPath) {
        window.location.href = `${targetPath}?cloud=success`;
        // Clean up after redirect
        localStorage.removeItem('pendingUserId');
        localStorage.removeItem('pendingProjectId');
      }
    }
    const checkGoogleDriveConnection = () => {
      const connected = localStorage.getItem('googleDriveConnected') === 'true';
      setIsGoogleDriveConnected(connected);
    };
    checkGoogleDriveConnection();
  }, []);

  // --- Google OAuth Redirect Flow ---
  const handleGoogleDriveAuth = () => {
    const state = encodeURIComponent(JSON.stringify({ userId, projectId: currentProjectId }));
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code` +
      `&client_id=630538745140-60ma4pkrungjdcude8stgun0istrvl07.apps.googleusercontent.com` +
      `&redirect_uri=http://localhost:3001/api/google/oauth-callback` +
      `&scope=https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${state}`;
    window.location.href = googleAuthUrl;
  };

  const handleDisconnectGoogleDrive = () => {
    setIsGoogleDriveConnected(false);
    localStorage.removeItem('googleDriveConnected');
    setGoogleDriveError(null);
    showSnackbar("Google Drive disconnected.", "info");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setUploadForm({
      documentTitle: "",
      documentShortDescription: "",
      documentFile: null,
    });
  };

  const handleUploadChange = (e) =>
    setUploadForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUploadFileChange = (e) =>
    setUploadForm((prev) => ({ ...prev, documentFile: e.target.files[0] }));

  const handleUploadSubmit = async () => {
    if (
      !uploadForm.documentTitle ||
      !uploadForm.documentShortDescription ||
      !uploadForm.documentFile
    ) {
      showSnackbar("Please fill all fields and select a file.", "warning");
      return;
    }
    
    if (!currentProjectId) {
      showSnackbar("Project ID is missing. Cannot upload document.", "error");
      console.error(
        "Error: currentProjectId is undefined in handleUploadSubmit"
      );
      return;
    }

    // Check if Google Drive is connected
    if (!isGoogleDriveConnected) {
      showSnackbar("Please connect to Google Drive first before uploading documents.", "warning");
      return;
    }

    // Debug: Check file type
    console.log("DEBUG: documentFile type:", uploadForm.documentFile && uploadForm.documentFile.constructor.name, uploadForm.documentFile);
    if (!(uploadForm.documentFile instanceof File)) {
      showSnackbar("Selected file is not a valid File object. Please re-select the file.", "error");
      return;
    }

    const documentDataForUpload = {
      documentTitle: uploadForm.documentTitle,
      documentShortDescription: uploadForm.documentShortDescription,
      projectId: currentProjectId,
      documentFile: uploadForm.documentFile,
    };

    console.log("Submitting for upload:", documentDataForUpload); // For debugging

    try {
      await uploadDocument(documentDataForUpload).unwrap();
      showSnackbar("Document uploaded successfully to Google Drive!");
      handleUploadDialogClose();
      refetchDocuments();
    } catch (err) {
      console.error("Upload error object:", err);
      showSnackbar(
        `Upload failed: ${
          err.data?.message || err.error || err.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  const handleGenerateDialogClose = () => {
    setGenerateDialogOpen(false);
    setGenerateForm({
      documentTitle: "",
      documentShortDescription: "",
      documentFullDescription: "",
    });
  };

  const handleGenerateChange = (e) =>
    setGenerateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGenerateSubmit = async () => {
    if (!generateForm.documentTitle || !generateForm.documentShortDescription) {
      showSnackbar(
        "Please fill at least title and short description.",
        "warning"
      );
      return;
    }
    if (!currentProjectId) {
      showSnackbar("Project ID is missing. Cannot save document.", "error");
      return;
    }

    try {
      await saveGeneratedDocument({
        ...generateForm,
        projectId: currentProjectId,
      }).unwrap();
      showSnackbar("Document metadata saved successfully!");
      handleGenerateDialogClose();
      refetchDocuments();
    } catch (err) {
      showSnackbar(
        `Save failed: ${err.data?.message || "Unknown error"}`,
        "error"
      );
    }
  };

  const handleEditDialogOpen = (doc) => {
    setCurrentDocument(doc);
    setEditForm({
      id: doc._id,
      documentTitle: doc.documentTitle,
      documentShortDescription: doc.documentShortDescription,
      documentFile: null,
    });
    setEditDialogOpen(true);
  };
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentDocument(null);
    setEditForm({
      id: "",
      documentTitle: "",
      documentShortDescription: "",
      documentFile: null,
    });
  };
  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditFileChange = (e) =>
    setEditForm((prev) => ({ ...prev, documentFile: e.target.files[0] }));

  const handleEditSubmit = async () => {
    if (!editForm.documentTitle || !editForm.documentShortDescription) {
      showSnackbar("Title and short description cannot be empty.", "warning");
      return;
    }
    if (!currentDocument?._id) {
      showSnackbar("Document ID is missing. Cannot update.", "error");
      return;
    }

    // For update, we also pass an object. The slice handles FormData.
    const documentDataForUpdate = {
      documentId: currentDocument._id, // Pass documentId for the URL
      documentTitle: editForm.documentTitle,
      documentShortDescription: editForm.documentShortDescription,
      ...(editForm.documentFile && { documentFile: editForm.documentFile }), // Conditionally add file
    };

    try {
      // The updateDocument mutation in your slice already expects an object:
      // query: ({ documentId, documentTitle, documentShortDescription, documentFile })
      // So, this call is correct.
      await updateDocumentMutation(documentDataForUpdate).unwrap();
      showSnackbar("Document updated successfully!");
      handleEditDialogClose();
      refetchDocuments();
    } catch (err) {
      showSnackbar(
        `Update failed: ${err.data?.message || "Unknown error"}`,
        "error"
      );
    }
  };

  const handleDeleteDialogOpen = (doc) => {
    setCurrentDocument(doc);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteDialogClose = () => {
    setDeleteConfirmOpen(false);
    setCurrentDocument(null);
  };
  const handleDeleteConfirm = async () => {
    if (!currentDocument?._id) return;
    try {
      await deleteDocumentMutation(currentDocument._id).unwrap();
      showSnackbar("Document deleted successfully!");
      handleDeleteDialogClose();
      refetchDocuments();
    } catch (err) {
      showSnackbar(
        `Delete failed: ${err.data?.message || "Unknown error"}`,
        "error"
      );
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleGoBack = () => router.back();

  // Card width for 4 per row
  const CARD_WIDTH =260;
  const DESC_MAX_WIDTH = 200;

  if (!currentProjectId) {
    return (
      <ThemeProvider theme={modernLightTheme}>
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Alert severity="error" icon={false}>
            Project ID is missing in the URL. Please navigate from a valid
            project page.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  if (documentsLoading) {
    return (
      <ThemeProvider theme={modernLightTheme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 64px)",
            flexDirection: "column",
          }}
        >
          <CircularProgress size={50} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
            Loading Documents...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (documentsIsError) {
    return (
      <ThemeProvider theme={modernLightTheme}>
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            flexDirection: "column",
          }}
        >
          <Alert
            severity="error"
            iconMapping={{
              error: <DescriptionOutlinedIcon fontSize="inherit" />,
            }}
            sx={{ mb: 2, p: 2 }}
          >
            <strong>Error Loading Documents</strong>
            <br />
            {documentsError?.data?.message ||
              documentsError?.error ||
              "An unexpected error occurred."}
          </Alert>
          <Button variant="outlined" onClick={refetchDocuments}>
            Try Again
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={modernLightTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: isDark ? "#23242A" : "#F5F6FA",
          px: { xs: 1, sm: 3, md: 6 },
          py: { xs: 2, sm: 4 },
        }}
      >
        {/* HEADER + BUTTONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: isDark ? "#fff" : "#23242A",
                mb: 0.5,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              Artifacts
            </Typography>
            <Typography
              sx={{
                color: isDark ? "#6B7280" : "#6B7280",
                fontSize: { xs: "1rem", sm: "1.15rem" },
                mb: 2,
              }}
            >
              Manage and organize your project documents
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isGoogleDriveConnected && (
              <SynthButton
                variant="primary"
                size="lg"
                onClick={handleGoogleDriveAuth}
                disabled={isConnectingGoogleDrive}
                sx={{
                  background: "linear-gradient(90deg, #4285F4 0%, #34A853 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: isDark
                    ? "0 4px 24px 0 rgba(66,133,244,0.18)"
                    : "0 4px 24px 0 rgba(66,133,244,0.10)",
                  borderRadius: 3,
                  px: 3,
                  height: 48,
                }}
              >
                {isConnectingGoogleDrive ? (
                  <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
                ) : (
                  <CloudSyncIcon style={{ fontSize: 22, marginRight: 8 }} />
                )}
                {isConnectingGoogleDrive ? 'Connecting...' : 'Connect Google Drive'}
              </SynthButton>
            )}
            <SynthButton
              variant="primary"
              size="lg"
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                background: "linear-gradient(90deg, #A78BFA 0%, #6366F1 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: isDark
                  ? "0 4px 24px 0 rgba(80,80,120,0.18)"
                  : "0 4px 24px 0 rgba(120,120,180,0.10)",
                borderRadius: 3,
                px: 3,
                height: 48,
              }}
              disabled={!isGoogleDriveConnected}
            >
              <CloudUploadIcon style={{ fontSize: 22, marginRight: 8 }} />
              Upload Artifact
            </SynthButton>
            {isGoogleDriveConnected && (
              <SynthButton
                variant="flat"
                size="sm"
                onClick={handleDisconnectGoogleDrive}
                style={{
                  backgroundColor: isDark ? '#EF4444' : '#DC2626',
                  color: '#fff'
                }}
                sx={{ height: 36, px: 2 }}
              >
                Disconnect
              </SynthButton>
            )}
          </Box>
        </Box>

        {/* Google Drive Connection Status */}
        {googleDriveError && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity="error" 
              onClose={() => setGoogleDriveError(null)}
              sx={{ 
                borderRadius: 2,
                background: isDark ? '#1F2937' : '#FEF2F2',
                border: isDark ? '1px solid #374151' : '1px solid #FECACA'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Google Drive Connection Error
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {googleDriveError}
              </Typography>
            </Alert>
          </Box>
        )}

        {!isGoogleDriveConnected && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                background: isDark ? '#1E3A8A' : '#EFF6FF',
                border: isDark ? '1px solid #3B82F6' : '1px solid #BFDBFE'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Google Drive Required
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Connect to Google Drive to upload and manage your project artifacts. Documents will be stored securely in your GitGPT documents folder.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* TOP BAR: Search, Filters, Toggle */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            mb: 4,
            background: isDark ? "#23242A" : "#F5F6FA",
            borderRadius: 4,
            boxShadow: isDark
              ? 'inset 8px 8px 24px #181A20, inset -8px -8px 24px #23242A, 0 2px 12px 0 rgba(0,0,0,0.25)'
              : 'inset 4px 4px 16px #e5e7eb, inset -4px -4px 16px #fff, 0 2px 8px 0 rgba(100,120,150,0.04)',
            p: 2,
            border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
          }}
        >
          {/* Search */}
          <TextField
            variant="outlined"
            placeholder="Search artifacts..."
            sx={{
              flex: 1,
              minWidth: 220,
              background: isDark ? "#181A20" : "#fff",
              borderRadius: 3,
              boxShadow: isDark
                ? 'inset 4px 4px 12px #181A20, inset -4px -4px 12px #23242A'
                : 'inset 2px 2px 8px #e5e7eb, inset -2px -2px 8px #fff',
              input: { color: isDark ? "#fff" : "#23242A" },
            }}
            size="small"
          />
          {/* Show Filters toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: isDark ? "#181A20" : "#fff",
              borderRadius: 3,
              px: 2,
              boxShadow: isDark
                ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
                : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
              minWidth: 120,
              height: 40,
              border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
            }}
          >
            <Typography sx={{ color: isDark ? "#E5E7EB" : "#23242A", fontWeight: 500, mr: 1 }}>
              Show Filters
            </Typography>
            <SynthButton
              size="sm"
              variant="flat"
              style={{ minWidth: 40, width: 40, height: 24, padding: 0, background: 'none', boxShadow: 'none' }}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Box sx={{ width: 32, height: 18, background: isDark ? "#333" : "#ddd", borderRadius: 9, position: "relative", transition: 'background 0.2s' }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    background: showFilters ? (isDark ? "#6366F1" : "#6366F1") : (isDark ? "#888" : "#fff"),
                    borderRadius: "50%",
                    position: "absolute",
                    left: showFilters ? 16 : 2,
                    top: 2,
                    transition: 'left 0.2s, background 0.2s',
                  }}
                />
              </Box>
            </SynthButton>
          </Box>
          {/* Filters (only if showFilters is true) */}
          {showFilters && (
            <>
              <TextField
                select
                size="small"
                variant="outlined"
                defaultValue="All Projects"
                sx={{
                  minWidth: 120,
                  background: isDark ? "#181A20" : "#fff",
                  borderRadius: 3,
                  boxShadow: isDark
                    ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
                    : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
                  ml: 1,
                  color: isDark ? '#E5E7EB' : '#23242A',
                  '& .MuiInputBase-input, & .MuiSelect-select': {
                    color: isDark ? '#E5E7EB' : '#23242A',
                  },
                }}
                SelectProps={{ native: true }}
              >
                <option>All Projects</option>
              </TextField>
              <TextField
                select
                size="small"
                variant="outlined"
                defaultValue="All Sprints"
                sx={{
                  minWidth: 120,
                  background: isDark ? "#181A20" : "#fff",
                  borderRadius: 3,
                  boxShadow: isDark
                    ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
                    : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
                  ml: 1,
                  color: isDark ? '#E5E7EB' : '#23242A',
                  '& .MuiInputBase-input, & .MuiSelect-select': {
                    color: isDark ? '#E5E7EB' : '#23242A',
                  },
                }}
                SelectProps={{ native: true }}
              >
                <option>All Sprints</option>
              </TextField>
              <TextField
                select
                size="small"
                variant="outlined"
                defaultValue="All Types"
                sx={{
                  minWidth: 120,
                  background: isDark ? "#181A20" : "#fff",
                  borderRadius: 3,
                  boxShadow: isDark
                    ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
                    : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
                  ml: 1,
                  color: isDark ? '#E5E7EB' : '#23242A',
                  '& .MuiInputBase-input, & .MuiSelect-select': {
                    color: isDark ? '#E5E7EB' : '#23242A',
                  },
                }}
                SelectProps={{ native: true }}
              >
                <option>All Types</option>
              </TextField>
            </>
          )}
        </Box>

        {/* ARTIFACT CARDS */}
        <Grid container spacing={4}>
          {(!documents || documents.length === 0) ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  p: { xs: 3, sm: 5 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                  border: isDark ? "2px dashed #444" : "2px dashed #ddd",
                  background: isDark ? "#181A20" : "#fff",
                  borderRadius: 4,
                  boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.18)"
                    : "0 8px 32px rgba(100,120,150,0.08)",
                }}
              >
                <NotesIcon sx={{ fontSize: 60, color: isDark ? "#555" : "#bbb", mb: 2 }} />
                <Typography variant="h5" color={isDark ? "#fff" : "#23242A"} gutterBottom>
                  No Artifacts Yet
                </Typography>
                <Typography
                  variant="body1"
                  color={isDark ? "#B0B3B8" : "#6B7280"}
                  sx={{ mb: 3 }}
                >
                  {isGoogleDriveConnected 
                    ? "It looks a bit empty here. Start by uploading an artifact to Google Drive."
                    : "Connect to Google Drive first to start uploading and managing your project artifacts."
                  }
                </Typography>
                {isGoogleDriveConnected ? (
                  <SynthButton
                    variant="primary"
                    size="lg"
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{
                      background: "linear-gradient(90deg, #A78BFA 0%, #6366F1 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: isDark
                        ? "0 4px 24px 0 rgba(80,80,120,0.18)"
                        : "0 4px 24px 0 rgba(120,120,180,0.10)",
                      borderRadius: 3,
                      px: 3,
                      height: 48,
                    }}
                  >
                    <CloudUploadIcon style={{ fontSize: 22, marginRight: 8 }} />
                    Upload Artifact
                  </SynthButton>
                ) : (
                  <SynthButton
                    variant="primary"
                    size="lg"
                    onClick={handleGoogleDriveAuth}
                    disabled={isConnectingGoogleDrive}
                    sx={{
                      background: "linear-gradient(90deg, #4285F4 0%, #34A853 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: isDark
                        ? "0 4px 24px 0 rgba(66,133,244,0.18)"
                        : "0 4px 24px 0 rgba(66,133,244,0.10)",
                      borderRadius: 3,
                      px: 3,
                      height: 48,
                    }}
                  >
                    {isConnectingGoogleDrive ? (
                      <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
                    ) : (
                      <CloudSyncIcon style={{ fontSize: 22, marginRight: 8 }} />
                    )}
                    {isConnectingGoogleDrive ? 'Connecting...' : 'Connect Google Drive'}
                  </SynthButton>
                )}
              </Box>
            </Grid>
          ) : (
            documents.map((doc) => (
              <Grid item xs={12} sm={6} md={3} lg={3} key={doc._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    background: isDark ? "#23242A" : "#fff",
                    borderRadius: 4,
                    boxShadow: isDark
                      ? "0 8px 32px rgba(0,0,0,0.18)"
                      : "0 8px 32px rgba(100,120,150,0.08)",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 220,
                    maxHeight: 220,
                    width: CARD_WIDTH,
                    maxWidth: '100%',
                    position: "relative",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    '&:hover': {
                      boxShadow: isDark
                        ? "0 16px 48px rgba(0,0,0,0.28)"
                        : "0 16px 48px rgba(100,120,150,0.16)",
                      transform: "translateY(-2px) scale(1.01)",
                    },
                  }}
                >
                  {/* File Icon */}
                  <Box sx={{ position: "absolute", top: 18, left: 18 }}>
                    <CloudUploadIcon sx={{ fontSize: 32, color: isDark ? "#B0B3B8" : "#6366F1" }} />
                  </Box>
                  {/* Download Icon */}
                  <Box sx={{ position: "absolute", top: 18, right: 18, display: 'flex', gap: 1 }}>
                    {(doc.googleDriveViewLink && doc.googleDriveViewLink !== "N/A (Generated Document)") || 
                     (doc.cloudinaryLink && doc.cloudinaryLink !== "N/A (Generated Document)") ? (
                      <Tooltip title="View" arrow>
                        <IconButton
                          onClick={() => {
                            // Use Google Drive view link if available, otherwise fall back to Cloudinary
                            const viewLink = doc.googleDriveViewLink || doc.cloudinaryLink;
                            window.open(viewLink, '_blank');
                          }}
                          sx={{ color: isDark ? "#fff" : "#6366F1", background: isDark ? "#181A20" : "#E8EAF6", borderRadius: 2 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <IconButton disabled sx={{ color: isDark ? "#555" : "#bbb", background: isDark ? "#181A20" : "#E8EAF6", borderRadius: 2 }}>
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        onClick={() => handleDeleteDialogOpen(doc)}
                        sx={{ ml: 1, color: isDark ? '#F87171' : '#B91C1C', background: isDark ? '#181A20' : '#FEE2E2', borderRadius: 2 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? "#fff" : "#23242A",
                      mt: 4,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={doc.documentTitle}
                  >
                    {doc.documentTitle}
                  </Typography>
                  {/* Description */}
                  <Typography
                    sx={{
                      color: isDark ? "#B0B3B8" : "#6B7280",
                      fontSize: 15,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: '100%',
                      minHeight: 24,
                      maxWidth: DESC_MAX_WIDTH,
                    }}
                    title={doc.documentShortDescription}
                  >
                    {doc.documentShortDescription || "-"}
                  </Typography>
                  {/* Size */}
                  <Typography sx={{ color: isDark ? "#B0B3B8" : "#6B7280", fontSize: 14, mb: 0.5 }}>
                    {doc.size ? formatFileSize(doc.size) : (doc.documentFile && doc.documentFile.size ? formatFileSize(doc.documentFile.size) : "-")}
                  </Typography>
                  <Divider sx={{ my: 1.5, borderColor: isDark ? "#333" : "#eee" }} />
                  {/* Modified Time */}
                  <Typography sx={{ color: isDark ? "#B0B3B8" : "#6B7280", fontSize: 13 }}>
                    Modified {doc.updatedAt ? timeAgo(new Date(doc.updatedAt)) : "-"}
                  </Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={handleUploadDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ color: "primary.main" }}>
            <UploadFileIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Upload
            New Document
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              name="documentTitle"
              label="Document Title"
              type="text"
              fullWidth
              value={uploadForm.documentTitle}
              onChange={handleUploadChange}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              margin="dense"
              name="documentShortDescription"
              label="Short Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={uploadForm.documentShortDescription}
              onChange={handleUploadChange}
              sx={{ mb: 2.5 }}
              required
            />
            <FileInputButton component="label" fullWidth>
              <CloudUploadIcon sx={{ fontSize: 36, mb: 1 }} />
              {uploadForm.documentFile
                ? uploadForm.documentFile.name
                : "Click to Select File"}
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                (PDF, DOCX, TXT)
              </Typography>
              <input
                type="file"
                hidden
                onChange={handleUploadFileChange}
                accept=".pdf,.doc,.docx,.txt,text/plain"
              />
            </FileInputButton>
            {uploadForm.documentFile && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Selected: {uploadForm.documentFile.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleUploadDialogClose}
              variant="text"
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              variant="contained"
              color="primary"
              disabled={
                isUploading ||
                !uploadForm.documentFile ||
                !uploadForm.documentTitle
              }
            >
              {isUploading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ color: "primary.dark" }}>
            <EditIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Edit Document
            Details
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              name="documentTitle"
              label="Document Title"
              type="text"
              fullWidth
              value={editForm.documentTitle}
              onChange={handleEditChange}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              margin="dense"
              name="documentShortDescription"
              label="Short Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={editForm.documentShortDescription}
              onChange={handleEditChange}
              sx={{ mb: 2.5 }}
              required
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, mb: 1 }}
            >
              Replace existing file (optional):
            </Typography>
            <FileInputButton component="label" fullWidth>
              <CloudUploadIcon sx={{ fontSize: 36, mb: 1 }} />
              {editForm.documentFile
                ? editForm.documentFile.name
                : "Click to Select New File"}
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                (PDF, DOCX, TXT)
              </Typography>
              <input
                type="file"
                hidden
                onChange={handleEditFileChange}
                accept=".pdf,.doc,.docx,.txt,text/plain"
              />
            </FileInputButton>
            {editForm.documentFile && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Selected for replacement: {editForm.documentFile.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleEditDialogClose}
              variant="text"
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              color="primary"
              disabled={isUpdating || !editForm.documentTitle}
            >
              {isUpdating ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteDialogClose}
          maxWidth="xs"
        >
          <DialogTitle sx={{ backgroundColor: "error.main", color: "white" }}>
            <DeleteIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Confirm
            Deletion
          </DialogTitle>
          <DialogContent sx={{ pt: "20px !important" }}>
            <Typography>
              Are you sure you want to delete the document: <br />
              <strong>"{currentDocument?.documentTitle}"</strong>?
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleDeleteDialogClose}
              variant="text"
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

// Helper for time ago
function timeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Helper for file size formatting
function formatFileSize(size) {
  if (!size || isNaN(size)) return "-";
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default DocumentationPage;
