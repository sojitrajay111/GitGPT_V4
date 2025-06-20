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
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      mb: 2,
      gap: { xs: 2, sm: 0 },
      background: isDark ? 'transparent' : 'transparent',
    }}
  >
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: isDark ? "#fff" : "#23242A",
          mb: { xs: 0.5, sm: 0.5 },
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          wordBreak: 'break-word',
          lineHeight: { xs: 1.1, sm: 1.15 },
          textAlign: { xs: 'center', sm: 'center', md: 'left' },
        }}
      >
        Artifacts
      </Typography>
      <Typography
        sx={{
          color: isDark ? "#6B7280" : "#6B7280",
          fontSize: { xs: "0.95rem", sm: "1.15rem" },
          mb: { xs: 1.5, sm: 2 },
          wordBreak: 'break-word',
          lineHeight: { xs: 1.25, sm: 1.35 },
          textAlign: { xs: 'center', sm: 'center', md: 'left' },
        }}
      >
        Manage and organize your project documents
      </Typography>
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.5,
        width: { xs: '100%', sm: 'auto' },
        mt: { xs: 1, sm: 0 },
        background: 'transparent',
      }}
    >
      {!isGoogleDriveConnected && (
        <SynthButton
          variant="primary"
          size="sm"
          onClick={onGoogleDriveAuth}
          disabled={isConnectingGoogleDrive}
          sx={{
            background: "#A78BFA",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 3,
            px: 3,
            height: 32,
            boxShadow: isDark
              ? "0 4px 24px 0 rgba(80,80,120,0.18)"
              : "0 4px 24px 0 rgba(120,120,180,0.10)",
            width: { xs: '100%', sm: 'auto' },
          }}
          style={{ background: "#A78BFA" }}
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
          background: "#818CF8",
        }}
        sx={{
          background: "#818CF8",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 3,
          px: 2,
          height: 32,
          boxShadow: isDark
            ? "0 4px 24px 0 rgba(80,80,120,0.18)"
            : "0 4px 24px 0 rgba(120,120,180,0.10)",
          width: { xs: '100%', sm: 'auto' },
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
            color: '#fff',
          }}
          sx={{
            height: 32,
            px: 2,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Disconnect
        </SynthButton>
      )}
    </Box>
  </Box>
);

export default DocumentationHeader; 