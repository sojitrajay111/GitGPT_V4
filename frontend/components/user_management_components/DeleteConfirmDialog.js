import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

const DeleteConfirmDialog = ({
  open,
  onClose,
  executeDelete,
  isDeletingUser,
  theme,
  newBoxShadow,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        borderRadius: 3,
        background: theme === "dark" ? "#181A20" : "#fff",
        sx: {
          boxShadow: newBoxShadow,
        },
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700, color: "#D32F2F" }}>
        {"Confirm Delete"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ color: theme === "dark" ? "#B0B3B8" : "#4A4A4A" }}
        >
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme === "dark" ? "#B0B3B8" : "#607d8b",
            borderRadius: 2.5,
            "&:hover": {
              backgroundColor:
                theme === "dark" ? "#23272F" : "rgba(96, 125, 139, 0.05)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={executeDelete}
          color="error"
          variant="contained"
          autoFocus
          sx={{
            background: `linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)`,
            "&:hover": { opacity: 0.9 },
            borderRadius: 2.5,
            color: "#fff",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isDeletingUser ? <CircularProgress size={24} color="inherit" /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog; 