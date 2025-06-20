// components/UserStoryDetail.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Grid,
  IconButton,
  Avatar,
  Card,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CircularProgress from "@mui/material/CircularProgress";
import TruncatedText from "./TruncatedText";
import { styled, keyframes } from "@mui/material/styles";

// Keyframes for futuristic loading animation
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;
const neonGlow = keyframes`
  0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.5); }
  50% { text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.8); }
  100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.5); }
`;

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
 * Renders the detailed view of a selected user story.
 *
 * @param {object} props - The component props.
 * @param {object} props.selectedStory - The user story object to display.
 * @param {function} props.onBackToList - Callback to navigate back to the story list.
 * @param {function} props.onOpenEditForm - Callback to open the edit form for the selected story.
 * @param {function} props.onOpenDeleteDialog - Callback to open the delete confirmation dialog.
 * @param {boolean} props.canManageStories - Indicates if the user has permission to manage stories.
 * @param {string} props.projectGithubRepoUrl - The GitHub repository URL for the project.
 * @param {function} props.handleGenerateSalesforceCode - Callback to trigger Salesforce code generation.
 * @param {boolean} props.isGeneratingCodeProcess - Loading state for code generation process.
 * @param {string | null} props.activeGenerationStoryId - ID of the story currently undergoing code generation.
 */
const UserStoryDetail = ({
  selectedStory,
  onBackToList,
  onOpenEditForm,
  onOpenDeleteDialog,
  canManageStories,
  projectGithubRepoUrl,
  handleGenerateSalesforceCode,
  isGeneratingCodeProcess,
  activeGenerationStoryId,
}) => {
  const theme = useTheme(); // Access the current theme for styling

  return (
    <GlassCard
      sx={{
        height: "100%", // Full height
        overflowY: "auto", // Enable vertical scrolling
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* Back button to list view */}
        <IconButton
          onClick={onBackToList}
          sx={{ color: theme.palette.text.secondary }}
        >
          <ChevronLeftIcon />
        </IconButton>
        {/* Edit and Delete buttons, visible only if user can manage stories and a story is selected */}
        {canManageStories && selectedStory && (
          <Box>
            <IconButton
              onClick={() => onOpenEditForm(selectedStory)}
              color="text.primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onOpenDeleteDialog(selectedStory)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Conditional rendering based on whether a story is selected */}
      {selectedStory ? (
        <>
          {/* Story Title */}
          <Typography
            variant="h4"
            gutterBottom
            mt={2}
            color="text.primary"
            sx={{
              fontWeight: 800,
              fontSize: "2.2rem",
              lineHeight: 1.2,
            }}
          >
            {selectedStory.userStoryTitle}
          </Typography>
          {/* Story ID (last 4 characters) */}
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{ fontStyle: "italic" }}
          >
            Story #{selectedStory._id.substring(selectedStory._id.length - 4)}
          </Typography>

          {/* Story metadata chips: Priority, Status, Estimated Time, Creation Date */}
          <Grid container spacing={2} mb={2}>
            <Grid item>
              <Chip
                label={`Priority: ${selectedStory.priority}`}
                color={
                  selectedStory.priority === "High"
                    ? "error"
                    : selectedStory.priority === "Medium"
                    ? "warning"
                    : "success"
                }
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Status: ${selectedStory.status}`}
                color={
                  selectedStory.status === "COMPLETED"
                    ? "success"
                    : selectedStory.status === "AI DEVELOPED"
                    ? "secondary"
                    : selectedStory.status === "IN REVIEW"
                    ? "warning"
                    : "info"
                }
              />
            </Grid>
            <Grid item>
              <Chip label={`Estimated: ${selectedStory.estimatedTime}`} />
            </Grid>
            <Grid item>
              <Chip
                label={`Created: ${new Date(
                  selectedStory.createdAt
                ).toLocaleDateString()}`}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Truncated sections for Description, Acceptance Criteria, and Testing Scenarios */}
          <TruncatedText
            content={selectedStory.description}
            title="Description"
          />
          <TruncatedText
            content={selectedStory.acceptanceCriteria}
            title="Acceptance Criteria"
          />
          <TruncatedText
            content={selectedStory.testingScenarios}
            title="Testing Scenarios"
          />

          {/* AI Enhanced User Story content, if available */}
          {selectedStory.aiEnhancedUserStory && (
            <AIContentBox>
              <Typography
                variant="subtitle2"
                color="text.primary"
                fontWeight={600}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&::before": {
                    content: '""',
                    display: "inline-block",
                    width: "4px",
                    height: "16px",
                    backgroundColor: theme.palette.secondary.main,
                    marginRight: "8px",
                    borderRadius: "2px",
                  },
                }}
              >
                AI ENHANCED SUGGESTIONS
              </Typography>
              <TruncatedText
                content={selectedStory.aiEnhancedUserStory}
                maxLines={5}
              />
            </AIContentBox>
          )}

          {/* GitHub Details (Branch and Pull Request URL) if available */}
          {(selectedStory.githubBranch || selectedStory.prUrl) && (
            <Box
              mt={2}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.custom?.innerShadow,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.primary"
                fontWeight={600}
                mb={1}
              >
                GitHub Details:
              </Typography>
              {selectedStory.githubBranch && (
                <Typography variant="body2" color="text.primary">
                  Branch:{" "}
                  <a
                    href={`${projectGithubRepoUrl}/tree/${selectedStory.githubBranch}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    {selectedStory.githubBranch}
                  </a>
                </Typography>
              )}
              {selectedStory.prUrl && (
                <Typography variant="body2" color="text.primary">
                  Pull Request:{" "}
                  <a
                    href={selectedStory.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    View PR
                  </a>
                </Typography>
              )}
            </Box>
          )}

          {/* Assigned Collaborators */}
          {selectedStory.collaborators &&
            selectedStory.collaborators.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned Collaborators:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedStory.collaborators.map((c) => (
                    <Chip
                      key={c.githubId}
                      avatar={<Avatar src={c.avatarUrl} />} // Collaborator avatar
                      label={c.username} // Collaborator username
                      size="small"
                      color="text.primary"
                      sx={{
                        backgroundColor: theme.palette.action.selected,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

          {/* Generate Salesforce Code Button */}
          <Box sx={{ mt: "auto", pt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateSalesforceCode} // Trigger code generation
              disabled={isGeneratingCodeProcess || !projectGithubRepoUrl} // Disable if generation in progress or no repo URL
              startIcon={
                isGeneratingCodeProcess &&
                activeGenerationStoryId === selectedStory._id ? (
                  <CircularProgress size={20} color="inherit" /> // Loading spinner during generation
                ) : (
                  <AutoFixHighIcon /> // Icon for AI generation
                )
              }
              sx={{
                py: 1.5,
                borderRadius: "12px", // Rounded corners
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 15px rgba(128, 176, 255, 0.5)"
                    : "0 0 15px rgba(94, 114, 228, 0.3)", // Glow effect
              }}
            >
              {isGeneratingCodeProcess &&
              activeGenerationStoryId === selectedStory._id
                ? "Generating Code..." // Text while generating
                : "Generate Salesforce Code"}{" "}
              {/* Default text */}
            </Button>
          </Box>
        </>
      ) : (
        // Message displayed when no story is selected
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          mt={5}
        >
          Select a story from the left sidebar or create a new one.
        </Typography>
      )}
    </GlassCard>
  );
};

export default UserStoryDetail;
