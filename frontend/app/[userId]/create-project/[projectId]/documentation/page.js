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
import axios from "axios";

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
  useDisconnectGoogleDriveMutation,
} from "@/features/documentApiSlice"; // Assuming this path is correct
import { useRouter, useParams } from "next/navigation";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import { SynthButton } from "@/components/ui/SynthButton";
import ArtifactGrid from "@/components/documentations_components/ArtifactGrid";
import UploadDialog from "@/components/documentations_components/UploadDialog";
import EditDialog from "@/components/documentations_components/EditDialog";
import DeleteDialog from "@/components/documentations_components/DeleteDialog";
import GoogleDriveStatus from "@/components/documentations_components/GoogleDriveStatus";
import DocumentationHeader from "@/components/documentations_components/DocumentationHeader";
import FilterBar from "@/components/documentations_components/FilterBar";
import DisconnectDialog from "@/components/documentations_components/DisconnectDialog";
import CustomSnackbar from "@/components/documentations_components/CustomSnackbar";

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
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

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
  const [disconnectGoogleDrive] = useDisconnectGoogleDriveMutation();

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
      } else {
        // Remove the cloud=success param from the URL after showing the snackbar
        const newUrl = window.location.pathname + window.location.search.replace(/([&?])cloud=success(&|$)/, (match, p1, p2) => p1 === '?' && !p2 ? '' : p2 ? p1 : '');
        window.history.replaceState({}, document.title, newUrl);
      }
    } else {
      // Only check backend status, do not show snackbar
      const checkGoogleDriveStatus = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google/drive-status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          if (data.connected) {
            setIsGoogleDriveConnected(true);
            localStorage.setItem('googleDriveConnected', 'true');
          } else {
            setIsGoogleDriveConnected(false);
            localStorage.removeItem('googleDriveConnected');
          }
        } catch {
          setIsGoogleDriveConnected(false);
          localStorage.removeItem('googleDriveConnected');
        }
      };
      checkGoogleDriveStatus();
    }
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
    setDisconnectDialogOpen(true);
  };

  const confirmDisconnectGoogleDrive = async () => {
    try {
      await disconnectGoogleDrive().unwrap();
      setIsGoogleDriveConnected(false);
      localStorage.removeItem('googleDriveConnected');
      setGoogleDriveError(null);
      showSnackbar("Google Drive disconnected.", "info");
    } catch (err) {
      showSnackbar("Failed to disconnect Google Drive.", "error");
    } finally {
      setDisconnectDialogOpen(false);
    }
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
          background: isDark ? "#000000" : "#F5F6FA",
          px: { xs: 1, sm: 3, md: 6 },
          py: { xs: 2, sm: 4 },
        }}
      >
        {/* HEADER + BUTTONS */}
        <DocumentationHeader
          isDark={isDark}
          isGoogleDriveConnected={isGoogleDriveConnected}
          isConnectingGoogleDrive={isConnectingGoogleDrive}
          onGoogleDriveAuth={handleGoogleDriveAuth}
          onUpload={() => setUploadDialogOpen(true)}
          onDisconnect={handleDisconnectGoogleDrive}
        />
        {/* Google Drive Connection Status */}
        <GoogleDriveStatus
          isGoogleDriveConnected={isGoogleDriveConnected}
          googleDriveError={googleDriveError}
          isDark={isDark}
          onConnect={handleGoogleDriveAuth}
          onDisconnect={handleDisconnectGoogleDrive}
          isConnectingGoogleDrive={isConnectingGoogleDrive}
          setGoogleDriveError={setGoogleDriveError}
        />
        {/* TOP BAR: Search, Filters, Toggle */}
        <FilterBar
          isDark={isDark}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
        {/* ARTIFACT CARDS */}
        <ArtifactGrid
          documents={documents}
          isDark={isDark}
          isGoogleDriveConnected={isGoogleDriveConnected}
          isConnectingGoogleDrive={isConnectingGoogleDrive}
          onUpload={() => setUploadDialogOpen(true)}
          onConnect={handleGoogleDriveAuth}
          onDelete={handleDeleteDialogOpen}
        />
        {/* Upload Dialog */}
        <UploadDialog
          open={uploadDialogOpen}
          onClose={handleUploadDialogClose}
          onChange={handleUploadChange}
          onFileChange={handleUploadFileChange}
          onSubmit={handleUploadSubmit}
          form={uploadForm}
          isUploading={isUploading}
          isDark={isDark}
        />
        {/* Edit Document Dialog */}
        <EditDialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          onChange={handleEditChange}
          onFileChange={handleEditFileChange}
          onSubmit={handleEditSubmit}
          form={editForm}
          isUpdating={isUpdating}
          isDark={isDark}
        />
        {/* Delete Confirmation Dialog */}
        <DeleteDialog
          open={deleteConfirmOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          documentTitle={currentDocument?.documentTitle}
          isDeleting={isDeleting}
        />
        {/* Disconnect Confirmation Dialog */}
        <DisconnectDialog
          open={disconnectDialogOpen}
          onClose={() => setDisconnectDialogOpen(false)}
          onConfirm={confirmDisconnectGoogleDrive}
        />
        <CustomSnackbar
          open={snackbarOpen}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
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
