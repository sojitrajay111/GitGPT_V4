import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const DisconnectDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Disconnect Google Drive</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to disconnect Google Drive?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Cancel</Button>
      <Button onClick={onConfirm} color="error">Disconnect</Button>
    </DialogActions>
  </Dialog>
);

export default DisconnectDialog; 