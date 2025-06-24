import React from "react";
import { Box, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import { SynthButton } from "../ui/SynthButton";

const GoogleDriveStatus = ({
  isGoogleDriveConnected,
  googleDriveError,
  isDark,
  onConnect,
  onDisconnect,
  isConnectingGoogleDrive,
  setGoogleDriveError,
}) => (
  <>
    {googleDriveError && (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="error"
          onClose={() => setGoogleDriveError(null)}
          sx={{
            borderRadius: 2,
            background: isDark ? '#1F2937' : '#FEF2F2',
            border: isDark ? '1px solid #374151' : '1px solid #FECACA',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Google Drive Connection Error
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {googleDriveError}
          </Typography>
        </Alert>
      </Box>
    )}
    {!isGoogleDriveConnected && (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            background: isDark ? '#1E3A8A' : '#EFF6FF',
            border: isDark ? '1px solid #3B82F6' : '1px solid #BFDBFE',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 , color: isDark ? 'white' : 'black'}}>
            Google Drive Required
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 , color: isDark ? 'white' : 'black'}}>
            Connect to Google Drive to upload and manage your project artifacts. Documents will be stored securely in your GitGPT documents folder.
          </Typography>
        </Alert>
      </Box>
    )}
  </>
);

export default GoogleDriveStatus; 