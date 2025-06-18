// components/UserStoryForm.jsx
import React from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Avatar,
  Card,
  useTheme,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TruncatedText from "./TruncatedText"; // Re-using the TruncatedText component
import { styled } from "@mui/material/styles";

// Styled Card for a glass-like effect
const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.custom.glassEffect, // Custom glass effect background
  backdropFilter: "blur(10px)", // Blur effect
  border: `1px solid ${theme.palette.custom.glassBorder}`, // Glass border
  boxShadow: theme.palette.custom.depthShadow, // Depth shadow
  borderRadius: "20px", // Rounded corners
  padding: theme.spacing(3), // Padding
  transition: "all 0.3s ease", // Smooth transitions
  "&:hover": {
    transform: "translateY(-5px)", // Lift on hover
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 15px 35px rgba(0,0,0,0.6), 0 -10px 20px rgba(50,50,50,0.4)"
        : "0 15px 35px rgba(0,0,0,0.15), 0 -10px 20px rgba(255,255,255,0.9)", // Enhanced shadow on hover
  },
}));

// Styled Box for AI-generated content display
const AIContentBox = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.7)"
      : "rgba(240, 240, 240, 0.7)", // Background based on theme
  backdropFilter: "blur(5px)", // Blur effect
  border: `1px solid ${theme.palette.mode === "dark" ? "#3a3a3a" : "#d0d0d0"}`, // Border
  borderRadius: "16px", // Rounded corners
  padding: theme.spacing(3), // Padding
  marginTop: theme.spacing(3), // Top margin
  color: theme.palette.text.primary, // Text color
  boxShadow: theme.palette.custom.innerShadow, // Inner shadow
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: theme.palette.secondary.main, // Left border as highlight
  },
}));

/**
 * Renders the form for creating or editing a user story.
 *
 * @param {object} props - The component props.
 * @param {string} props.activePanel - Current active panel ('create' or 'edit').
 * @param {object} props.selectedStory - The story object if in edit mode, otherwise null.
 * @param {string} props.userStoryTitle - State for user story title.
 * @param {function} props.setUserStoryTitle - Setter for user story title.
 * @param {string} props.description - State for description.
 * @param {function} props.setDescription - Setter for description.
 * @param {string} props.acceptanceCriteria - State for acceptance criteria.
 * @param {function} props.setAcceptanceCriteria - Setter for acceptance criteria.
 * @param {string} props.testingScenarios - State for testing scenarios.
 * @param {function} props.setTestingScenarios - Setter for testing scenarios.
 * @param {string} props.storyStatus - State for story status.
 * @param {function} props.setStoryStatus - Setter for story status.
 * @param {string} props.storyPriority - State for story priority.
 * @param {function} props.setStoryPriority - Setter for story priority.
 * @param {string} props.estimatedTime - State for estimated time.
 * @param {function} props.setEstimatedTime - Setter for estimated time.
 * @param {Array<string>} props.selectedCollaboratorGithubIds - Array of selected collaborator GitHub IDs.
 * @param {function} props.handleCollaboratorChange - Handler for collaborator checkbox changes.
 * @param {string} props.generatedStoryContent - State for AI generated story content.
 * @param {function} props.handleGenerateStory - Callback to generate AI story.
 * @param {boolean} props.isGenerating - Loading state for AI generation.
 * @param {function} props.handleSubmit - Callback to submit the form (create/update).
 * @param {boolean} props.isCreating - Loading state for creating a story.
 * @param {boolean} props.isUpdating - Loading state for updating a story.
 * @param {function} props.onCancel - Callback to cancel the form and go back to list.
 * @param {Array<object>} props.collaboratorsData - Data for available collaborators.
 * @param {boolean} props.collaboratorsLoading - Loading state for collaborators data.
 */
