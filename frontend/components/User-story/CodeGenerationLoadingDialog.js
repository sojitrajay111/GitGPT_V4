// components/CodeGenerationLoadingDialog.jsx
import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  LinearProgress,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { styled, keyframes } from "@mui/material/styles";

// Keyframes for various animations
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
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

// Styled Dialog for the loading animation
const LoadingDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "24px", // Highly rounded corners
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(145deg, #181818 0%, #000000 100%)"
        : "linear-gradient(145deg, #f5f7fa 0%, #e0e0e0 100%)", // Gradient background
    color: theme.palette.text.primary, // Text color
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 50px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.6)"
        : "0 20px 50px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)", // Strong shadow
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.1)", // Border
    padding: theme.spacing(4), // Padding
    maxWidth: "500px", // Max width
    width: "90%", // Responsive width
    textAlign: "center", // Center align content
    transformStyle: "preserve-3d", // Enable 3D transforms
    perspective: "1000px", // Perspective for 3D
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        theme.palette.mode === "dark"
          ? "linear-gradient(45deg, rgba(128,176,255,0.1) 0%, transparent 50%, rgba(224,176,255,0.1) 100%)"
          : "linear-gradient(45deg, rgba(94,114,228,0.1) 0%, transparent 50%, rgba(17,205,239,0.1) 100%)", // Inner gradient animation
      animation: `${rotate} 20s linear infinite`, // Rotation animation
      opacity: 0.5, // Semi-transparent
    },
  },
}));

// Styled Box for animated icon
const AnimatedIcon = styled(Box)(({ theme }) => ({
  fontSize: "4rem", // Large icon size
  marginBottom: theme.spacing(3), // Bottom margin
  color: theme.palette.primary.main, // Icon color
  animation: `${rotate} 2s linear infinite, ${float} 3s ease-in-out infinite`, // Rotate and float animations
  display: "inline-block", // Inline block display
  filter:
    theme.palette.mode === "dark"
      ? "drop-shadow(0 0 5px rgba(128, 176, 255, 0.7))"
      : "drop-shadow(0 0 5px rgba(94, 114, 228, 0.5))", // Drop shadow for glow effect
}));

// Styled Typography for status messages
const StatusMessage = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem", // Font size
  fontWeight: 600, // Bold font weight
  color: theme.palette.text.primary, // Text color
  marginBottom: theme.spacing(2), // Bottom margin
  animation: theme.palette.mode === "dark" ? `${neonGlow} 2s infinite` : "none", // Neon glow animation in dark mode
}));

// Styled Box for completed steps list
const CompletedStepsList = styled(Box)(({ theme }) => ({
  maxHeight: "150px", // Max height for scrolling
  overflowY: "auto", // Enable vertical scrolling
  textAlign: "left", // Left align text
  paddingLeft: theme.spacing(2), // Left padding
  marginTop: theme.spacing(2), // Top margin
  borderLeft: `2px solid ${theme.palette.secondary.main}`, // Left border as highlight
  "&::-webkit-scrollbar": {
    width: "6px", // Scrollbar width
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent", // Transparent track
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.mode === "dark" ? "#555" : "#888", // Scrollbar thumb color
    borderRadius: "3px", // Rounded scrollbar thumb
  },
}));

// Styled Typography for individual completed step items
const CompletedStepItem = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem", // Font size
  color: theme.palette.text.secondary, // Text color
  display: "flex",
  alignItems: "center", // Align items vertically
  marginBottom: theme.spacing(1), // Bottom margin
  animation: `${fadeIn} 0.5s ease-out`, // Fade-in animation
  "& svg": {
    marginRight: theme.spacing(1), // Right margin for icon
    color: theme.palette.success.main, // Icon color
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0 0 3px rgba(45, 206, 137, 0.5))"
        : "none", // Drop shadow for icon glow
  },
}));

