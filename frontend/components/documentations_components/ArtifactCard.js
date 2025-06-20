import React from "react";
import { Box, Typography, IconButton, Tooltip, Divider } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

// Helper for file size formatting
function formatFileSize(size) {
  if (!size || isNaN(size)) return "-";
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}
// Helper for time ago
function timeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const CARD_WIDTH = 260;
const DESC_MAX_WIDTH = 200;

const ArtifactCard = ({ doc, isDark, onDelete }) => (
  <Box
    sx={{
      background: isDark ? "#23242A" : "#fff",
      borderRadius: 4,
      boxShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.18)"
        : "0 8px 32px rgba(100,120,150,0.08)",
      p: 3,
      display: "flex",
      flexDirection: "column",
      minHeight: 220,
      maxHeight: 220,
      width: CARD_WIDTH,
      maxWidth: '100%',
      position: "relative",
      transition: "box-shadow 0.2s, transform 0.2s",
      '&:hover': {
        boxShadow: isDark
          ? "0 16px 48px rgba(0,0,0,0.28)"
          : "0 16px 48px rgba(100,120,150,0.16)",
        transform: "translateY(-2px) scale(1.01)",
      },
    }}
  >
    {/* File Icon */}
    <Box sx={{ position: "absolute", top: 18, left: 18 }}>
      <CloudUploadIcon sx={{ fontSize: 32, color: isDark ? "#B0B3B8" : "#6366F1" }} />
    </Box>
    {/* Download Icon */}
    <Box sx={{ position: "absolute", top: 18, right: 18, display: 'flex', gap: 1 }}>
      {(doc.googleDriveViewLink && doc.googleDriveViewLink !== "N/A (Generated Document)") || 
       (doc.cloudinaryLink && doc.cloudinaryLink !== "N/A (Generated Document)") ? (
        <Tooltip title="View" arrow>
          <IconButton
            onClick={() => {
              const viewLink = doc.googleDriveViewLink || doc.cloudinaryLink;
              window.open(viewLink, '_blank');
            }}
            sx={{ color: isDark ? "#fff" : "#6366F1", background: isDark ? "#181A20" : "#E8EAF6", borderRadius: 2 }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton disabled sx={{ color: isDark ? "#555" : "#bbb", background: isDark ? "#181A20" : "#E8EAF6", borderRadius: 2 }}>
          <VisibilityIcon />
        </IconButton>
      )}
      <Tooltip title="Delete" arrow>
        <IconButton
          onClick={() => onDelete(doc)}
          sx={{ ml: 1, color: isDark ? '#F87171' : '#B91C1C', background: isDark ? '#181A20' : '#FEE2E2', borderRadius: 2 }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
    {/* Title */}
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        color: isDark ? "#fff" : "#23242A",
        mt: 4,
        mb: 0.5,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={doc.documentTitle}
    >
      {doc.documentTitle}
    </Typography>
    {/* Description */}
    <Typography
      sx={{
        color: isDark ? "#B0B3B8" : "#6B7280",
        fontSize: 15,
        mb: 0.5,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        width: '100%',
        minHeight: 24,
        maxWidth: DESC_MAX_WIDTH,
      }}
      title={doc.documentShortDescription}
    >
      {doc.documentShortDescription || "-"}
    </Typography>
    {/* Size */}
    <Typography sx={{ color: isDark ? "#B0B3B8" : "#6B7280", fontSize: 14, mb: 0.5 }}>
      {doc.size ? formatFileSize(doc.size) : (doc.documentFile && doc.documentFile.size ? formatFileSize(doc.documentFile.size) : "-")}
    </Typography>
    <Divider sx={{ my: 1.5, borderColor: isDark ? "#333" : "#eee" }} />
    {/* Modified Time */}
    <Typography sx={{ color: isDark ? "#B0B3B8" : "#6B7280", fontSize: 13 }}>
      Modified {doc.updatedAt ? timeAgo(new Date(doc.updatedAt)) : "-"}
    </Typography>
  </Box>
);

export default ArtifactCard; 