const UserStoryForm = ({
  activePanel,
  selectedStory,
  userStoryTitle,
  setUserStoryTitle,
  description,
  setDescription,
  acceptanceCriteria,
  setAcceptanceCriteria,
  testingScenarios,
  setTestingScenarios,
  storyStatus,
  setStoryStatus,
  storyPriority,
  setStoryPriority,
  estimatedTime,
  setEstimatedTime,
  selectedCollaboratorGithubIds,
  handleCollaboratorChange,
  generatedStoryContent,
  handleGenerateStory,
  isGenerating,
  handleSubmit,
  isCreating,
  isUpdating,
  onCancel,
  collaboratorsData,
  collaboratorsLoading,
}) => {
  const theme = useTheme(); // Access the current theme for styling

  return (
    <GlassCard
      sx={{
        height: "100%", // Full height
        overflowY: "auto", // Enable vertical scrolling if content overflows
        display: "flex",
        flexDirection: "column",
        gap: 3, // Spacing between form elements
      }}
    >
      {/* Form title */}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {activePanel === "edit" ? "Edit User Story" : "Create New User Story"}
      </Typography>

      {/* User Story Title input */}
      <TextField
        fullWidth
        label="User Story Title"
        value={userStoryTitle}
        onChange={(e) => setUserStoryTitle(e.target.value)}
      />

      {/* Description input */}
      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Acceptance Criteria input */}
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Acceptance Criteria"
        value={acceptanceCriteria}
        onChange={(e) => setAcceptanceCriteria(e.target.value)}
      />

      {/* Testing Scenarios input */}
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Testing Scenarios"
        value={testingScenarios}
        onChange={(e) => setTestingScenarios(e.target.value)}
      />

      {/* Status Field */}
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={storyStatus}
          label="Status"
          onChange={(e) => setStoryStatus(e.target.value)}
          // Disable status field if story has prUrl or githubBranch, indicating AI/PR flow control
          disabled={
            selectedStory && (selectedStory.prUrl || selectedStory.githubBranch)
          }
        >
          <MenuItem value="PLANNING">Planning</MenuItem>
          <MenuItem value="IN REVIEW">In Review</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="AI DEVELOPED">AI Developed</MenuItem>
        </Select>
      </FormControl>

      {/* Priority Field */}
      <FormControl fullWidth>
        <InputLabel>Priority</InputLabel>
        <Select
          value={storyPriority}
          label="Priority"
          onChange={(e) => setStoryPriority(e.target.value)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>

      {/* Estimated Time Field */}
      <TextField
        fullWidth
        label="Estimated Time (e.g., 8h, 2d)"
        value={estimatedTime}
        onChange={(e) => setEstimatedTime(e.target.value)}
      />

      {/* Collaborators Assignment */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Assign Collaborators
        </Typography>
        {collaboratorsLoading ? (
          <CircularProgress size={24} /> // Show loading spinner if collaborators are loading
        ) : (
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            {collaboratorsData?.collaborators.map((c) => (
              <FormControlLabel
                key={c.githubId}
                control={
                  <Checkbox
                    checked={selectedCollaboratorGithubIds.includes(c.githubId)} // Check if collaborator is selected
                    onChange={handleCollaboratorChange} // Handle checkbox change
                    value={c.githubId}
                    sx={{
                      color: theme.palette.text.secondary,
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={c.avatarUrl} sx={{ width: 24, height: 24 }} />{" "}
                    {/* Collaborator avatar */}
                    <Typography variant="body2" color="text.primary">
                      {c.username}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        )}
      </Box>

      {/* Generate AI Story Button */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleGenerateStory} // Trigger AI story generation
          disabled={isGenerating} // Disable if generation is in progress
          startIcon={<AutoFixHighIcon />} // Icon for AI generation
          sx={{
            borderRadius: "12px", // Rounded corners
            textTransform: "none", // Prevent uppercase transformation
          }}
        >
          {isGenerating
            ? "Generating..." // Text while generating
            : selectedStory
            ? "Regenerate with AI" // Text for existing story
            : "Enhance with AI"}{" "}
          {/* Text for new story */}
        </Button>
      </Box>

      {/* Display AI Generated Content if available */}
      {generatedStoryContent && (
        <AIContentBox>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {generatedStoryContent}
          </Typography>
        </AIContentBox>
      )}

      {/* Form Action Buttons (Cancel and Save/Create) */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit} // Submit the form
          variant="contained"
          disabled={isCreating || isUpdating} // Disable if creating or updating
        >
          {isCreating || isUpdating ? (
            <CircularProgress size={24} color="inherit" /> // Loading spinner
          ) : activePanel === "edit" ? (
            "Save Changes" // Text for edit mode
          ) : (
            "Create Story" // Text for create mode
          )}
        </Button>
      </Box>
    </GlassCard>
  );
};

export default UserStoryForm;
