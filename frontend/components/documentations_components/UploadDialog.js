import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
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

const UploadDialog = ({
  open,
  onClose,
  onChange,
  onFileChange,
  onSubmit,
  form,
  isUploading,
  isDark,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    PaperProps={{ sx: { background: isDark ? '#000000' : '#fff' } }}
  >
    <DialogTitle sx={{ color: "primary.main", background: isDark ? '#161717' : '#fff' }}>
      <UploadFileIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Upload New Document
    </DialogTitle>
    <DialogContent dividers sx={{ p: 3, background: isDark ? '#161717' : '#fff' }}>
      <TextField
        autoFocus
        margin="dense"
        name="documentTitle"
        label="Document Title"
        type="text"
        fullWidth
        value={form.documentTitle}
        onChange={onChange}
        sx={{
          mb: 2.5,
          background: isDark ? '#2f2f2f' : '#fff',
          '& .MuiInputBase-input': { color: isDark ? '#fff' : undefined },
          '& .MuiInputLabel-root': { color: isDark ? '#fff' : undefined },
        }}
        InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
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
        sx={{
          mb: 2.5,
          background: isDark ? '#2f2f2f' : '#fff',
          '& .MuiInputBase-input': { color: isDark ? '#fff' : undefined },
          '& .MuiInputLabel-root': { color: isDark ? '#fff' : undefined },
        }}
        InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
        required
      />
      <FileInputButton
        sx={{ background: isDark ? '#2f2f2f' : '#fff', border: `2px dashed ${isDark ? '#444' : '#ddd'}`, padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', color: isDark ? '#fff' : undefined, transition: 'border-color 0.3s ease, background-color 0.3s ease', '&:hover': { borderColor: '#3E63DD', backgroundColor: 'rgba(62, 99, 221, 0.05)' } }}
        onChange={onFileChange}
        accept=".pdf,.doc,.docx,.txt,text/plain"
      >
        <CloudUploadIcon sx={{ fontSize: 36, mb: 1 }} />
        {form.documentFile ? form.documentFile.name : "Click to Select File"}
        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: isDark ? '#fff' : undefined }}>
          (PDF, DOCX, TXT)
        </Typography>
      </FileInputButton>
      {form.documentFile && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          Selected: {form.documentFile.name}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ p: "16px 24px", background: isDark ? '#161717' : '#fff' }}>
      <Button onClick={onClose} variant="text" style={{ color: isDark ? '#fff' : undefined }}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        color="primary"
        disabled={isUploading || !form.documentFile || !form.documentTitle}
        style={{ color: isDark ? '#fff' : undefined, backgroundColor: "#55DD33" }}
      >
        {isUploading ? <CircularProgress size={22} color="inherit" /> : "Upload Document"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default UploadDialog; 