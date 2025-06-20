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
  IconButton,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircleOutline as VerifyIcon,
} from "@mui/icons-material";

const AddUserDialog = ({
  open,
  onClose,
  handleSubmit,
  handleAddUser,
  register,
  errors,
  usernameValue,
  usernameVerifiedAsNew,
  usernameVerificationMessage,
  handleVerifyUsername,
  isCheckingExistence,
  isAddingUser,
  isValid,
  isMobile,
  inputSx,
  newBoxShadow,
  theme,
  selectedJobRole,
  setSelectedJobRole,
  customJobRole,
  setCustomJobRole,
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
        Add New User
      </DialogTitle>
      <form onSubmit={handleSubmit(handleAddUser)}>
        <DialogContent
          sx={{ py: 3, px: 4, background: theme === "dark" ? "#181A20" : "#fff" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              {...register("username", { required: "Username is required" })}
              error={!!errors.username}
              helperText={errors.username?.message || usernameVerificationMessage}
              sx={{
                flexGrow: 1,
                width: isMobile ? "100%" : "auto", // Full width on mobile
                ...inputSx,
                "& .MuiInputBase-input:-webkit-autofill": {
                  WebkitBoxShadow:
                    "0 0 0 1000px #23272F inset !important", // Dark theme background for autofill
                  WebkitTextFillColor: "#F3F4F6 !important", // Dark theme text color for autofill
                  caretColor: "#F3F4F6 !important", // Ensure cursor color is visible
                },
                "& .MuiInputBase-input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 1000px #23272F inset !important",
                  WebkitTextFillColor: "#F3F4F6 !important",
                  caretColor: "#F3F4F6 !important",
                },
                "& .MuiInputBase-input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px #23272F inset !important",
                  WebkitTextFillColor: "#F3F4F6 !important",
                  caretColor: "#F3F4F6 !important",
                },
                "& .MuiInputBase-input:-webkit-autofill:active": {
                  WebkitBoxShadow: "0 0 0 1000px #23272F inset !important",
                  WebkitTextFillColor: "#F3F4F6 !important",
                  caretColor: "#F3F4F6 !important",
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={handleVerifyUsername}
              disabled={!usernameValue || isCheckingExistence || !!errors.username}
              sx={{
                whiteSpace: "nowrap",
                py: "12px",
                borderRadius: 2.5,
                width: isMobile ? "100%" : "auto", // Full width on mobile
                background: theme === "dark" ? "transparent" : "#fff",
                borderColor:
                  theme === "dark"
                    ? usernameVerifiedAsNew
                      ? "#4CAF50"
                      : usernameVerificationMessage.includes("❌")
                      ? "#F44336"
                      : "#6366F1"
                    : usernameVerifiedAsNew
                    ? "#4CAF50"
                    : usernameVerificationMessage.includes("❌")
                    ? "#F44336"
                    : "#6366F1",
                color:
                  theme === "dark"
                    ? usernameVerifiedAsNew
                      ? "#4CAF50"
                      : usernameVerificationMessage.includes("❌")
                      ? "#F44336"
                      : "#6366F1"
                    : usernameVerifiedAsNew
                    ? "#4CAF50"
                    : usernameVerificationMessage.includes("❌")
                    ? "#F44336"
                    : "#6366F1",
                "&:hover": {
                  borderColor:
                    theme === "dark"
                      ? usernameVerifiedAsNew
                        ? "#388E3C"
                        : usernameVerificationMessage.includes("❌")
                        ? "#D32F2F"
                        : "#5F4BFF"
                      : usernameVerifiedAsNew
                      ? "#388E3C"
                      : usernameVerificationMessage.includes("❌")
                      ? "#D32F2F"
                      : "#5F4BFF",
                  color:
                    theme === "dark"
                      ? usernameVerifiedAsNew
                        ? "#388E3C"
                        : usernameVerificationMessage.includes("❌")
                        ? "#D32F2F"
                        : "#5F4BFF"
                      : usernameVerifiedAsNew
                      ? "#388E3C"
                      : usernameVerificationMessage.includes("❌")
                      ? "#D32F2F"
                      : "#5F4BFF",
                  bgcolor:
                    theme === "dark"
                      ? usernameVerifiedAsNew
                        ? "#1F2921"
                        : usernameVerificationMessage.includes("❌")
                        ? "#2E1A1D"
                        : "#1F253C"
                      : usernameVerifiedAsNew
                      ? "#E8F5E9"
                      : usernameVerificationMessage.includes("❌")
                      ? "#FFEBEE"
                      : "#E8F0FE",
                },
              }}
            >
              {isCheckingExistence ? <CircularProgress size={20} /> : <VerifyIcon sx={{ mr: 0.5 }} />}
              Verify
            </Button>
          </Box>
          <TextField
            margin="dense"
            label="User Email"
            type="email"
            fullWidth
            variant="outlined"
            {...register("email", {
              required: "User Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={inputSx}
          />
          <Box sx={{ mt: 2 }}>
            <Select
              fullWidth
              displayEmpty
              value={selectedJobRole || ""}
              {...register("jobRole")}
              onChange={(e) => {
                setSelectedJobRole(e.target.value);
                if (e.target.value !== "Custom") setCustomJobRole("");
              }}
              sx={{
                ...inputSx,
                minWidth: 120,
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  boxShadow: newBoxShadow,
                  background: `${
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
                    background: `${
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
            {selectedJobRole === "Custom" && (
              <TextField
                margin="dense"
                label="Custom Job Role"
                fullWidth
                value={customJobRole}
                onChange={(e) => setCustomJobRole(e.target.value)}
                sx={{ ...inputSx, mt: 1 }}
              />
            )}
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
            type="submit"
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
              "&:hover": { opacity: 0.9 },
              borderRadius: 2.5,
              color: "#fff",
              fontWeight: 600,
              px: 3,
            }}
            disabled={isAddingUser || !isValid || !usernameVerifiedAsNew}
          >
            {isAddingUser ? <CircularProgress size={24} color="inherit" /> : "Add User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserDialog; 