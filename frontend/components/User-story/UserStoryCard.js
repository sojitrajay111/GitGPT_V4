// components/UserStoryCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { styled } from "@mui/material/styles";

// Styled Card component for User Stories, applying dynamic styles based on story status
const StoryCard = styled(Card)(({ theme, storyStatus }) => {
  let borderColor;
  let statusChipBgColor;
  let statusChipTextColor;

  // Determine border color and chip colors based on story status
  switch (storyStatus) {
    case "AI DEVELOPED":
      borderColor = theme.palette.secondary.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSecondary
          ?.backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSecondary?.color;
      break;
    case "COMPLETED":
      borderColor = theme.palette.success.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSuccess
          ?.backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSuccess?.color;
      break;
    case "IN REVIEW":
      borderColor = theme.palette.warning.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorWarning
          ?.backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorWarning?.color;
      break;
    case "PLANNING":
      borderColor = theme.palette.info.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorInfo
          ?.backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorInfo?.color;
      break;
    default:
      borderColor = theme.palette.primary.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.root?.backgroundColor;
      statusChipTextColor = theme.palette.text.secondary;
      break;
  }

  return {
    borderLeft: `5px solid ${borderColor}`, // Left border for status indication
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.background.paper, // Card background
    color: theme.palette.text.primary, // Text color
    transition: "all 0.3s ease", // Smooth transition for hover effects
    transformStyle: "preserve-3d", // Enable 3D transforms
    "& .status-chip": {
      backgroundColor: statusChipBgColor, // Status chip background color
      color: statusChipTextColor, // Status chip text color
      fontWeight: 600,
      borderRadius: "8px",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 2px 4px rgba(0,0,0,0.3)"
          : "0 2px 4px rgba(0,0,0,0.1)", // Shadow for status chip
    },
    "& .MuiTypography-root": {
      color: theme.palette.text.primary, // Primary text color for Typography
    },
    "& .MuiTypography-caption, & .MuiTypography-body2": {
      color: theme.palette.text.secondary, // Secondary text color for captions and body2
    },
    "&:hover": {
      transform:
        "translateY(-5px) perspective(1000px) rotateX(1deg) rotateY(1deg)", // Lift and slight rotation on hover
      boxShadow:
        theme.palette.mode === "dark"
          ? "12px 12px 24px rgba(0,0,0,0.6), -12px -12px 24px rgba(50,50,50,0.4)"
          : "12px 12px 24px rgba(0,0,0,0.15), -12px -12px 24px rgba(255,255,255,0.9)", // Enhanced shadow on hover
      backgroundColor: theme.palette.action.hover, // Background color on hover
    },
  };
});

/**
 * Renders a single user story card in the list view.
 *
 * @param {object} props - The component props.
 * @param {object} props.story - The user story object to display.
 * @param {boolean} props.isSelected - Indicates if this story is currently selected.
 * @param {function} props.onClick - Callback function when the card is clicked.
 */
const UserStoryCard = ({ story, isSelected, onClick }) => {
  const theme = useTheme(); // Access the current theme for styling

  return (
    <StoryCard
      storyStatus={story.status} // Pass story status to styled component for dynamic styling
      onClick={onClick} // Handle card click
      sx={{
        cursor: "pointer", // Indicate clickable item
        backgroundColor: isSelected
          ? theme.palette.action.selected // Highlight if selected
          : theme.palette.background.paper, // Default background
      }}
    >
      <CardContent>
        {/* Story title and AI Developed chip */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={0.5}
        >
          <Typography variant="body1" fontWeight={600} flexGrow={1}>
            {story.userStoryTitle}
          </Typography>
          {story.status === "AI DEVELOPED" && (
            <Chip
              label="AI DEVELOPED"
              color="secondary"
              size="small"
              sx={{ ml: 1 }} // Margin left for spacing
            />
          )}
        </Box>
        {/* Collaborator and Estimated Time */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          variant="caption"
          color="text.secondary"
          mt={0.5}
        >
          <Typography variant="caption">
            {story.collaborators?.[0]?.username || "Unassigned"}
          </Typography>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon
              sx={{
                fontSize: "0.9rem",
                mr: 0.5,
                color: theme.palette.text.secondary,
              }}
            />
            <Typography variant="caption">{story.estimatedTime}</Typography>
          </Box>
        </Box>
        {/* Status and Priority Chips */}
        <Box mt={1}>
          <Chip
            label={story.status}
            size="small"
            className="status-chip" // Class for custom styling based on status
          />
          <Chip
            label={`Priority: ${story.priority}`}
            size="small"
            sx={{ ml: 1 }} // Margin left for spacing
            color={
              story.priority === "High"
                ? "error" // Red for high priority
                : story.priority === "Medium"
                ? "warning" // Orange for medium priority
                : "success" // Green for low priority
            }
          />
        </Box>
      </CardContent>
    </StoryCard>
  );
};

export default UserStoryCard;
