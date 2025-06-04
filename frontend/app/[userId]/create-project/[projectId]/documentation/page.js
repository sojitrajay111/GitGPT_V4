"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { styled } from "@mui/system";
import MuiAlert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from "@mui/icons-material/FileOpen";

import {
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useSaveGeneratedDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} from "@/features/documentApiSlice";

const PageContainer = styled(Box)(({ theme }) => ({
  fontFamily: "Inter, sans-serif",
  padding: theme.spacing(3),
  backgroundColor: "#f4f6f8",
  minHeight: "100vh",
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DocumentCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
  },
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const CardContentStyled = styled(CardContent)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1, 2.5),
  boxShadow: "none",
  transition: "background-color 0.2s ease, transform 0.1s ease",
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 3),
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DocumentationPage = ({ projectIdFromProps, projectData }) => {
  const PLACEHOLDER_PROJECT_ID = "68380bcf206b1a77dce7a991";
  const currentProjectId = projectIdFromProps || PLACEHOLDER_PROJECT_ID;

  const {
    data: documentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectDocumentsQuery(currentProjectId, {
    skip: !currentProjectId,
  });
  const documents = documentsResponse?.documents;

  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [saveGeneratedDocument, { isLoading: isGenerating }] =
    useSaveGeneratedDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

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

  // Handlers for Upload Dialog
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

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("documentTitle", uploadForm.documentTitle);
      formData.append("documentShortDescription", uploadForm.documentShortDescription);
      formData.append("projectId", currentProjectId);
      formData.append("documentFile", uploadForm.documentFile);

      await uploadDocument(formData).unwrap();
      showSnackbar("Document uploaded successfully!");
      handleUploadDialogClose();
      refetch();
    } catch (err) {
      showSnackbar(
        `Upload failed: ${
          err.data?.message || err.error || err.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  // Handlers for Generate Dialog
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
    
    try {
      await saveGeneratedDocument({
        ...generateForm,
        projectId: currentProjectId,
      }).unwrap();
      showSnackbar("Generated document metadata saved!");
      handleGenerateDialogClose();
      refetch();
    } catch (err) {
      showSnackbar(
        `Save failed: ${
          err.data?.message || err.error || err.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  // Handlers for Edit Dialog
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
    if (
      !editForm.documentTitle &&
      !editForm.documentShortDescription &&
      !editForm.documentFile
    ) {
      showSnackbar("No changes to submit.", "info");
      return;
    }
    if (!editForm.documentTitle || !editForm.documentShortDescription) {
      showSnackbar("Title and short description cannot be empty.", "warning");
      return;
    }

    try {
      // Create FormData object for file update
      const formData = new FormData();
      formData.append("documentTitle", editForm.documentTitle);
      formData.append("documentShortDescription", editForm.documentShortDescription);
      
      if (editForm.documentFile) {
        formData.append("documentFile", editForm.documentFile);
      }

      await updateDocument({
        documentId: editForm.id,
        body: formData
      }).unwrap();
      
      showSnackbar("Document updated successfully!");
      handleEditDialogClose();
      refetch();
    } catch (err) {
      showSnackbar(
        `Update failed: ${
          err.data?.message || err.error || err.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  // Handlers for Delete Confirm Dialog
  const handleDeleteDialogOpen = (doc) => {
    setCurrentDocument(doc);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteConfirmOpen(false);
    setCurrentDocument(null);
  };

  const handleDeleteConfirm = async () => {
    if (!currentDocument) return;
    
    try {
      await deleteDocument(currentDocument._id).unwrap();
      showSnackbar("Document deleted successfully!");
      handleDeleteDialogClose();
      refetch();
    } catch (err) {
      showSnackbar(
        `Delete failed: ${
          err.data?.message || err.error || err.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Rest of the component remains the same as your original code...
  // Only the handlers above were modified

  if (!currentProjectId) {
    return (
      <PageContainer
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Typography variant="h6" color="error">
          Project ID is missing.
        </Typography>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          Loading documents...
        </Typography>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Failed to load documents.
        </Typography>
        <Typography variant="body1" color="error.light">
          {error?.data?.message ||
            error?.error ||
            "An unexpected error occurred."}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={refetch}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 0
            }}
          >
            Project Documents{" "}
            <Typography component="span" variant="h4" color="primary.main">
              {/* {projectData?.name || "Selected Project"} */}
            </Typography>
          </Typography>

          <Box sx={{
              display: 'flex',
              gap: 1.5,
          }}>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={() => setGenerateDialogOpen(true)}
            >
              Generate Document
            </StyledButton>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ width: '100%' }}>
          Manage all project-related documents here.
        </Typography>
      </Header>
      <Grid container spacing={3}>
        {!documents || documents.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{
                mt: 5,
                p: 3,
                background: (theme) => theme.palette.background.paper,
                borderRadius: 2,
              }}
            >
              No documents found for this project. Start by uploading or
              generating one!
            </Typography>
          </Grid>
        ) : (
          documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <DocumentCard>
                <CardContentStyled>
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}
                    >
                      {doc.documentTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: "40px" }}
                    >
                      {doc.documentShortDescription}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mt: 1 }}
                  >
                    By: {doc.createdUser} on{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                    {doc.updatedAt &&
                      new Date(doc.updatedAt).getTime() !==
                        new Date(doc.createdAt).getTime() &&
                      ` (Updated: ${new Date(
                        doc.updatedAt
                      ).toLocaleDateString()})`}
                  </Typography>
                </CardContentStyled>
                <CardActions
                  sx={{
                    justifyContent: "space-between",
                    padding: "8px 16px",
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {doc.cloudinaryLink &&
                  doc.cloudinaryLink !== "N/A (Generated Document)" ? (
                    <Link
                      href={doc.cloudinaryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <StyledButton
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<FileOpenIcon />}
                      >
                        View
                      </StyledButton>
                    </Link>
                  ) : (
                    <StyledButton
                      size="small"
                      variant="outlined"
                      color="inherit"
                      disabled
                    >
                      No File
                    </StyledButton>
                  )}
                  <Box>
                    <Tooltip title="Edit Document">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDialogOpen(doc)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDialogOpen(doc)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </DocumentCard>
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
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "white" }}>
          Upload New Document
        </DialogTitle>
        <DialogContentStyled dividers>
          <TextField
            autoFocus
            margin="dense"
            name="documentTitle"
            label="Document Title"
            type="text"
            fullWidth
            variant="outlined"
            value={uploadForm.documentTitle}
            onChange={handleUploadChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="documentShortDescription"
            label="Short Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={uploadForm.documentShortDescription}
            onChange={handleUploadChange}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 1, mb: 1, p: 1.5, borderStyle: "dashed" }}
          >
            {uploadForm.documentFile
              ? uploadForm.documentFile.name
              : "Choose Document File (PDF, DOCX, TXT)"}
            <input
              type="file"
              hidden
              onChange={handleUploadFileChange}
              accept=".pdf,.doc,.docx,text/plain"
            />
          </Button>
          {uploadForm.documentFile && (
            <Typography variant="caption">
              Selected: {uploadForm.documentFile.name}
            </Typography>
          )}
        </DialogContentStyled>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <StyledButton
            onClick={handleUploadDialogClose}
            color="inherit"
            variant="text"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleUploadSubmit}
            color="primary"
            variant="contained"
            disabled={isUploading}
          >
            {isUploading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Upload"
            )}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Generate Document Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={handleGenerateDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ backgroundColor: "secondary.main", color: "white" }}>
          Generate Document (Metadata)
        </DialogTitle>
        <DialogContentStyled dividers>
          <TextField
            autoFocus
            margin="dense"
            name="documentTitle"
            label="Document Title"
            type="text"
            fullWidth
            variant="outlined"
            value={generateForm.documentTitle}
            onChange={handleGenerateChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="documentShortDescription"
            label="Short Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={generateForm.documentShortDescription}
            onChange={handleGenerateChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="documentFullDescription"
            label="Full Description / Content (Optional)"
            type="text"
            fullWidth
            multiline
            rows={5}
            variant="outlined"
            value={generateForm.documentFullDescription}
            onChange={handleGenerateChange}
            sx={{ mb: 2 }}
          />
        </DialogContentStyled>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <StyledButton
            onClick={handleGenerateDialogClose}
            color="inherit"
            variant="text"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleGenerateSubmit}
            color="secondary"
            variant="contained"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Save Metadata"
            )}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ backgroundColor: "secondary.dark", color: "white" }}>
          Edit Document
        </DialogTitle>
        <DialogContentStyled dividers>
          <TextField
            autoFocus
            margin="dense"
            name="documentTitle"
            label="Document Title"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.documentTitle}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="documentShortDescription"
            label="Short Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editForm.documentShortDescription}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          />
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 1, mb: 1 }}
          >
            Optionally, upload a new file to replace the existing one:
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 1, mb: 1, p: 1.5, borderStyle: "dashed" }}
          >
            {editForm.documentFile
              ? editForm.documentFile.name
              : "Choose New File (PDF, DOCX, TXT)"}
            <input
              type="file"
              hidden
              onChange={handleEditFileChange}
              accept=".pdf,.doc,.docx,text/plain"
            />
          </Button>
          {editForm.documentFile && (
            <Typography variant="caption">
              Selected for replacement: {editForm.documentFile.name}
            </Typography>
          )}
        </DialogContentStyled>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <StyledButton
            onClick={handleEditDialogClose}
            color="inherit"
            variant="text"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleEditSubmit}
            color="secondary"
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
      >
        <DialogTitle sx={{ backgroundColor: "error.main", color: "white" }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          <Typography>
            Are you sure you want to delete the document titled: <br />
            <strong>"{currentDocument?.documentTitle}"</strong>?
          </Typography>
          <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <StyledButton
            onClick={handleDeleteDialogClose}
            color="inherit"
            variant="text"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete"
            )}
          </StyledButton>
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
    </PageContainer>
  );
};

export default DocumentationPage;