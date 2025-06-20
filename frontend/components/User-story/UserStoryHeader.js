// components/UserStoryHeader.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

/**
 * Renders the header section of the User Story page.
 * Includes the page title and a button to create a new user story.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.canManageStories - Indicates if the user has permission to manage stories.
 * @param {function} props.onOpenCreateForm - Callback function to open the create story form.
 */
const UserStoryHeader = ({ canManageStories, onOpenCreateForm }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
    >
      {/* Page title */}
      <Typography variant="h5" component="h2" fontWeight={700}>
        User Stories
      </Typography>
      {/* Button to create a new user story, visible only if user can manage stories */}
      {canManageStories && (
        <Button
          variant="contained"
          size="small"
          onClick={onOpenCreateForm}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: "12px", // Rounded corners for the button
          }}
        >
          New
        </Button>
      )}
    </Box>
  );
};

export default UserStoryHeader;
