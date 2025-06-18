// page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  useMediaQuery, // Import useMediaQuery hook
  useTheme,      // Import useTheme hook
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import {
  useAddUserMutation,
  useCheckUserExistenceMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/features/usermanagementSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import AddUserDialog from "@/components/user_management_components/AddUserDialog";
import EditUserDialog from "@/components/user_management_components/EditUserDialog";
import DeleteConfirmDialog from "@/components/user_management_components/DeleteConfirmDialog";
import SearchAndAddSection from "@/components/user_management_components/SearchAndAddSection";
import UserDataGrid from "@/components/user_management_components/UserDataGrid";

export default function UserManagementSettings() {
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [usernameVerifiedAsNew, setUsernameVerifiedAsNew] = useState("");
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

  const muiTheme = useTheme(); // Get MUI theme to access breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm')); // Up to small screens
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md')); // Between small and medium screens

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
          
          <SearchAndAddSection
            openAddUserDialog={openAddUserDialog}
            setOpenAddUserDialog={setOpenAddUserDialog}
            setUsernameVerifiedAsNew={setUsernameVerifiedAsNew}
            setUsernameVerificationMessage={setUsernameVerificationMessage}
            setFormMessage={setFormMessage}
            reset={reset}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isMobile={isMobile}
            theme={theme}
            buttonSx={buttonSx}
          />
          
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
          
          <UserDataGrid
            isLoadingUsers={isLoadingUsers}
            filteredUsers={filteredUsers}
            handleEditUser={handleEditUser}
            confirmDelete={confirmDelete}
            isDeletingUser={isDeletingUser}
            isMobile={isMobile}
            theme={theme}
          />

          {/* Add User Dialog */}
          <AddUserDialog
            open={openAddUserDialog}
            onClose={() => setOpenAddUserDialog(false)}
            handleSubmit={handleSubmit}
            handleAddUser={handleAddUser}
            register={register}
            errors={errors}
            usernameValue={usernameValue}
            usernameVerifiedAsNew={usernameVerifiedAsNew}
            usernameVerificationMessage={usernameVerificationMessage}
            handleVerifyUsername={handleVerifyUsername}
            isCheckingExistence={isCheckingExistence}
            isAddingUser={isAddingUser}
            isValid={isValid}
            isMobile={isMobile}
            inputSx={inputSx}
            newBoxShadow={newBoxShadow}
            theme={theme}
            selectedJobRole={selectedJobRole}
            setSelectedJobRole={setSelectedJobRole}
            customJobRole={customJobRole}
            setCustomJobRole={setCustomJobRole}
          />
          {/* Edit User Dialog */}
          <EditUserDialog
            open={openEditUserDialog}
            onClose={() => setOpenEditUserDialog(false)}
            currentUserToEdit={currentUserToEdit}
            editJobRole={editJobRole}
            setEditJobRole={setEditJobRole}
            editCustomJobRole={editCustomJobRole}
            setEditCustomJobRole={setEditCustomJobRole}
            editUserStatus={editUserStatus}
            setEditUserStatus={setEditUserStatus}
            handleUpdateUserSubmit={handleUpdateUserSubmit}
            isUpdatingUser={isUpdatingUser}
            inputSx={inputSx}
            newBoxShadow={newBoxShadow}
            theme={theme}
          />
          {/* Delete Confirmation Dialog */}
          <DeleteConfirmDialog
            open={openConfirmDeleteDialog}
            onClose={() => setOpenConfirmDeleteDialog(false)}
            executeDelete={executeDelete}
            isDeletingUser={isDeletingUser}
            theme={theme}
            newBoxShadow={newBoxShadow}
          />
        </Box>
      </Box>
    </Box>
  );
}