// components/ProjectHeader.js
import React from "react";
import { Box, Typography, Chip, IconButton, Link, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GitHubIcon from "@mui/icons-material/GitHub";
import { styled, alpha } from "@mui/system";


// Styled component for the header, adapted for dynamic theme
const LightHeader = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)"
      : "linear-gradient(135deg, #2a2a47 0%, #1e1e35 100%)",
  color: theme.palette.text.primary,
  padding: theme.spacing(4),
  borderRadius: "20px",
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 6px 20px rgba(0,0,0,0.08)"
      : "0 8px 25px rgba(0, 0, 0, 0.4)",
  position: "relative",
  overflow: "hidden",
}));

/**
 * ProjectHeader Component
 * Displays the project's title, description, GitHub link, and provides
 * edit/delete actions for managers.
 *
 * @param {object} props - Component props.
 * @param {object} props.project - Project data object.
 * @param {string} props.user_role - Current user's role ('manager' or 'developer').
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {function} props.handleOpenEditProjectDialog - Callback to open the edit project dialog.
 * @param {function} props.handleOpenDeleteProjectDialog - Callback to open the delete project dialog.
 * @param {string} props.currentThemeMode - Current theme mode ('light' or 'dark').
 */
const ProjectHeader = ({
  project,
  user_role,
  activeTheme,
  handleOpenEditProjectDialog,
  handleOpenDeleteProjectDialog,
  currentThemeMode,
}) => {
  console.log("Project branch for sync:", project.githubBranch);
  console.log("Repo link for branch fetch:", project.githubRepoLink);

  return (
    <LightHeader className="p-6 md:p-8 mb-8">
      {/* Background glowing circles for futuristic touch in dark mode */}
      {currentThemeMode === "dark" && (
        <>
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary-dark rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary-dark rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </>
      )}
      <Box className="flex items-center flex-wrap mb-4">
        <Typography
          variant="h4"
          component="h1"
          className="font-bold mr-4"
          sx={{ color: activeTheme.palette.primary.main }}
        >
          {project?.projectName}
        </Typography>
        <Chip
          label="Active"
          size="medium"
          color="success"
          className="font-semibold text-sm px-2 py-1"
          sx={{ marginRight: 2 }}
        />
        {user_role === "manager" && (
          <Box className="ml-auto flex gap-2">
            <IconButton
              aria-label="edit project"
              onClick={handleOpenEditProjectDialog}
              sx={{
                color: activeTheme.palette.primary.main,
                bgcolor: alpha(activeTheme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(activeTheme.palette.primary.main, 0.2),
                },
              }}
              size="medium"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="delete project"
              onClick={handleOpenDeleteProjectDialog}
              sx={{
                color: activeTheme.palette.error.main,
                bgcolor: alpha(activeTheme.palette.error.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(activeTheme.palette.error.main, 0.2),
                },
              }}
              size="medium"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
      <Typography
        variant="body1"
        className="max-w-3xl mb-4"
        sx={{ color: activeTheme.palette.text.secondary }}
      >
        {project?.projectDescription}
      </Typography>
      {project?.githubRepoLink && (
        <Box className="flex items-center flex-wrap">
          <GitHubIcon
            className="mr-2"
            sx={{
              color: activeTheme.palette.primary.main,
              fontSize: "1.5rem",
            }}
          />
          <Link
            href={project.githubRepoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center font-medium text-base hover:underline"
            sx={{ color: activeTheme.palette.secondary.main }}
          >
            {project.githubRepoLink.replace("https://", "")}
          </Link>
        </Box>
      )}
    </LightHeader>
  );
};

export default ProjectHeader;
