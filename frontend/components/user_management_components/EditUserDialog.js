import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import { SynthToggle } from "@/components/ui";

const EditUserDialog = ({
  open,
  onClose,
  currentUserToEdit,
  editJobRole,
  setEditJobRole,
  editCustomJobRole,
  setEditCustomJobRole,
  editUserStatus,
  setEditUserStatus,
  handleUpdateUserSubmit,
  isUpdatingUser,
  inputSx,
  newBoxShadow,
  theme,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        borderRadius: 4,
        background: theme === "dark" ? "#181A20" : "#fff",
        sx: {
          boxShadow: newBoxShadow,
        },
      }}
    >
      <DialogTitle
        sx={{
          background:
            theme === "dark"
              ? `linear-gradient(135deg, #6366F1 0%, #5F4BFF 100%)`
              : "#6366F1",
          color: "white",
          fontWeight: "bold",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          fontSize: 22,
          letterSpacing: 1,
          py: 2,
        }}
      >
        Edit User: {currentUserToEdit?.username}
      </DialogTitle>
      <DialogContent
        sx={{ py: 0, pt: 3, px: 4, background: theme === "dark" ? "#181A20" : "#fff" }}
      >
        <TextField
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={currentUserToEdit?.username}
          sx={{
            ...inputSx,
            mt: 3,
          }}
          InputProps={{
            readOnly: true,
            sx: {
              backgroundColor: theme === "dark" ? "#2F343C" : "#E0E0E0",
              cursor: "not-allowed",
              "& .MuiInputBase-input": {
                color: theme === "dark" ? "#B0B3B8" : "#555 !important",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:hover": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:focus": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:active": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
            },
          }}
        />
        <TextField
          label="User Email"
          type="email"
          fullWidth
          variant="outlined"
          value={currentUserToEdit?.email}
          sx={{
            ...inputSx,
            mt: 2,
          }}
          InputProps={{
            readOnly: true,
            sx: {
              backgroundColor: theme === "dark" ? "#2F343C" : "#E0E0E0",
              cursor: "not-allowed",
              "& .MuiInputBase-input": {
                color: theme === "dark" ? "#B0B3B8" : "#555 !important",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:hover": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:focus": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
              "& input:-webkit-autofill:active": {
                WebkitBoxShadow:
                  `0 0 0 1000px ${
                    theme === "dark" ? "#2F343C" : "#E0E0E0"
                  } inset !important`,
                WebkitTextFillColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
                caretColor:
                  `${
                    theme === "dark" ? "#B0B3B8" : "#555"
                  } !important`,
              },
            },
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Select
            fullWidth
            displayEmpty
            value={editJobRole || ""}
            onChange={(e) => {
              setEditJobRole(e.target.value);
              if (e.target.value !== "Custom") setEditCustomJobRole("");
            }}
            sx={{
              ...inputSx,
              minWidth: 120,
              borderRadius: 2.5,
              "& .MuiOutlinedInput-root": {
                boxShadow: newBoxShadow,
                background:
                  `${
                    theme === "dark" ? "#23272F" : "#E8EDF2"
                  } !important`,
              },
            }}
            renderValue={(selected) => (
              <Typography sx={{ color: theme === "dark" ? "#F3F4F6" : "#222" }}>
                {selected || "Select Job Role"}
              </Typography>
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  background:
                    `${
                      theme === "dark" ? "#23272F" : "#fff"
                    } !important`,
                  background: theme === "dark" ? "#23272F" : "#fff",
                  borderRadius: 2.5,
                  boxShadow: "0px 8px 32px rgba(31,38,135,0.18)",
                  "& .MuiMenuItem-root": {
                    color: theme === "dark" ? "#F3F4F6" : "#222",
                    "&:hover": {
                      backgroundColor: theme === "dark" ? "#2F343C" : "#e0e0e0",
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="Senior Developer">Senior Developer</MenuItem>
            <MenuItem value="Junior Developer">Junior Developer</MenuItem>
            <MenuItem value="Business Analyst">Business Analyst</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </Select>
          {editJobRole === "Custom" && (
            <TextField
              margin="dense"
              label="Custom Job Role"
              fullWidth
              value={editCustomJobRole}
              onChange={(e) => setEditCustomJobRole(e.target.value)}
              sx={{ ...inputSx, mt: 1 }}
            />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
            pr: 1,
          }}
        >
          <Typography variant="body1" sx={{ color: theme === "dark" ? "#F3F4F6" : "#222" }}>
            User Status:
          </Typography>
          <SynthToggle
            label={editUserStatus ? "Active" : "Inactive"}
            checked={editUserStatus}
            onCheckedChange={(e) => setEditUserStatus(e.target.checked)}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 4,
          py: 2,
          background: theme === "dark" ? "#181A20" : "#fff",
        }}
      >
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
          onClick={handleUpdateUserSubmit}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
            "&:hover": { opacity: 0.9 },
            borderRadius: 2.5,
            color: "#fff",
            fontWeight: 600,
            px: 3,
          }}
          disabled={isUpdatingUser}
        >
          {isUpdatingUser ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog; 