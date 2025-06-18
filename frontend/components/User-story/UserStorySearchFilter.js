// components/UserStorySearchFilter.jsx
import React from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Renders the search bar and the "Show Completed" filter switch for user stories.
 *
 * @param {object} props - The component props.
 * @param {string} props.searchTerm - The current search term.
 * @param {function} props.onSearchTermChange - Callback function for search term changes.
 * @param {boolean} props.showCompleted - Indicates if completed stories are currently shown.
 * @param {function} props.onShowCompletedChange - Callback function for "Show Completed" switch changes.
 */
const UserStorySearchFilter = ({
  searchTerm,
  onSearchTermChange,
  showCompleted,
  onShowCompletedChange,
}) => {
  const theme = useTheme(); // Access the current theme for styling

  return (
    <>
      {/* Search input field */}
      <TextField
        fullWidth
        label="Search stories..."
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        InputProps={{
          endAdornment: (
            // Search icon at the end of the input field
            <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
          ),
          sx: {
            borderRadius: "25px", // Highly rounded corners for the search bar
            paddingLeft: "12px", // Left padding for input content
            backgroundColor:
              theme.palette.mode === "dark" ? "#1a1a1a" : "#ffffff", // Background color based on theme
            boxShadow: theme.palette.custom.innerShadow, // Inner shadow effect
            "& fieldset": { border: "none" }, // Remove default fieldset border
          },
        }}
        InputLabelProps={{
          sx: { color: theme.palette.text.secondary }, // Label color
        }}
        sx={{ mb: 2 }} // Bottom margin
      />

      {/* Box for "Show Completed" switch with shadow effect */}
      <Box
        sx={{
          boxShadow:
            "rgba(0, 0, 0, 0.09) 0px 2px 1px, " +
            "rgba(0, 0, 0, 0.09) 0px 4px 2px, " +
            "rgba(0, 0, 0, 0.09) 0px 8px 4px, " +
            "rgba(0, 0, 0, 0.09) 0px 16px 8px, " +
            "rgba(0, 0, 0, 0.09) 0px 32px 16px",
          p: 2, // Padding
          borderRadius: 2, // Rounded corners
          mb: 2, // Bottom margin
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "white", // Background color
        }}
      >
        <FormControlLabel
          control={
            // Switch component
            <Switch
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            // Label for the switch
            <Typography variant="body2" color="text.primary">
              Show Completed
            </Typography>
          }
        />
      </Box>

      {/* Divider for visual separation */}
      <Divider sx={{ mb: 2 }} />
    </>
  );
};

export default UserStorySearchFilter;
