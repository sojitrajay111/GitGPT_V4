"use client";

import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
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
  Chip,
  CircularProgress,
  Alert,
  DialogContentText,
  InputAdornment, // For search icon
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircleOutline as VerifyIcon,
  Search as SearchIcon, // Added SearchIcon
} from "@mui/icons-material";
import { useParams } from "next/navigation";
import {
  useAddUserMutation,
  useCheckUserExistenceMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/features/usermanagementSlice";

export default function UserManagementSettings() {
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [usernameVerifiedAsNew, setUsernameVerifiedAsNew] = useState(false);
  const [usernameVerificationMessage, setUsernameVerificationMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const params = useParams();
  const { userId } = params;
  const [theme, setTheme] = useState("light");
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");

  // RTK Query hooks for user management
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
  } = useGetUsersQuery(userId);

  useEffect(() => {
    if (usersData) {
      console.log("RTK Query usersData received:", usersData);
      console.log("isLoadingUsers:", isLoadingUsers);
      console.log("isErrorUsers:", isErrorUsers);
    }
  }, [usersData, isLoadingUsers, isErrorUsers]);

  const [
    addUser,
    { isLoading: isAddingUser, isSuccess: addUserSuccess, isError: adduserError, error: addUserErrorMessage },
  ] = useAddUserMutation();

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const [
    checkUserExistence,
    { isLoading: isCheckingExistence, isError: checkExistenceError, error: checkExistenceErrorMessage },
  ] = useCheckUserExistenceMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const jobRoleValue = watch("jobRole");

  const usernameValue = watch("username");

  useEffect(() => {
    if (addUserSuccess) {
      setFormMessage("✅ User added and invitation email sent successfully!");
      setUsernameVerifiedAsNew(false);
      reset();
      setOpenAddUserDialog(false);
    }
    if (adduserError) {
      setFormMessage(`❌ Error adding user: ${addUserErrorMessage?.data?.message || addUserErrorMessage?.message || 'Unknown error'}`);
    }
    if (isErrorUsers) {
      setFormMessage(`❌ Error fetching users: ${usersError?.data?.message || usersError?.message || 'Unknown error'}`);
    }
    const timer = setTimeout(() => {
      setFormMessage("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [addUserSuccess, adduserError, addUserErrorMessage, isErrorUsers, usersError, reset]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    const handleStorage = (e) => {
      if (e.key === "theme") {
        setTheme(e.newValue || "light");
        console.log("Theme updated in page.js from localStorage:", e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleVerifyUsername = async () => {
    if (!usernameValue) {
      setError("username", { type: "manual", message: "Username is required for verification." });
      setUsernameVerifiedAsNew(false);
      setUsernameVerificationMessage("");
      return;
    }
    clearErrors("username");

    try {
      const result = await checkUserExistence(usernameValue).unwrap();
      if (result.exists) {
        setUsernameVerifiedAsNew(false);
        setError("username", { type: "manual", message: "A user with this username already exists." });
        setUsernameVerificationMessage("❌ User already exists with this username.");
      } else {
        setUsernameVerifiedAsNew(true);
        setUsernameVerificationMessage("✅ Username is new and available!");
        clearErrors("username");
      }
    } catch (err) {
      setUsernameVerifiedAsNew(false);
      setError("username", { type: "manual", message: "Failed to verify username. Please try again." });
      setUsernameVerificationMessage(`❌ Verification failed: ${err.data?.message || err.message || 'Unknown error'}`);
      console.error("Username verification error:", err);
    }
  };

  const handleAddUser = async (data) => {
    if (!usernameVerifiedAsNew) {
      setFormMessage("❌ Please verify the user's username first.");
      return;
    }

    let jobRoleToSend = data.jobRole === 'Custom' ? customJobRole : data.jobRole;
    const userData = { ...data, jobRole: jobRoleToSend };

    setFormMessage("Adding user and sending invitation...");
    try {
      await addUser({ userData, managerId: userId }).unwrap();
    } catch (error) {
      // Error handled by useEffect and RTK Query's isError state
    }
  };

  const handleEditUser = async (id, currentData) => {
    console.log("Editing user with ID:", id);
    setFormMessage("Updating user (example)...");
    try {
      await updateUser({ id, status: "Active" }).unwrap();
      setFormMessage("✅ User status updated to Active (example).");
    } catch (error) {
      setFormMessage(`❌ Failed to update user: ${error?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  const confirmDelete = (id) => {
    setUserToDeleteId(id);
    setOpenConfirmDeleteDialog(true);
  };

  const executeDelete = async () => {
    setOpenConfirmDeleteDialog(false);
    if (userToDeleteId) {
      setFormMessage("Deleting user...");
      try {
        await deleteUser(userToDeleteId).unwrap();
        setFormMessage("✅ User deleted successfully!");
      } catch (error) {
        setFormMessage(`❌ Failed to delete user: ${error?.data?.message || error?.message || 'Unknown error'}`);
      } finally {
        setUserToDeleteId(null);
      }
    }
  };

  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    if (!searchTerm) return usersData.data;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = usersData.data.filter(user =>
      user.username.toLowerCase().startsWith(lowerCaseSearchTerm)
    );
    return filtered;
  }, [usersData, searchTerm]);

  // Define columns for DataGrid
  const columns = [
    {
      field: "index",
      headerName: "Index",
      width: 90,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        const currentIndex = filteredUsers.findIndex(user => user._id === params.row._id);
        return currentIndex !== -1 ? currentIndex + 1 : '';
      },
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
    },
    { field: "username", headerName: "Name", width: 200, flex: 1, renderHeader: (params) => (
      <strong>{params.colDef.headerName}</strong>
    ), },
    { field: "email", headerName: "Email", width: 250, flex: 1.5, renderHeader: (params) => (
      <strong>{params.colDef.headerName}</strong>
    ), },
    {
      field: "jobRole",
      headerName: "Job Role",
      width: 180,
      flex: 1,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        return params.row.jobRole || "-";
      },
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      width: 150,
      flex: 0.8,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        const lastLogin = params.row.lastLogin;
        if (!lastLogin) {
          return "Never";
        }
        const date = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
          return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
          return `${diffHours} hours ago`;
        } else if (diffDays < 30) {
          return `${diffDays} days ago`;
        } else {
          // Fallback for older dates
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      },
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case "Active":
            color = "success";
            break;
          case "Pending":
            color = "warning";
            break;
          case "Inactive":
            color = "error";
            break;
          default:
            color = "default";
        }
        return (
          <Chip label={params.value} color={color} size="small" sx={{ borderRadius: 1.5 }} />
        );
      },
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => (
        <Box>
          <IconButton
            color="error"
            size="small"
            onClick={() => confirmDelete(params.id)}
            aria-label="delete user"
            disabled={isDeletingUser}
          >
            {isDeletingUser ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Box>
      ),
      headerAlign: 'center',
      align: 'center',
    },
  ];

  // Card style for the DataGrid and controls (wide, dashboard style)
  const cardStyle = {
    background: theme === "dark" ? "#181A20" : "#fff",
    color: theme === "dark" ? "#F3F4F6" : "#222",
    borderRadius: 24,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
    padding: 0,
    width: '100%',
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    position: "relative",
  };

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
      background: theme === "dark" ? "#23272F" : "#F0F2F5",
      boxShadow: theme === "dark"
        ? "8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.4)"
        : "8px 8px 16px rgba(174, 174, 192, 0.4), -8px -8px 16px rgba(255, 255, 255, 1)",
      transition: 'all 0.3s ease-in-out',
      '&.Mui-focused': {
        boxShadow: theme === "dark"
          ? "inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(50,50,50,0.3)"
          : "inset 4px 4px 8px rgba(174, 174, 192, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.7)",
      },
    },
    '& .MuiInputBase-input': {
      color: theme === "dark" ? "#F3F4F6" : "#222",
    },
  };

  const buttonSx = {
    mt: 2,
    borderRadius: 3,
    fontWeight: 600,
    fontSize: 18,
    boxShadow: "0 4px 16px 0 rgba(66, 133, 244, 0.18)",
    background: `linear-gradient(135deg, #6366F1 0%, #5F4BFF 100%)`,
    color: "#fff",
    '&:hover': {
      opacity: 0.92,
      background: `linear-gradient(135deg, #6366F1 0%, #5F4BFF 100%)`,
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', background: theme === "dark" ? "#101014" : "#F5F6FA", py: 3 }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Box sx={{ ...cardStyle, pt: 3, pb: 3 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
            User Management
          </Typography>
          <Typography align="center" sx={{ color: theme === "dark" ? '#B0B3B8' : '#6B7280', mb: 2, mt: 0 }}>
            Manage your users and invitations
          </Typography>
          <Box sx={{ width: '100%', px: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAddUserDialog(true);
                setUsernameVerifiedAsNew(false);
                setUsernameVerificationMessage("");
                setFormMessage("");
                reset();
              }}
              sx={{
                ...buttonSx,
                height: 48,
                minWidth: 150,
                borderRadius: 2.5,
                boxShadow: '0 2px 8px 0 rgba(66, 133, 244, 0.10)',
                whiteSpace: 'nowrap',
                fontSize: 16,
                px: 3,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Add User
            </Button>
            <TextField
              variant="outlined"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: 260,
                mb: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  height: 48,
                  background: theme === "dark" ? "#23272F" : "#fff",
                  boxShadow: '0 2px 8px 0 rgba(66, 133, 244, 0.10)',
                  fontSize: 16,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiInputBase-input': {
                  color: theme === "dark" ? "#222" : "#222",
                  py: 0,
                  fontSize: 16,
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <SearchIcon color="action" sx={{ fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {formMessage && (
            <Alert
              severity={formMessage.includes("✅") ? "success" : "error"}
              sx={{ mb: 2, borderRadius: 2, width: '90%', mx: 'auto' }}
            >
              {formMessage}
            </Alert>
          )}
          <Box sx={{ width: '100%', px: 4, pb: 2 }}>
            <Box
              sx={{
                height: 440,
                width: "100%",
                background: theme === "dark" ? "#23272F" : "#F7F8FA",
                borderRadius: 3,
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                border: 'none',
                p: 2,
                mt: 0,
              }}
            >
              {isLoadingUsers ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                  <Typography sx={{ ml: 2, color: theme === "dark" ? "#B0B3B8" : "#5F6368" }}>Loading users...</Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={filteredUsers}
                  getRowId={(row) => row._id}
                  columns={columns}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 5, page: 0 },
                    },
                  }}
                  disableRowSelectionOnClick
                  sx={{ border: "none", background: 'transparent' }}
                />
              )}
            </Box>
          </Box>
          {/* Add User Dialog */}
          <Dialog
            open={openAddUserDialog}
            onClose={() => setOpenAddUserDialog(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, boxShadow: '0px 8px 32px rgba(31,38,135,0.18)', background: theme === "dark" ? "#181A20" : "#fff" } }}
          >
            <DialogTitle
              sx={{
                bgcolor: theme === "dark" ? '#23272F' : '#6366F1',
                color: 'white',
                fontWeight: 'bold',
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
              <DialogContent sx={{ py: 3, px: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...inputSx }}>
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
                    sx={{ flexGrow: 1, ...inputSx }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleVerifyUsername}
                    disabled={!usernameValue || isCheckingExistence || !!errors.username}
                    sx={{
                      whiteSpace: 'nowrap',
                      py: '12px',
                      borderRadius: 2.5,
                      borderColor: usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1'),
                      color: usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1'),
                      '&:hover': {
                        borderColor: usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF'),
                        color: usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF'),
                        bgcolor: usernameVerifiedAsNew ? '#E8F5E9' : (usernameVerificationMessage.includes("❌") ? '#FFEBEE' : '#E8F0FE'),
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
                    sx={{ ...inputSx, minWidth: 120, borderRadius: 2.5 }}
                    renderValue={(selected) => selected || "Select Job Role"}
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
              <DialogActions sx={{ px: 4, py: 2 }}>
                <Button
                  onClick={() => setOpenAddUserDialog(false)}
                  sx={{
                    color: theme === "dark" ? "#B0B3B8" : "#607d8b",
                    borderRadius: 2.5,
                    '&:hover': { backgroundColor: theme === "dark" ? "#23272F" : "rgba(96, 125, 139, 0.05)" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
                    '&:hover': { opacity: 0.9 },
                    borderRadius: 2.5,
                    color: '#fff',
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
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openConfirmDeleteDialog}
            onClose={() => setOpenConfirmDeleteDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 24px rgba(0,0,0,0.1)', background: theme === "dark" ? "#181A20" : "#fff" } }}
          >
            <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700, color: "#D32F2F" }}>
              {"Confirm Delete"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" sx={{ color: theme === "dark" ? "#B0B3B8" : "#4A4A4A" }}>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={() => setOpenConfirmDeleteDialog(false)}
                sx={{
                  color: theme === "dark" ? "#B0B3B8" : "#607d8b",
                  borderRadius: 2.5,
                  '&:hover': { backgroundColor: theme === "dark" ? "#23272F" : "rgba(96, 125, 139, 0.05)" },
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
                  background: "linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)",
                  '&:hover': { opacity: 0.9 },
                  borderRadius: 2.5,
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}