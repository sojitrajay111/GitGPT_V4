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

import {
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useSaveGeneratedDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} from "@/features/documentApiSlice"; // Assuming this path is correct
import { useRouter, useParams } from "next/navigation";

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
  const currentProjectId = params.projectId;

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

    // THE FIX IS HERE: Pass an object to the mutation, not FormData
    const documentDataForUpload = {
      documentTitle: uploadForm.documentTitle,
      documentShortDescription: uploadForm.documentShortDescription,
      projectId: currentProjectId,
      documentFile: uploadForm.documentFile,
    };

    console.log("Submitting for upload:", documentDataForUpload); // For debugging

    try {
      // Pass the plain object. The slice will create FormData.
      await uploadDocument(documentDataForUpload).unwrap();
      showSnackbar("Document uploaded successfully!");
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
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 3 }, mb: 4, backgroundColor: "transparent" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Tooltip title="Go Back">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  mr: 1.5,
                  backgroundColor: "rgba(0,0,0,0.04)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <DescriptionOutlinedIcon
              sx={{ fontSize: "2.8rem", color: "primary.main", mr: 1.5 }}
            />
            <Typography variant="h4" component="h1">
              Project Documents
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, pl: "68px" }}
          >
            Manage, upload, and generate documentation for your project.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setGenerateDialogOpen(true)}
            >
              Generate (Metadata)
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {!documents || documents.length === 0 ? (
            <Grid item xs={12}>
              <Paper
                sx={{
                  textAlign: "center",
                  p: { xs: 3, sm: 5 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                  border: `2px dashed ${modernLightTheme.palette.divider}`,
                }}
              >
                <NotesIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Documents Yet
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  It looks a bit empty here. Start by uploading an existing
                  document or generating metadata for a new one.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  Upload Your First Document
                </Button>
              </Paper>
            </Grid>
          ) : (
            documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Chip
                      label={doc.isGenerated ? "AI Generated" : "Uploaded"}
                      size="small"
                      icon={
                        doc.isGenerated ? (
                          <Avatar
                            sx={{
                              bgcolor: "secondary.light",
                              width: 18,
                              height: 18,
                              fontSize: "0.8rem",
                            }}
                          >
                            AI
                          </Avatar>
                        ) : (
                          <UploadFileIcon fontSize="small" />
                        )
                      }
                      sx={{
                        mb: 1.5,
                        backgroundColor: doc.isGenerated
                          ? "secondary.main"
                          : "primary.main",
                        color: "white",
                        fontWeight: 500,
                        "& .MuiChip-icon": {
                          color: "white",
                          ml: "5px",
                          mr: "-2px",
                        },
                      }}
                    />
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={doc.documentTitle}
                    >
                      {doc.documentTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        minHeight: "60px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {doc.documentShortDescription ||
                        "No description provided."}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.disabled"
                    >
                      By: {doc.createdUser || "Unknown User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.disabled"
                    >
                      Created: {new Date(doc.createdAt).toLocaleDateString()}
                      {doc.updatedAt &&
                        new Date(doc.updatedAt).getTime() !==
                          new Date(doc.createdAt).getTime() &&
                        ` (Updated: ${new Date(
                          doc.updatedAt
                        ).toLocaleDateString()})`}
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      p: "8px 16px",
                      borderTop: `1px solid ${modernLightTheme.palette.divider}`,
                    }}
                  >
                    {doc.cloudinaryLink &&
                    doc.cloudinaryLink !== "N/A (Generated Document)" ? (
                      <Tooltip title="View Document" arrow>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          href={doc.cloudinaryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        disabled
                      >
                        No File
                      </Button>
                    )}
                    <Box>
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEditDialogOpen(doc)}
                          sx={{ color: "secondary.dark" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDialogOpen(doc)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Upload Document Dialog */}
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

        {/* Generate Document Dialog */}
        <Dialog
          open={generateDialogOpen}
          onClose={handleGenerateDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ color: "secondary.main" }}>
            <AddCircleOutlineIcon sx={{ verticalAlign: "middle", mr: 1 }} />{" "}
            Create Document Entry (Metadata)
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use this to create a placeholder for a document that will be
              generated or linked later.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              name="documentTitle"
              label="Document Title"
              type="text"
              fullWidth
              value={generateForm.documentTitle}
              onChange={handleGenerateChange}
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
              value={generateForm.documentShortDescription}
              onChange={handleGenerateChange}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              margin="dense"
              name="documentFullDescription"
              label="Detailed Description / Notes (Optional)"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={generateForm.documentFullDescription}
              onChange={handleGenerateChange}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleGenerateDialogClose}
              variant="text"
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateSubmit}
              variant="contained"
              color="secondary"
              disabled={isGenerating || !generateForm.documentTitle}
            >
              {isGenerating ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Save Entry"
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

export default DocumentationPage;
