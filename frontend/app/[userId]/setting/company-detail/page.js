"use client";

import React, { useState, useRef, useEffect } from "react";
import { Pencil, Image as ImageIcon, Globe } from "lucide-react";
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Box, // Import Box for easier SX prop usage on divs
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import {
  useAddOrUpdateCompanyDetailsMutation,
  useGetCompanyDetailsQuery,
} from "@/features/companyApi";

export default function CompanyDetailPage() {
  const { userId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const {
    data: companyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCompanyDetailsQuery(userId);
  const [
    addOrUpdateCompanyDetails,
    {
      isLoading: isSaving,
      isSuccess,
      error: saveError, // Renamed to avoid conflict with initial error state
      saveErrorMessage,
    },
  ] = useAddOrUpdateCompanyDetailsMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [theme, setTheme] = useState("light"); // State for theme: 'light' or 'dark'

  useEffect(() => {
    // Apply theme class to the document body or html element
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (companyData) {
      setValue("companyName", companyData.companyName || "");
      setValue("companyDescription", companyData.companyDescription || "");
      setValue("companyUrl", companyData.companyUrl || "");
      setPreviewUrl(companyData.companyLogoUrl || null);
    }
  }, [companyData, setValue]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setSnackbarMessage("Company details saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setIsEditing(false);
      setSelectedFile(null);
      refetch();
    }
    if (saveError) {
      setSnackbarMessage(
        `Error saving company details: ${
          saveError?.data?.message || saveError?.message || "Unknown error"
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [isSuccess, saveError, refetch]);

  const handleAddOrUpdateCompanyDetails = async (data) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("companyName", data.companyName);
      formData.append("companyDescription", data.companyDescription);
      formData.append("companyUrl", data.companyUrl);
      if (selectedFile) {
        formData.append("companyLogo", selectedFile);
      }
      await addOrUpdateCompanyDetails(formData).unwrap();
    } catch (err) {
      console.error("Failed to save company details:", err);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Define the complex 3D shadow string
  const complex3DShadow =
    "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, inset rgba(10, 37, 64, 0.35) 0px -2px 6px 0px";
  // Define lighter/darker neumorphic-like shadows for inner elements
  const neumorphicInsetLight =
    "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff";
  const neumorphicInsetDark =
    "inset 5px 5px 10px #2d2d2d, inset -5px -5px 10px #4a4a4a";
  const neumorphicPressedLight =
    "inset 5px 5px 10px #a8a8a8, inset -5px -5px 10px #ffffff";
  const neumorphicPressedDark =
    "inset 5px 5px 10px #222222, inset -5px -5px 10px #444444";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-white">
        <CircularProgress />
        <span className="ml-3">Loading company details...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-white">
        <Alert severity="error" className="max-w-md">
          Error loading company details:{" "}
          {error?.data?.message || error?.message || "Unknown error"}
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      } text-gray-700 dark:text-white`}
    >
      <div className="max-w-3xl mx-auto">
        <Box
          sx={{
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: complex3DShadow, // Apply the complex 3D shadow here
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", // Dark gray for dark, white for light
            border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`, // Adjust border for theme
          }}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Company detail
            </h2>
          </div>

          {isEditing || !companyData ? (
            <Box
              component="form" // Use Box as a form element
              onSubmit={handleSubmit(handleAddOrUpdateCompanyDetails)}
              sx={{
                p: 3, // padding: 24px (p-6)
                display: "flex",
                flexDirection: "column",
                gap: 3, // space-y-6 (gap-24px)
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                boxShadow: complex3DShadow, // Apply the complex 3D shadow to the form when editing
              }}
            >
              {/* Company Logo Section */}
              <div>
                <Typography
                  variant="subtitle1"
                  className="mb-2 font-medium text-gray-700 dark:text-gray-300"
                >
                  Company Logo
                </Typography>
                <div
                  className={`w-full p-8 border border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors`}
                  onClick={triggerFileInput}
                  style={{
                    borderColor: theme === "dark" ? "#374151" : "#d1d5db",
                    backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                    boxShadow:
                      theme === "dark"
                        ? neumorphicInsetDark
                        : neumorphicInsetLight,
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Company Logo Preview"
                      className="max-h-32 object-contain mb-2"
                    />
                  ) : (
                    <ImageIcon size={48} className="mb-2" />
                  )}
                  <Typography variant="body2" className="text-sm">
                    Drop files here or{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      browse
                    </span>
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-1 text-xs text-gray-400 dark:text-gray-500"
                  >
                    Accepts: image/* • Max 1 files
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={!isEditing}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <Typography
                  variant="subtitle1"
                  className="mb-2 font-medium text-gray-700 dark:text-gray-300"
                >
                  Company Name
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Acme Corporation"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: theme === "dark" ? "#374151" : "#f9fafb", // Darker background for dark mode
                      color: theme === "dark" ? "#e5e7eb" : "#1f2937", // Light text for dark mode
                      boxShadow:
                        theme === "dark"
                          ? neumorphicPressedDark
                          : neumorphicPressedLight,
                      "& fieldset": {
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb", // Darker border for dark mode
                      },
                      "&:hover fieldset": {
                        borderColor: theme === "dark" ? "#6b7280" : "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6", // Focus color remains bright blue
                      },
                    },
                  }}
                />
              </div>

              {/* Website URL */}
              <div>
                <Typography
                  variant="subtitle1"
                  className="mb-2 font-medium text-gray-700 dark:text-gray-300"
                >
                  Website URL
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="https://acme.com"
                  type="url"
                  {...register("companyUrl")}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                      boxShadow:
                        theme === "dark"
                          ? neumorphicPressedDark
                          : neumorphicPressedLight,
                      "& fieldset": {
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                      },
                      "&:hover fieldset": {
                        borderColor: theme === "dark" ? "#6b7280" : "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </div>

              {/* Company Description */}
              <div>
                <Typography
                  variant="subtitle1"
                  className="mb-2 font-medium text-gray-700 dark:text-gray-300"
                >
                  Company Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Enter a brief description of your company..."
                  {...register("companyDescription")}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                      boxShadow:
                        theme === "dark"
                          ? neumorphicPressedDark
                          : neumorphicPressedLight,
                      "& fieldset": {
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                      },
                      "&:hover fieldset": {
                        borderColor: theme === "dark" ? "#6b7280" : "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="text"
                  sx={{
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    textTransform: "none",
                  }} // Tailwind gray-400 vs gray-500
                  onClick={() => {
                    if (isEditing && companyData) {
                      reset({
                        companyName: companyData.companyName || "",
                        companyDescription:
                          companyData.companyDescription || "",
                        companyUrl: companyData.companyUrl || "",
                      });
                      setPreviewUrl(companyData.companyLogoUrl || null);
                    } else {
                      reset();
                      setPreviewUrl(null);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  Reset to Default
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  sx={{
                    backgroundColor: theme === "dark" ? "#4f46e5" : "#4f46e5", // Indigo-600
                    "&:hover": {
                      backgroundColor: theme === "dark" ? "#4338ca" : "#4338ca", // Indigo-700
                    },
                    borderRadius: "8px",
                    padding: "8px 20px",
                    textTransform: "none",
                    boxShadow:
                      theme === "dark"
                        ? "0 4px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)"
                        : "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {isSaving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Box>
          ) : (
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar
                    src={previewUrl || undefined}
                    sx={{
                      width: 192,
                      height: 192,
                      border: `4px solid ${
                        theme === "dark" ? "#374151" : "#e5e7eb"
                      }`, // Tailwind gray-700 vs gray-200
                      boxShadow:
                        theme === "dark"
                          ? "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // Standard shadow
                      backgroundColor: theme === "dark" ? "#4b5563" : "#d1d5db", // Avatar background for dark mode
                      color: theme === "dark" ? "#e5e7eb" : "#4b5563", // Avatar text color
                    }}
                  >
                    {!previewUrl &&
                      (companyData?.companyName?.[0]?.toUpperCase() || "C")}
                  </Avatar>
                </div>
              </div>

              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="text-center">
                  <Typography
                    variant="h4"
                    component="h1"
                    className="font-bold text-gray-800 dark:text-white"
                  >
                    {companyData?.companyName || "Company Name Not Set"}
                  </Typography>
                  {companyData?.companyUrl && (
                    <a
                      href={companyData.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2"
                    >
                      <Globe size={16} className="mr-1" />
                      {companyData.companyUrl.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                {companyData?.companyDescription && (
                  <Box
                    sx={{
                      borderRadius: "8px",
                      p: 2.5, // p-5 (padding: 20px)
                      backgroundColor: theme === "dark" ? "#374151" : "#f9fafb", // Darker gray for dark mode
                      boxShadow:
                        theme === "dark"
                          ? neumorphicInsetDark
                          : neumorphicInsetLight,
                    }}
                  >
                    <Typography
                      variant="caption"
                      className="font-semibold text-gray-500 dark:text-gray-400 mb-2 block"
                    >
                      ABOUT US
                    </Typography>
                    <Typography
                      variant="body1"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {companyData.companyDescription}
                    </Typography>
                  </Box>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    variant="outlined"
                    startIcon={<Pencil size={16} />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      borderColor: "#3b82f6", // Tailwind blue-500
                      color: "#2563eb", // Tailwind blue-600
                      "&:hover": {
                        backgroundColor:
                          theme === "dark" ? "#eff6ff1a" : "#eff6ff", // Lighter hover for dark mode
                        borderColor: "#2563eb",
                      },
                      borderRadius: "8px",
                      padding: "8px 20px",
                      textTransform: "none",
                      boxShadow:
                        theme === "dark"
                          ? "0 2px 4px rgba(0,0,0,0.3)"
                          : "0 2px 4px rgba(0,0,0,0.1)", // Simpler shadow for button
                    }}
                  >
                    Edit Company Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Box>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          className="shadow-lg" // Keeping existing shadow for Snackbar
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
