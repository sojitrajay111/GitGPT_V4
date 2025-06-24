import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";

const FileInputButton = ({ children, ...props }) => (
  <Button
    component="label"
    fullWidth
    sx={props.sx}
    style={props.style}
    {...props}
  >
    {children}
    <input type="file" hidden onChange={props.onChange} accept={props.accept} />
  </Button>
);

const EditDialog = ({
  open,
  onClose,
  onChange,
  onFileChange,
  onSubmit,
  form,
  isUpdating,
  isDark,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ color: "primary.dark" }}>
      <EditIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Edit Document Details
    </DialogTitle>
    <DialogContent dividers sx={{ p: 3 }}>
      <TextField
        autoFocus
        margin="dense"
        name="documentTitle"
        label="Document Title"
        type="text"
        fullWidth
        value={form.documentTitle}
        onChange={onChange}
        sx={{ mb: 2.5 }}
        required
      />
      <TextField
        margin="dense"
        name="documentShortDescription"
        label="Short Description"
        type="text"
        fullWidth
        multiline
        rows={3}
        value={form.documentShortDescription}
        onChange={onChange}
        sx={{ mb: 2.5 }}
        required
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
        Replace existing file (optional):
      </Typography>
      <FileInputButton onChange={onFileChange} accept=".pdf,.doc,.docx,.txt,text/plain">
        <CloudUploadIcon sx={{ fontSize: 36, mb: 1 }} />
        {form.documentFile ? form.documentFile.name : "Click to Select New File"}
        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: isDark ? '#fff' : undefined }}>
          (PDF, DOCX, TXT)
        </Typography>
      </FileInputButton>
      {form.documentFile && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          Selected for replacement: {form.documentFile.name}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ p: "16px 24px" }}>
      <Button onClick={onClose} variant="text" sx={{ color: "text.secondary" }}>
        Cancel
      </Button>
      <Button onClick={onSubmit} variant="contained" color="primary" disabled={isUpdating || !form.documentTitle}>
        {isUpdating ? <CircularProgress size={22} color="inherit" /> : "Save Changes"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditDialog; 