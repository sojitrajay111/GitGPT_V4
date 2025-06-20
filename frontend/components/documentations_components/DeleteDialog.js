import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

const DeleteDialog = ({ open, onClose, onConfirm, documentTitle, isDeleting }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs">
    <DialogTitle sx={{ backgroundColor: "error.main", color: "white" }}>
      <DeleteIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Confirm Deletion
    </DialogTitle>
    <DialogContent sx={{ pt: "20px !important" }}>
      <Typography>
        Are you sure you want to delete the document: <br />
        <strong>"{documentTitle}"</strong>?
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
        This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: "16px 24px" }}>
      <Button onClick={onClose} variant="text" sx={{ color: "text.secondary" }}>
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" disabled={isDeleting}>
        {isDeleting ? <CircularProgress size={22} color="inherit" /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteDialog; 