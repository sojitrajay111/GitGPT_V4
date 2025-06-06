"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Avatar,
  Chip,
  Stack,
  Snackbar,
  IconButton,
  Divider,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useGenerateAiStoryMutation,
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { ChevronLeft } from "lucide-react";

// Professional theme
const freshTheme = createTheme({
  palette: {
    primary: { main: "#5e72e4" },
    secondary: { main: "#11cdef" },
    success: { main: "#2dce89" },
    error: { main: "#f5365c" },
    background: { default: "#f8f9fe", paper: "#ffffff" },
    text: { primary: "#32325d", secondary: "#525f7f" },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700, fontSize: "1.8rem" },
    h6: { fontWeight: 600, fontSize: "1.1rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "8px 20px",
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e9ecef",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
              "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: "16px" } },
    },
  },
});

// Styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
  color: "white",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StoryCard = styled(Card)(({ theme }) => ({
  borderLeft: `5px solid ${theme.palette.primary.main}`,
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const AIContentBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #f8f9fe 0%, #f0f5ff 100%)",
  border: `1px solid #dee2e6`,
  borderRadius: "12px",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const TruncatedText = ({ content, maxLines = 5, title }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = content ? content.split("\n") : [];
  const needsTruncation = lines.length > maxLines;

  const displayedContent =
    expanded || !needsTruncation
      ? content
      : lines.slice(0, maxLines).join("\n") + (needsTruncation ? "..." : "");

  return (
    <Box mb={1.5}>
      {title && (
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={500}
          mb={0.5}
        >
          {title}
        </Typography>
      )}
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
        {displayedContent}
      </Typography>
      {needsTruncation && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ mt: 1, p: 0 }}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </Box>
  );
};

const UserStoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId, projectId } = params;

  // State for dialogs and forms
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // Form fields state
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");

  // State for menus and notifications
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // RTK Query Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const userRole = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

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

  const canManageStories =
    userRole === "manager" ||
    developerPermissions?.includes("User story creation");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Handlers for story actions menu
  const handleMenuClick = (event, storyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentStoryId(storyId);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const resetForm = () => {
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
    setEditingStory(null);
  };

  // Open dialog for creating
  const handleOpenCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleOpenEditDialog = () => {
    const story = userStories.find((s) => s._id === currentStoryId);
    if (story) {
      setEditingStory(story);
      setUserStoryTitle(story.userStoryTitle);
      setDescription(story.description);
      setAcceptanceCriteria(story.acceptanceCriteria);
      setTestingScenarios(story.testingScenarios);
      setSelectedCollaboratorGithubIds(
        story.collaborators.map((c) => c.githubId)
      );
      setGeneratedStoryContent(story.aiEnhancedUserStory || "");
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  // Open dialog for deleting
  const handleOpenDeleteDialog = () => {
    const story = userStories.find((s) => s._id === currentStoryId);
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDialogs = () => {
    setDialogOpen(false);
    setDeleteDialogOpen(false);
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
      showSnackbar("AI content generated successfully!");
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to generate AI content.",
        "error"
      );
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
    };

    try {
      if (editingStory) {
        await updateUserStory({
          userStoryId: editingStory._id,
          ...storyData,
        }).unwrap();
        showSnackbar("User story updated successfully!");
      } else {
        await createUserStory({ projectId, ...storyData }).unwrap();
        showSnackbar("User story created successfully!");
      }
      handleCloseDialogs();
      refetchUserStories();
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
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to delete user story.",
        "error"
      );
    }
  };

  const userStories =
    userRole === "developer"
      ? developerUserStories
      : userStoriesData?.userStories || [];

  return (
    <ThemeProvider theme={freshTheme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: "0 auto" }}>
        <HeaderCard>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                User Stories
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create, manage, and track user stories for your project.
              </Typography>
            </Box>
            {canManageStories && (
              <Button
                variant="contained"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                Create Story
              </Button>
            )}
          </Box>
        </HeaderCard>

        {storiesLoading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : userStories?.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography color="text.secondary">
              No user stories found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {userStories?.map((story) => (
              <Grid item xs={12} sm={6} md={4} key={story._id}>
                <StoryCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography variant="h6" sx={{ pr: 1, flexGrow: 1 }}>
                        {story.userStoryTitle}
                      </Typography>
                      {canManageStories && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, story._id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" my={1}>
                      <AccessTimeIcon
                        sx={{
                          color: "text.secondary",
                          mr: 1,
                          fontSize: "1.1rem",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Created:{" "}
                        {new Date(story.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {story.aiEnhancedUserStory ? (
                      <AIContentBox>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight={600}
                          gutterBottom
                        >
                          AI ENHANCED SUGGESTIONS
                        </Typography>
                        <TruncatedText
                          content={story.aiEnhancedUserStory}
                          maxLines={5}
                        />
                      </AIContentBox>
                    ) : (
                      <>
                        <TruncatedText
                          content={story.description}
                          maxLines={5}
                          title="Description"
                        />
                        <TruncatedText
                          content={story.acceptanceCriteria}
                          maxLines={3}
                          title="Acceptance Criteria"
                        />
                      </>
                    )}
                  </CardContent>
                  {story.collaborators && story.collaborators.length > 0 && (
                    <CardContent sx={{ pt: 0 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {story.collaborators.map((c) => (
                          <Chip
                            key={c.githubId}
                            avatar={<Avatar src={c.avatarUrl} />}
                            label={c.username}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  )}
                </StoryCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleOpenEditDialog}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleOpenDeleteDialog}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: "error" }}>
              Delete
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialogs}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {editingStory ? "Edit User Story" : "Create New User Story"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User Story Title"
                  value={userStoryTitle}
                  onChange={(e) => setUserStoryTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Acceptance Criteria"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Testing Scenarios"
                  value={testingScenarios}
                  onChange={(e) => setTestingScenarios(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" mt={2}>
                  Assign Collaborators
                </Typography>
                {collaboratorsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                    {collaboratorsData?.collaborators.map((c) => (
                      <FormControlLabel
                        key={c.githubId}
                        control={
                          <Checkbox
                            checked={selectedCollaboratorGithubIds.includes(
                              c.githubId
                            )}
                            onChange={handleCollaboratorChange}
                            value={c.githubId}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={c.avatarUrl}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            {c.username}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" my={1}>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    startIcon={<AutoFixHighIcon />}
                  >
                    {isGenerating
                      ? "Generating..."
                      : editingStory
                      ? "Regenerate with AI"
                      : "Enhance with AI"}
                  </Button>
                </Box>
                {generatedStoryContent && (
                  <AIContentBox>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {generatedStoryContent}
                    </Typography>
                  </AIContentBox>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingStory ? (
                "Save Changes"
              ) : (
                "Create Story"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDialogs}
          maxWidth="xs"
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the story "
              <strong>{storyToDelete?.userStoryTitle}</strong>"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
    </ThemeProvider>
  );
};

export default UserStoryPage;
