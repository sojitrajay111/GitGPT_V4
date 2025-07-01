import React from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useSyncContributionsMutation } from "@/features/projectApiSlice";

export default function SyncContributionsButton({ projectId, branchName, repoUrl }) {
  const [syncContributions, { isLoading }] = useSyncContributionsMutation();
  const [alert, setAlert] = React.useState({ open: false, severity: "info", message: "" });

  const handleSync = async () => {
    try {
      await syncContributions({ projectId, branchName }).unwrap();
      setAlert({ open: true, severity: "success", message: "Contributions synced successfully!" });
    } catch (err) {
      setAlert({ open: true, severity: "error", message: err?.data?.message || "Sync failed." });
    }
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSync}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
      >
        {isLoading ? "Syncing..." : "Sync GitHub Contributions"}
      </Button>
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
} 