import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import ArtifactCard from "./ArtifactCard";
import { SynthButton } from "../ui/SynthButton";

const ArtifactGrid = ({
  documents = [],
  isDark = false,
  isGoogleDriveConnected = false,
  isConnectingGoogleDrive = false,
  onUpload,
  onConnect,
  onDelete,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <Grid item xs={12}>
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 3, sm: 5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            border: isDark ? "2px dashed #444" : "2px dashed #ddd",
            background: isDark ? "#161717" : "#fff",
            borderRadius: 4,
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.18)"
              : "0 8px 32px rgba(100,120,150,0.08)",
          }}
        >
          <NotesIcon sx={{ fontSize: 60, color: isDark ? "#555" : "#bbb", mb: 2 }} />
          <Typography variant="h5" color={isDark ? "#fff" : "#23242A"} gutterBottom>
            No Artifacts Yet
          </Typography>
          <Typography
            variant="body1"
            color={isDark ? "#B0B3B8" : "#6B7280"}
            sx={{ mb: 3 }}
          >
            {isGoogleDriveConnected 
              ? "It looks a bit empty here. Start by uploading an artifact to Google Drive."
              : "Connect to Google Drive first to start uploading and managing your project artifacts."
            }
          </Typography>
          {isGoogleDriveConnected ? (
            <SynthButton
              variant="primary"
              size="sm"
              onClick={onUpload}
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: isDark
                  ? "0 4px 24px 0 rgba(80,80,120,0.18)"
                  : "0 4px 24px 0 rgba(120,120,180,0.10)",
                borderRadius: 3,
                px: 3,
                height: 24,
              }}
              style={{
                background: "#818CF8"
              }}
            >
              <CloudUploadIcon style={{ fontSize: 22, marginRight: 8 }} />
              Upload Artifact
            </SynthButton>
          ) : (
            <SynthButton
              variant="primary"
              size="sm"
              onClick={onConnect}
              disabled={isConnectingGoogleDrive}
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: isDark
                  ? "0 4px 24px 0 rgba(80,80,120,0.18)"
                  : "0 4px 24px 0 rgba(120,120,180,0.10)",
                borderRadius: 3,
                px: 3,
                height: 24,
              }}
              style={{
                background: "#A78BFA"
              }}
            >
              {isConnectingGoogleDrive ? (
                <span style={{ marginRight: 8 }}>Connecting...</span>
              ) : (
                <CloudSyncIcon style={{ fontSize: 22, marginRight: 8 }} />
              )}
              {isConnectingGoogleDrive ? 'Connecting...' : 'Sync with Cloud'}
            </SynthButton>
          )}
        </Box>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4}>
      {documents.map((doc) => (
        <Grid item xs={12} sm={6} md={3} lg={3} key={doc._id} sx={{ display: 'flex', justifyContent: 'center' }}>
          <ArtifactCard doc={doc} isDark={isDark} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ArtifactGrid; 