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

  // RTK Query hooks for user management
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
  } = useGetUsersQuery(userId);

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

    setFormMessage("Adding user and sending invitation...");
    try {
      await addUser({ userData: data, managerId: userId }).unwrap();
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
    return usersData.data.filter(user =>
      user.username.toLowerCase().startsWith(lowerCaseSearchTerm)
    );
  }, [usersData, searchTerm]);

  // Define columns for DataGrid
  const columns = [
    {
      field: "index",
      headerName: "Index",
      width: 90,
      renderCell: (params) => {
        const currentIndex = filteredUsers.findIndex(user => user._id === params.row._id);
        return currentIndex !== -1 ? currentIndex + 1 : '';
      },
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
    },
    { field: "username", headerName: "Name", width: 200, flex: 1 },
    { field: "email", headerName: "Email", width: 250, flex: 1.5 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
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

  const inputSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 2 }}>
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
            py: 1,
            borderRadius: 3,
            fontWeight: 600,
            background: `linear-gradient(135deg, #4285F4 0%, #3367D6 100%)`,
            "&:hover": {
              opacity: 0.9,
            },
            whiteSpace: 'nowrap', // Prevents button text from wrapping
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
            width: { xs: '100%', sm: 'auto' }, // Full width on small screens, auto on larger
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              pr: 1, // Adjust padding to accommodate icon
            },
            '& .MuiInputBase-input': {
              py: '10.5px', // Match button height
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {formMessage && (
        <Alert
          severity={formMessage.includes("✅") ? "success" : "error"}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {formMessage}
        </Alert>
      )}

      <Box
        sx={{
          height: 400,
          width: "100%",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F0F2F5",
            borderRadius: 1,
            borderBottom: 'none'
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            color: "#344054",
          },
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #E0E0E0",
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#F0F2F5',
            borderRadius: 1,
            borderTop: 'none'
          },
        }}
      >
        {isLoadingUsers ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography sx={{ ml: 2, color: "#5F6368" }}>Loading users...</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filteredUsers} // Use filteredUsers here
            getRowId={(row) => row._id}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            disableRowSelectionOnClick
            sx={{ border: "none" }}
          />
        )}
      </Box>

      {/* Add User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={() => setOpenAddUserDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 24px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#4285F4',
            color: 'white',
            fontWeight: 'bold',
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3
          }}
        >
          Add New User
        </DialogTitle>
        <form onSubmit={handleSubmit(handleAddUser)}>
          <DialogContent sx={{ py: 3 }}>
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
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleVerifyUsername}
                disabled={!usernameValue || isCheckingExistence || !!errors.username}
                sx={{
                  whiteSpace: 'nowrap',
                  py: '12px',
                  borderRadius: 2,
                  borderColor: usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#4285F4'),
                  color: usernameVerifiedAsNew ? '#4CAF50' : (usernameVerificationMessage.includes("❌") ? '#F44336' : '#4285F4'),
                  '&:hover': {
                    borderColor: usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#3367D6'),
                    color: usernameVerifiedAsNew ? '#388E3C' : (usernameVerificationMessage.includes("❌") ? '#D32F2F' : '#3367D6'),
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
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setOpenAddUserDialog(false)}
              sx={{
                color: "#607d8b",
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(96, 125, 139, 0.05)" },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
                "&:hover": {
                  opacity: 0.9,
                },
                borderRadius: 2,
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
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 24px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700, color: "#D32F2F" }}>
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: "#4A4A4A" }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenConfirmDeleteDialog(false)}
            sx={{
              color: "#607d8b",
              borderRadius: 2,
              "&:hover": { backgroundColor: "rgba(96, 125, 139, 0.05)" },
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
              "&:hover": {
                opacity: 0.9,
              },
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}