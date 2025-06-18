// components/ProjectModules.js
import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { styled, alpha } from "@mui/system";

// Styled component for action buttons, adapted for dynamic theme
const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "16px",
  padding: theme.spacing(2.5),
  minWidth: "180px",
  height: "150px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  transition: "all 0.3s ease",
  backgroundColor:
    theme.palette.mode === "light"
      ? "#ffffff"
      : alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${
    theme.palette.mode === "light"
      ? "#e5e7eb"
      : alpha(theme.palette.primary.light, 0.2)
  }`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 2px 10px rgba(0,0,0,0.05)"
      : `0 4px 15px ${alpha(theme.palette.primary.dark, 0.2)}`,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "#f9fafb"
        : alpha(theme.palette.background.paper, 0.9),
    borderColor: theme.palette.primary.main,
    transform: "translateY(-5px)",
    boxShadow:
      theme.palette.mode === "light"
        ? "0 8px 25px rgba(0,0,0,0.1)"
        : `0 8px 25px ${alpha(theme.palette.primary.dark, 0.4)}`,
  },
  "& .MuiButton-startIcon": {
    margin: 0,
    marginBottom: theme.spacing(1.5),
    fontSize: "3rem",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    backgroundColor:
      theme.palette.mode === "light"
        ? "#f5f5f5"
        : alpha(theme.palette.background.paper, 0.4),
    border: `1px solid ${
      theme.palette.mode === "light"
        ? "#e5e7eb"
        : alpha(theme.palette.text.secondary, 0.2)
    }`,
    color: theme.palette.text.secondary,
    boxShadow: "none",
    transform: "none",
    cursor: "not-allowed",
    "& .MuiButton-startIcon": {
      color: theme.palette.text.secondary,
    },
  },
}));

/**
 * ProjectModules Component
 * Displays a grid of action buttons for various project modules.
 * Handles navigation based on user role and permissions.
 *
 * @param {object} props - Component props.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {function} props.handleButtonClick - Callback function to handle button clicks and navigation.
 * @param {string} props.user_role - Current user's role ('manager' or 'developer').
 * @param {Array<string>} props.developerPermissions - List of permissions for the current developer.
 */
const ProjectModules = ({
  activeTheme,
  handleButtonClick,
  user_role,
  developerPermissions,
}) => {
  return (
    <>
      <Typography
        variant="h5"
        component="h2"
        className="font-bold mb-4"
        sx={{ color: activeTheme.palette.text.primary }}
      >
        Project Modules
      </Typography>
      <Grid container spacing={4} className="mb-8 mt-2">
        <Grid item xs={12} sm={6} md={3}>
          <ActionButton
            onClick={() => handleButtonClick("userStory")}
            startIcon={
              <DescriptionIcon sx={{ color: activeTheme.palette.info.main }} />
            }
          >
            <Typography
              variant="subtitle1"
              className="font-semibold"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              User Stories
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: activeTheme.palette.text.secondary }}
            >
              Define & Track requirements
            </Typography>
          </ActionButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActionButton
            onClick={() => {
              if (
                user_role === "manager" ||
                developerPermissions?.includes("Code analysis")
              ) {
                handleButtonClick("codeAnalysis");
              } else {
                console.warn(
                  "Insufficient permissions to access Code Analysis."
                );
              }
            }}
            disabled={
              !(
                user_role === "manager" ||
                developerPermissions?.includes("Code analysis")
              )
            }
            startIcon={
              <CodeIcon sx={{ color: activeTheme.palette.secondary.main }} />
            }
          >
            <Typography
              variant="subtitle1"
              className="font-semibold"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Code Analysis
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: activeTheme.palette.text.secondary }}
            >
              Review & Optimize codebase
            </Typography>
          </ActionButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActionButton
            onClick={() => handleButtonClick("documentation")}
            startIcon={
              <DescriptionIcon
                sx={{ color: activeTheme.palette.primary.light }}
              />
            }
          >
            <Typography
              variant="subtitle1"
              className="font-semibold"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Documentation
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: activeTheme.palette.text.secondary }}
            >
              Manage project blueprints
            </Typography>
          </ActionButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActionButton
            onClick={() => handleButtonClick("managePrBranches")}
            startIcon={
              <AccountTreeIcon
                sx={{ color: activeTheme.palette.success.main }}
              />
            }
          >
            <Typography
              variant="subtitle1"
              className="font-semibold"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              PR & Branches
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: activeTheme.palette.text.secondary }}
            >
              Streamline code integration
            </Typography>
          </ActionButton>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectModules;
