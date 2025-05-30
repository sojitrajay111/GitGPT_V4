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
  Input,
  Link,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/system";
import MuiAlert from "@mui/material/Alert";
import {
  useGetProjectDocumentsQuery,
  useSaveGeneratedDocumentMutation,
  useUploadDocumentMutation,
} from "@/features/documentApiSlice";

// Adjust path based on your project structure

// Assuming you have a way to get project and user data, e.g., from URL params or Redux
// For demonstration, we'll use placeholders. In a real app, you'd get these dynamically.
// Example for Next.js:
// import { useRouter } from 'next/router';
// const router = useRouter();
// const { userId: currentUserId, projectId: currentProjectId } = router.query;

// Placeholder values for demonstration. REPLACE THESE WITH ACTUAL DYNAMIC VALUES.
const PLACEHOLDER_PROJECT_ID = "68380bcf206b1a77dce7a991"; // Example project ID
const PLACEHOLDER_USER_ID = "683704365472a67600163678"; // Example user ID
const PLACEHOLDER_USERNAME = "Raj"; // Example username

// Styled components for better aesthetics
const PageContainer = styled(Box)(({ theme }) => ({
  fontFamily: "Inter, sans-serif",
  padding: theme.spacing(4),
  backgroundColor: "#f0f2f5",
  minHeight: "100vh",
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(2),
  borderBottom: "1px solid #e0e0e0",
}));

const DocumentCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DocumentationPage = ({ projectId, userId, username }) => {
  // In a real application, you would get projectId and userId from your routing/auth context.
  // For example, if using Next.js with dynamic routes:
  // const router = useRouter();
  // const { projectId: currentProjectId, userId: currentUserId } = router.query;
  // Or from a Redux state for userId/username:
  // const currentUserId = useSelector(state => state.auth.userInfo._id);
  // const currentUserUsername = useSelector(state => state.auth.userInfo.username);

  // Using placeholder values for demonstration
  const currentProjectId = projectId || PLACEHOLDER_PROJECT_ID;
  const currentUserId = userId || PLACEHOLDER_USER_ID;
  const currentUserUsername = username || PLACEHOLDER_USERNAME;

  // RTK Query hooks
  const {
    data: documents,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectDocumentsQuery(currentProjectId);
  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [saveGeneratedDocument, { isLoading: isGenerating }] =
    useSaveGeneratedDocumentMutation();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setUploadForm({
      documentTitle: "",
      documentShortDescription: "",
      documentFile: null,
    });
  };

  const handleGenerateDialogClose = () => {
    setGenerateDialogOpen(false);
    setGenerateForm({
      documentTitle: "",
      documentShortDescription: "",
      documentFullDescription: "",
    });
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setUploadForm((prev) => ({ ...prev, documentFile: e.target.files[0] }));
  };

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    setGenerateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadSubmit = async () => {
    if (
      !uploadForm.documentTitle ||
      !uploadForm.documentShortDescription ||
      !uploadForm.documentFile
    ) {
      setSnackbarMessage("Please fill all fields and select a file.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await uploadDocument({
        documentTitle: uploadForm.documentTitle,
        documentShortDescription: uploadForm.documentShortDescription,
        projectId: currentProjectId,
        documentFile: uploadForm.documentFile,
        // creatorId and createdUser are handled by backend middleware based on auth token
      }).unwrap(); // .unwrap() throws an error if the mutation fails
      setSnackbarMessage("Document uploaded successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleUploadDialogClose();
      refetch(); // Re-fetch documents to update the list
    } catch (err) {
      console.error("Failed to upload document:", err);
      setSnackbarMessage(
        `Failed to upload document: ${err.data?.message || err.message}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGenerateSubmit = async () => {
    if (
      !generateForm.documentTitle ||
      !generateForm.documentShortDescription ||
      !generateForm.documentFullDescription
    ) {
      setSnackbarMessage("Please fill all fields for document generation.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await saveGeneratedDocument({
        documentTitle: generateForm.documentTitle,
        documentShortDescription: generateForm.documentShortDescription,
        documentFullDescription: generateForm.documentFullDescription,
        projectId: currentProjectId,
        // creatorId and createdUser are handled by backend middleware based on auth token
      }).unwrap();
      setSnackbarMessage("Generated document saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleGenerateDialogClose();
      refetch(); // Re-fetch documents to update the list
    } catch (err) {
      console.error("Failed to save generated document:", err);
      setSnackbarMessage(
        `Failed to save generated document: ${err.data?.message || err.message}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <PageContainer
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
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
          color: "red",
        }}
      >
        <Typography variant="h6">
          Error: {error?.data?.message || "Failed to load documents."}
        </Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Documentation for "
            {
              /* Replace with actual project name from projectData prop if available */ "Your Project"
            }
            "
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all project-related documents here.
          </Typography>
        </Box>
        <Box>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              mr: 2,
              backgroundColor: "#4CAF50",
              "&:hover": { backgroundColor: "#45a049" },
            }}
          >
            Upload Document
          </StyledButton>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={() => setGenerateDialogOpen(true)}
            sx={{
              backgroundColor: "#2196F3",
              "&:hover": { backgroundColor: "#1976D2" },
            }}
          >
            Generate Document
          </StyledButton>
        </Box>
      </Header>

      <Grid container spacing={4}>
        {documents?.documents?.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              No documents found for this project. Start by uploading or
              generating one!
            </Typography>
          </Grid>
        ) : (
          documents?.documents?.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <DocumentCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {doc.documentTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {doc.documentShortDescription}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Created by: {doc.createdUser} on{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", padding: 2 }}>
                  {doc.cloudinaryLink && (
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
                      >
                        View Document
                      </StyledButton>
                    </Link>
                  )}
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
        <DialogTitle sx={{ backgroundColor: "#4CAF50", color: "white" }}>
          Upload New Document
        </DialogTitle>
        <DialogContentStyled>
          <TextField
            autoFocus
            margin="dense"
            name="documentTitle"
            label="Enter document title"
            type="text"
            fullWidth
            variant="outlined"
            value={uploadForm.documentTitle}
            onChange={handleUploadChange}
            sx={{ mb: 2, borderRadius: "8px" }}
          />
          <TextField
            margin="dense"
            name="documentShortDescription"
            label="Enter short description of document"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={uploadForm.documentShortDescription}
            onChange={handleUploadChange}
            sx={{ mb: 2, borderRadius: "8px" }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              mt: 2,
              mb: 2,
              height: "56px",
              borderRadius: "8px",
              borderStyle: "dashed",
            }}
          >
            {uploadForm.documentFile
              ? uploadForm.documentFile.name
              : "Upload Document File"}
            <Input type="file" hidden onChange={handleFileChange} />
          </Button>
          {uploadForm.documentFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selected file: {uploadForm.documentFile.name}
            </Typography>
          )}
        </DialogContentStyled>
        <DialogActions sx={{ padding: 3, justifyContent: "flex-end" }}>
          <StyledButton
            onClick={handleUploadDialogClose}
            color="error"
            variant="outlined"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleUploadSubmit}
            color="primary"
            variant="contained"
            disabled={isUploading}
            sx={{
              backgroundColor: "#4CAF50",
              "&:hover": { backgroundColor: "#45a049" },
            }}
          >
            {isUploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload Document"
            )}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Generate Document Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={handleGenerateDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ backgroundColor: "#2196F3", color: "white" }}>
          Generate New Document
        </DialogTitle>
        <DialogContentStyled>
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
            sx={{ mb: 2, borderRadius: "8px" }}
          />
          <TextField
            margin="dense"
            name="documentShortDescription"
            label="Document Short Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={generateForm.documentShortDescription}
            onChange={handleGenerateChange}
            sx={{ mb: 2, borderRadius: "8px" }}
          />
          <TextField
            margin="dense"
            name="documentFullDescription"
            label="Document Full Description (for AI generation)"
            type="text"
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            value={generateForm.documentFullDescription}
            onChange={handleGenerateChange}
            sx={{ mb: 2, borderRadius: "8px" }}
          />
        </DialogContentStyled>
        <DialogActions sx={{ padding: 3, justifyContent: "space-between" }}>
          <StyledButton
            onClick={handleGenerateDialogClose}
            color="error"
            variant="outlined"
          >
            Cancel
          </StyledButton>
          <Box>
            <StyledButton
              onClick={() => {
                // This button would trigger AI generation
                // For now, it's just a UI placeholder
                setSnackbarMessage(
                  "AI Document Generation feature is not integrated yet. Click Save Document to save metadata."
                );
                setSnackbarSeverity("info");
                setSnackbarOpen(true);
              }}
              color="info"
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Generate Document (AI)
            </StyledButton>
            <StyledButton
              onClick={handleGenerateSubmit}
              color="primary"
              variant="contained"
              disabled={isGenerating}
              sx={{
                backgroundColor: "#2196F3",
                "&:hover": { backgroundColor: "#1976D2" },
              }}
            >
              {isGenerating ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Document"
              )}
            </StyledButton>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
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
