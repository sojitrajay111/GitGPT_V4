// components/TruncatedText.jsx
import React, { useState } from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";

/**
 * A component that displays text, truncating it if it exceeds a specified number of lines.
 * Provides a "Read More" / "Show Less" button to toggle full content visibility.
 *
 * @param {object} props - The component props.
 * @param {string} props.content - The full text content to display.
 * @param {number} [props.maxLines=5] - The maximum number of lines to show before truncating.
 * @param {string} [props.title] - An optional title to display above the content.
 */
const TruncatedText = ({ content, maxLines = 5, title }) => {
  const [expanded, setExpanded] = useState(false); // State to manage expansion of text
  const theme = useTheme(); // Access the current theme for styling
  const lines = content ? content.split("\n") : []; // Split content into lines
  const needsTruncation = lines.length > maxLines; // Determine if truncation is needed

  // Determine the content to display based on expansion state
  const displayedContent =
    expanded || !needsTruncation
      ? content // Show full content if expanded or no truncation needed
      : lines.slice(0, maxLines).join("\n") + (needsTruncation ? "..." : ""); // Show truncated content with ellipsis

  return (
    <Box mb={2}>
      {/* Optional title for the text block */}
      {title && (
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={600}
          mb={1}
          sx={{
            display: "flex",
            alignItems: "center",
            "&::before": {
              content: '""',
              display: "inline-block",
              width: "4px",
              height: "16px",
              backgroundColor: theme.palette.primary.main, // Color bar before title
              marginRight: "8px",
              borderRadius: "2px",
            },
          }}
        >
          {title}
        </Typography>
      )}
      {/* Displayed content */}
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
          lineHeight: 1.6, // Adjust line height for readability
        }}
      >
        {displayedContent}
      </Typography>
      {/* "Read More" / "Show Less" button if truncation is needed */}
      {needsTruncation && (
        <Button
          onClick={() => setExpanded(!expanded)} // Toggle expanded state
          size="small"
          sx={{
            mt: 1, // Top margin
            p: 0, // No padding
            color: theme.palette.primary.main, // Button color
            "&:hover": {
              backgroundColor: "transparent", // Transparent background on hover
              textDecoration: "underline", // Underline text on hover
            },
          }}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </Box>
  );
};

export default TruncatedText;
