import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { SynthButton } from "../ui/SynthButton";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";

const DocumentationHeader = ({
  isDark,
  isGoogleDriveConnected,
  isConnectingGoogleDrive,
  onGoogleDriveAuth,
  onUpload,
  onDisconnect,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: isDark ? "#fff" : "#23242A",
          mb: 0.5,
          fontSize: { xs: "2rem", sm: "2.5rem" },
        }}
      >
        Artifacts
      </Typography>
      <Typography
        sx={{
          color: isDark ? "#6B7280" : "#6B7280",
          fontSize: { xs: "1rem", sm: "1.15rem" },
          mb: 2,
        }}
      >
        Manage and organize your project documents
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {!isGoogleDriveConnected && (
        <SynthButton
          variant="primary"
          size="sm"
          onClick={onGoogleDriveAuth}
          disabled={isConnectingGoogleDrive}
          sx={{
            
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 3,
            px: 3,
            height: 24,
            boxShadow: isDark
              ? "0 4px 24px 0 rgba(80,80,120,0.18)"
              : "0 4px 24px 0 rgba(120,120,180,0.10)",
          }}
          style={{
            background: "#A78BFA"
          }}
        >
          {isConnectingGoogleDrive ? (
            <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
          ) : (
            <CloudSyncIcon style={{ fontSize: 22, marginRight: 8 }} />
          )}
          {isConnectingGoogleDrive ? 'Connecting...' : 'Sync with Cloud'}
        </SynthButton>
      )}
      <SynthButton
        variant="primary"
        size="sm"
        onClick={onUpload}
        style={{
          backgroundColor: isDark ? '#a78bfa' : '#a78bfa',
          color: '#fff',
          background: "#818CF8"
        }}
        sx={{
          background: "#818CF8",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 3,
          px: 2,
          height: 36,
          boxShadow: isDark
            ? "0 4px 24px 0 rgba(80,80,120,0.18)"
            : "0 4px 24px 0 rgba(120,120,180,0.10)",
        }}
        
        disabled={!isGoogleDriveConnected}
      >
        <CloudUploadIcon style={{ fontSize: 22, marginRight: 8 }} />
        Upload Artifact
      </SynthButton>
      {isGoogleDriveConnected && (
        <SynthButton
          variant="flat"
          size="sm"
          onClick={onDisconnect}
          style={{
            backgroundColor: isDark ? '#EF4444' : '#DC2626',
            color: '#fff'
          }}
          sx={{ height: 36, px: 2 }}
        >
          Disconnect
        </SynthButton>
      )}
    </Box>
  </Box>
);

export default DocumentationHeader; 