/**
 * Renders a dialog displaying the progress and status of AI code generation.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {string} props.currentGenerationStatus - The current status message.
 * @param {Array<object>} props.completedGenerationSteps - List of completed steps.
 * @param {string | null} props.generationError - Error message if generation failed.
 * @param {object | null} props.githubResult - GitHub result object on successful completion.
 * @param {string} props.projectGithubRepoUrl - The GitHub repository URL for the project.
 */
const CodeGenerationLoadingDialog = ({
  open,
  onClose,
  currentGenerationStatus,
  completedGenerationSteps,
  generationError,
  githubResult,
  projectGithubRepoUrl,
}) => {
  const theme = useTheme(); // Access the current theme for styling

  // Handler for closing the dialog, with a specific message if generation is in progress
  const handleClose = (event, reason) => {
    if (reason === "escapeKeyDown" || reason === "backdropClick") {
      // Prevent closing if generation is in progress, encourage using the "Close" button
      // showSnackbar is not directly available here, so you might lift this state or handle it in parent
      console.log(
        "Code generation is in progress. Please use the 'Close' button."
      );
      return;
    }
    onClose();
  };

  return (
    <LoadingDialog
      open={open}
      onClose={handleClose} // Use custom handleClose
      aria-labelledby="loading-dialog-title"
    >
      {/* Dialog Title, dynamic based on success or error */}
      <DialogTitle
        id="loading-dialog-title"
        sx={{ color: "primary.main", fontWeight: 700 }}
      >
        {generationError
          ? "Code Generation Failed"
          : "AI Code Generation Progress"}
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        {!generationError && !githubResult ? (
          // Display progress animation and status if no error and not completed
          <>
            <AnimatedIcon>
              <AutoFixHighIcon sx={{ fontSize: "inherit" }} />
            </AnimatedIcon>
            <StatusMessage>{currentGenerationStatus}</StatusMessage>
            <LinearProgress
              color="primary"
              sx={{
                my: 2,
                height: 8,
                borderRadius: 5,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#3a3a3a" : "rgba(0,0,0,0.1)",
              }}
            />
          </>
        ) : (
          // Display error or success message
          <>
            {generationError ? (
              // Error state
              <Box>
                <Typography color="error" variant="h6" mb={2}>
                  Error: {generationError}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Please check the backend logs for more details or try again.
                </Typography>
              </Box>
            ) : (
              // Success state (githubResult is present)
              githubResult && (
                <Box>
                  <CheckCircleOutlineIcon
                    sx={{
                      fontSize: "4rem",
                      color: "success.main",
                      mb: 2,
                      animation: `${pulse} 1.5s infinite`,
                      filter: "drop-shadow(0 0 5px rgba(45, 206, 137, 0.5))",
                    }}
                  />
                  <Typography color="success.main" variant="h6" mb={1}>
                    Process Completed Successfully!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Your Salesforce code has been generated and pushed to
                    GitHub.
                  </Typography>
                  <Box mb={2}>
                    {/* Link to GitHub Branch */}
                    <Typography variant="body2" color="text.secondary">
                      Branch:{" "}
                      <a
                        href={
                          projectGithubRepoUrl +
                          "/tree/" +
                          githubResult.githubBranch
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.palette.secondary.main,
                          textDecoration: "underline",
                        }}
                      >
                        {githubResult.githubBranch}
                      </a>
                    </Typography>
                    {/* Link to Pull Request */}
                    <Typography variant="body2" color="text.secondary">
                      Pull Request:{" "}
                      <a
                        href={githubResult.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.palette.secondary.main,
                          textDecoration: "underline",
                        }}
                      >
                        View PR
                      </a>
                    </Typography>
                  </Box>
                </Box>
              )
            )}
          </>
        )}

        {/* List of completed generation steps */}
        <CompletedStepsList>
          {completedGenerationSteps.map((step, index) => (
            <CompletedStepItem key={index}>
              <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
              {step.message}
            </CompletedStepItem>
          ))}
        </CompletedStepsList>
      </DialogContent>
      {/* Dialog Actions (Close button) */}
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button
          onClick={onClose} // Close the dialog
          variant="contained"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </LoadingDialog>
  );
};

export default CodeGenerationLoadingDialog;
