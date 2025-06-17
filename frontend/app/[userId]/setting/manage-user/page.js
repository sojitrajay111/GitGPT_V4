// page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircleOutline as VerifyIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useParams } from "next/navigation";
import {
  useAddUserMutation,
  useCheckUserExistenceMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/features/usermanagementSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import { SynthToggle } from "@/components/ui";

export default function UserManagementSettings() {
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [usernameVerifiedAsNew, setUsernameVerifiedAsNew] = useState(false);
  const [usernameVerificationMessage, setUsernameVerificationMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  const { userId } = params;
  const [theme, setTheme] = useState("light");
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");

  // New state for edit user dialog
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [editJobRole, setEditJobRole] = useState("");
  const [editCustomJobRole, setEditCustomJobRole] = useState("");
  const [editUserStatus, setEditUserStatus] = useState(false); // true for Active, false for Inactive

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
  } = useGetUsersQuery(userId);

  const {
    data: themeData,
    isLoading: isLoadingTheme,
    isError: isErrorTheme,
    error: themeError,
  } = useGetThemeQuery(userId);

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
    }, 3000);
    return () => clearTimeout(timer);
  }, [addUserSuccess, adduserError, addUserErrorMessage, isErrorUsers, usersError, reset]);

  useEffect(() => {
    if (themeData && themeData.theme) {
      setTheme(themeData.theme);
      console.log("Theme updated from API:", themeData.theme);
    } else {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      console.log("Theme updated from localStorage:", savedTheme);
    }

    const handleStorage = (e) => {
      if (e.key === "theme") {
        setTheme(e.newValue || "light");
        console.log("Theme updated in page.js from localStorage (storage event):", e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [themeData]);

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
    }
  };

  const handleEditUser = (user) => {
    if (user.status === "Pending") {
      setFormMessage("❌ Cannot edit a user with 'Pending' status. User must accept invitation first.");
      return;
    }
    setCurrentUserToEdit(user);
    setEditJobRole(user.jobRole || "");
    setEditCustomJobRole(user.jobRole === "Custom" ? user.jobRole : "");
    setEditUserStatus(user.status === "Active"); // true if Active, false otherwise
    setOpenEditUserDialog(true);
  };

  const handleUpdateUserSubmit = async () => {
    if (!currentUserToEdit) return;

    let jobRoleToSend = editJobRole === 'Custom' ? editCustomJobRole : editJobRole;
    const newStatus = editUserStatus ? "Active" : "Inactive";

    const updatedData = {
      jobRole: jobRoleToSend,
      status: newStatus,
    };

    setFormMessage("Updating user details...");
    try {
      await updateUser({ id: currentUserToEdit._id, ...updatedData }).unwrap();
      setFormMessage("✅ User updated successfully!");
      setOpenEditUserDialog(false);
      setCurrentUserToEdit(null);
    } catch (error) {
      setFormMessage(`❌ Failed to update user: ${error?.data?.message || error?.message || 'Unknown error'}`);
      console.error("Failed to update user:", error);
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

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    if (!searchTerm) return usersData.data;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = usersData.data.filter(user =>
      user.username.toLowerCase().startsWith(lowerCaseSearchTerm)
    );
    return filtered;
  }, [usersData, searchTerm]);

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
    ), headerAlign: 'center',
      align: 'center',},
    { field: "email", headerName: "Email", width: 250, flex: 1.5, renderHeader: (params) => (
      <strong>{params.colDef.headerName}</strong>
    ),
  headerAlign: 'center',
      align: 'center', },
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
      headerAlign: 'center',
      align: 'center',
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
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              borderRadius: 1.5,
              ...(params.value === "Active" && {
                backgroundColor: theme === "dark" ? "#2C3E2D" : "#E8F5E9", // Dark green subtle / Light green
                color: theme === "dark" ? "#A5D6A7" : "#1B5E20", // Lighter green text / Darker green text
              }),
              ...(params.value === "Inactive" && {
                backgroundColor: theme === "dark" ? "#4E2B2E" : "#FFEBEE", // Dark red subtle / Light red
                color: theme === "dark" ? "#EF9A9A" : "#D32F2F", // Lighter red text / Darker red text
              }),
              ...(params.value === "Pending" && {
                backgroundColor: theme === "dark" ? "#4F4125" : "#FFF8E1", // Dark yellow subtle / Light yellow
                color: theme === "dark" ? "#FFD54F" : "#FFA000", // Lighter yellow text / Darker yellow text
              }),
            }}
          />
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
        <Box display="flex" justifyContent="center" alignItems="center" width="100%" flexGrow={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditUser(params.row)}
            aria-label="edit user"
            sx={{
              margin: 0,
              color: theme === "dark" ? "#6366F1" : "#5F4BFF",
              '&:hover': {
                backgroundColor: theme === "dark" ? "rgba(99, 102, 241, 0.1)" : "rgba(95, 75, 255, 0.1)",
              },
              ...(params.row.status === "Pending" && {
                color: theme === "dark" ? "#B0B3B8" : "#9E9E9E",
                cursor: "not-allowed",
                pointerEvents: "none",
                '&:hover': {
                  backgroundColor: "transparent",
                },
              }),
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => confirmDelete(params.id)}
            aria-label="delete user"
            disabled={isDeletingUser}
            sx={{ margin: 0 }}
          >
            {isDeletingUser ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Box>
      ),
      headerAlign: 'center',
      align: 'center',
    },
  ];

  // Define the new box shadow
  const newBoxShadow = "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset";

  const cardStyle = {
    background: theme === "dark" ? "#181A20" : "#fff",
    color: theme === "dark" ? "#F3F4F6" : "#222",
    borderRadius: 24,
    // Apply new box shadow to the main card container
    boxShadow: newBoxShadow,
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
      background: `${theme === "dark" ? "#23272F" : "#E8EDF2"}`,
      boxShadow: theme === "dark"
        ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(40,40,40,0.3)"
        : "inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
     
      // Ensure autofill background matches theme
      '& input:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
        WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
        caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
      },
      '& input:-webkit-autofill:hover': {
        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
        WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
        caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
      },
      '& input:-webkit-autofill:focus': {
        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
        WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
        caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
      },
      '& input:-webkit-autofill:active': {
        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
        WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
        caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
      },
     
      '&.Mui-focused': {
        boxShadow: theme === "dark"
          ? "inset 5px 5px 10px rgba(0,0,0,0.7), inset -5px -5px 10px rgba(50,50,50,0.5)"
          : "inset 5px 5px 10px rgba(174, 174, 192, 0.5), inset -5px -5px 10px rgba(255, 255, 255, 1)",
      },
    },
    '& .MuiInputBase-input': {
      color: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
      '&::placeholder': {
        color: theme === "dark" ? "rgba(243, 244, 246, 0.7)" : "rgba(34, 34, 34, 0.7)",
      },
    },
    '& .MuiInputLabel-root': {
      color: `${theme === "dark" ? "#B0B3B8" : "#6B7280"} !important`,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme === "dark" ? "#6366F1" : "#6366F1",
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
                  background: theme === "dark" ? "#23272F" : "#E8EDF2",
                  boxShadow: theme === "dark"
                    ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(40,40,40,0.3)"
                    : "inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
                  fontSize: 16,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  // Ensure autofill background matches theme for search bar
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
                    WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                    caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
                    WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                    caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
                    WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                    caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                  },
                  '& input:-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
                    WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                    caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme === "dark" ? "#F3F4F6" : "#222",
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
              sx={{
                mb: 2,
                borderRadius: 2,
                width: '90%',
                mx: 'auto',
                backgroundColor: theme === "dark" ? (formMessage.includes("✅") ? "#285C2A" : "#6C2C2C") : (formMessage.includes("✅") ? "#D4EDDA" : "#F8D7DA"),
                color: theme === "dark" ? "#F3F4F6" : (formMessage.includes("✅") ? "#155724" : "#721C24"),
                border: theme === "dark" ? (formMessage.includes("✅") ? "1px solid #4CAF50" : "1px solid #F44336") : (formMessage.includes("✅") ? "1px solid #C3E6CB" : "1px solid #F5C6CB"),
              }}
            >
              {formMessage}
            </Alert>
          )}
          <Box
            sx={{
              height: 440,
              width: "100%",
              px: 4, // Added px here to maintain inner padding
              pb: 2, // Added pb here to maintain inner padding
            }}
          >
            {/* Removed newBoxShadow from this Box as per request */}
            <Box
              sx={{
                height: "100%", // Use 100% height to fill parent px, pb
                width: "100%",
                background: theme === "dark" ? "#23272F" : "#F7F8FA",
                borderRadius: 3,
                border: 'none', // Removed this if it was intended to replace boxShadow
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
                  sx={{
                    border: "none",
                    background: 'transparent',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      color: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                      '& strong': {
                        color: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                      },
                    },
                    '& .MuiDataGrid-row': {
                      backgroundColor: theme === "dark" ? "#181A20" : "#fff",
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme === "dark" ? "#101014" : "#f9f9f9",
                      },
                      '&:hover': {
                        backgroundColor: theme === "dark" ? "transparent" : "#e0e0e0",
                      },
                    },
                    '& .MuiDataGrid-footerContainer': {
                      backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                    '& .MuiTablePagination-root': {
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                    '& .MuiDataGrid-cell': {
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 !important',
                    },
                    '& .MuiDataGrid-sortIcon': {
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                    '& .MuiDataGrid-menuIcon': {
                      color: theme === "dark" ? "#F3F4F6" : "#222",
                    },
                  }}
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
            PaperProps={{ 
              borderRadius: 4, 
              background: theme === "dark" ? "#181A20" : "#fff",
              // Apply new box shadow to the Dialog container within the sx prop
              sx: {
                boxShadow: newBoxShadow,
              }
            }}
          >
            <DialogTitle
              sx={{
                background: theme === "dark" ? `linear-gradient(135deg, #6366F1 0%, #5F4BFF 100%)` : '#6366F1',
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
              <DialogContent sx={{ py: 3, px: 4, background: theme === "dark" ? "#181A20" : "#fff" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      ...inputSx,
                      '& .MuiInputBase-input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #23272F inset !important', // Dark theme background for autofill
                        WebkitTextFillColor: '#F3F4F6 !important', // Dark theme text color for autofill
                        caretColor: '#F3F4F6 !important', // Ensure cursor color is visible
                      },
                      '& .MuiInputBase-input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #23272F inset !important',
                        WebkitTextFillColor: '#F3F4F6 !important',
                        caretColor: '#F3F4F6 !important',
                      },
                      '& .MuiInputBase-input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #23272F inset !important',
                        WebkitTextFillColor: '#F3F4F6 !important',
                        caretColor: '#F3F4F6 !important',
                      },
                      '& .MuiInputBase-input:-webkit-autofill:active': {
                        WebkitBoxShadow: '0 0 0 1000px #23272F inset !important',
                        WebkitTextFillColor: '#F3F4F6 !important',
                        caretColor: '#F3F4F6 !important',
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleVerifyUsername}
                    disabled={!usernameValue || isCheckingExistence || !!errors.username}
                    sx={{
                      whiteSpace: 'nowrap',
                      py: '12px',
                      borderRadius: 2.5,
                      background: theme === "dark" ? "transparent" : "#fff",
                      borderColor: theme === "dark"
                        ? (usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1'))
                        : (usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1')),
                      color: theme === "dark"
                        ? (usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1'))
                        : (usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#6366F1')),
                      '&:hover': {
                        borderColor: theme === "dark"
                          ? (usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF'))
                          : (usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF')),
                        color: theme === "dark"
                          ? (usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF'))
                          : (usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#5F4BFF')),
                        bgcolor: theme === "dark"
                          ? (usernameVerifiedAsNew ? '#1F2921' : (usernameVerificationMessage.includes("❌") ? '#2E1A1D' : '#1F253C'))
                          : (usernameVerifiedAsNew ? '#E8F5E9' : (usernameVerificationMessage.includes("❌") ? '#FFEBEE' : '#E8F0FE')),
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
                        // Ensure the Select component's root also gets the shadow
                        '& .MuiOutlinedInput-root': {
                            boxShadow: newBoxShadow, // Apply the new shadow here as well
                            background: `${theme === "dark" ? "#23272F" : "#E8EDF2"} !important`,
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
                          background: `${theme === "dark" ? "#23272F" : "#fff"} !important`,
                          background: theme === "dark" ? "#23272F" : "#fff",
                          borderRadius: 2.5,
                          boxShadow: "0px 8px 32px rgba(31,38,135,0.18)", // Kept original for dropdown for now
                          '& .MuiMenuItem-root': {
                            color: theme === "dark" ? "#F3F4F6" : "#222",
                            '&:hover': {
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
          {/* Edit User Dialog */}
          {currentUserToEdit && (
            <Dialog
              open={openEditUserDialog}
              onClose={() => setOpenEditUserDialog(false)}
              fullWidth
              maxWidth="sm"
              PaperProps={{
                borderRadius: 4,
                background: theme === "dark" ? "#181A20" : "#fff",
                sx: {
                  boxShadow: newBoxShadow,
                }
              }}
            >
              <DialogTitle
                sx={{
                  background: theme === "dark" ? `linear-gradient(135deg, #6366F1 0%, #5F4BFF 100%)` : '#6366F1',
                  color: 'white',
                  fontWeight: 'bold',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  fontSize: 22,
                  letterSpacing: 1,
                  py: 2,
                }}
              >
                Edit User: {currentUserToEdit.username}
              </DialogTitle>
              <DialogContent sx={{ py: 0, pt: 3, px: 4, background: theme === "dark" ? "#181A20" : "#fff" }}>
                <TextField
                  label="Username"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={currentUserToEdit.username}
                  sx={{
                    ...inputSx,
                    mt: 3,
                  }}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: theme === "dark" ? "#2F343C" : "#E0E0E0",
                      cursor: "not-allowed",
                      '& .MuiInputBase-input': {
                        color: theme === "dark" ? "#B0B3B8" : "#555 !important",
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:active': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                    },
                  }}
                />
                <TextField
                  label="User Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={currentUserToEdit.email}
                  sx={{
                    ...inputSx,
                    mt: 2,
                  }}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: theme === "dark" ? "#2F343C" : "#E0E0E0",
                      cursor: "not-allowed",
                      '& .MuiInputBase-input': {
                        color: theme === "dark" ? "#B0B3B8" : "#555 !important",
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                      },
                      '& input:-webkit-autofill:active': {
                        WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#2F343C" : "#E0E0E0"} inset !important`,
                        WebkitTextFillColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
                        caretColor: `${theme === "dark" ? "#B0B3B8" : "#555"} !important`,
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
                        '& .MuiOutlinedInput-root': {
                            boxShadow: newBoxShadow,
                            background: `${theme === "dark" ? "#23272F" : "#E8EDF2"} !important`,
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
                          background: `${theme === "dark" ? "#23272F" : "#fff"} !important`,
                          background: theme === "dark" ? "#23272F" : "#fff",
                          borderRadius: 2.5,
                          boxShadow: "0px 8px 32px rgba(31,38,135,0.18)",
                          '& .MuiMenuItem-root': {
                            color: theme === "dark" ? "#F3F4F6" : "#222",
                            '&:hover': {
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 2, pr:1 }}>
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
                  onClick={() => setOpenEditUserDialog(false)}
                  sx={{
                    color: theme === "dark" ? "#B0B3B8" : "#607d8b",
                    borderRadius: 2.5,
                    '&:hover': { backgroundColor: theme === "dark" ? "#23272F" : "rgba(96, 125, 139, 0.05)" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUserSubmit}
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
                    '&:hover': { opacity: 0.9 },
                    borderRadius: 2.5,
                    color: '#fff',
                    fontWeight: 600,
                    px: 3,
                  }}
                  disabled={isUpdatingUser}
                >
                  {isUpdatingUser ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
              </DialogActions>
            </Dialog>
          )}
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openConfirmDeleteDialog}
            onClose={() => setOpenConfirmDeleteDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{ 
              borderRadius: 3, 
              background: theme === "dark" ? "#181A20" : "#fff",
              // Apply new box shadow to the Delete Confirmation Dialog container within the sx prop
              sx: {
                boxShadow: newBoxShadow,
              }
            }}
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