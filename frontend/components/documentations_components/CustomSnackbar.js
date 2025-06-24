import React from "react";
import { Snackbar, Alert } from "@mui/material";

const CustomSnackbar = ({ open, onClose, message, severity }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
      {message}
    </Alert>
  </Snackbar>
);

export default CustomSnackbar; 