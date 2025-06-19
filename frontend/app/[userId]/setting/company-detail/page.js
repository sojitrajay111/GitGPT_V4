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
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import {
  useAddOrUpdateCompanyDetailsMutation,
  useGetCompanyDetailsQuery,
} from "@/features/companyApi";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useGetThemeQuery } from "@/features/themeApiSlice";

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
    { isLoading: isSaving, isSuccess, error: saveError },
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

  // Define light and dark themes
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#F5F6FA',
        paper: '#fff',
        list: '#F7F8FA',
      },
      text: {
        primary: '#222',
        secondary: '#6B7280',
      },
    },
  });
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#000', // Main background
        paper: '#161717', // Cards/dialogs
        list: '#2f2f2f', // Lists
      },
      text: {
        primary: '#F3F4F6',
        secondary: '#B0B3B8',
      },
    },
  });
  // Use user theme preference from API
  const { data: themeData } = useGetThemeQuery(userId);
  const themeMode = themeData?.theme === 'dark' ? 'dark' : 'light';
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

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
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box className="flex items-center justify-center min-h-screen" sx={{ bgcolor: currentTheme.palette.background.default, color: currentTheme.palette.text.primary }}>
          <CircularProgress />
          <span className="ml-3">Loading company details...</span>
        </Box>
      </ThemeProvider>
    );
  }

  if (isError) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Box className="flex items-center justify-center min-h-screen" sx={{ bgcolor: currentTheme.palette.background.default, color: currentTheme.palette.text.primary }}>
          <Alert severity="error" className="max-w-md">
            Error loading company details:{" "}
            {error?.data?.message || error?.message || "Unknown error"}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <Box className="min-h-screen py-12 px-4 sm:px-6" sx={{ bgcolor: currentTheme.palette.background.default, color: currentTheme.palette.text.primary }}>
        <Box className="max-w-3xl mx-auto">
          <Box className="rounded-lg border" sx={{ bgcolor: currentTheme.palette.background.paper, borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb' }}>
            <Box className="px-6 py-4 border-b" sx={{ borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb' }}>
              <h2 className="text-xl font-semibold" style={{ color: currentTheme.palette.text.primary }}>
                Company Detail
              </h2>
            </Box>
            {isEditing || !companyData ? (
              <form onSubmit={handleSubmit(handleAddOrUpdateCompanyDetails)} className="p-6">
                <Box display="flex" flexDirection="column" gap={3}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    className="font-medium text-gray-800 dark:text-gray-100"
                  >
                    Company Logo
                  </Typography>
                  <div
                    className="w-full p-8 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors"
                    style={{ background: currentTheme.palette.background.list, borderColor: themeMode === 'dark' ? '#444' : '#ccc', color: currentTheme.palette.text.secondary }}
                    onClick={triggerFileInput}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Logo"
                        className="max-h-32 object-contain mb-2"
                      />
                    ) : (
                      <ImageIcon size={48} className="mb-2" />
                    )}
                    <p className="text-sm">
                      Drop files here or{" "}
                      <span className="text-blue-600 font-medium">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-300">
                      Accepts: image/* • Max 1 file
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className="hidden"
                    />
                  </div>
                  {/* Company Name */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Company Name"
                    placeholder="Acme Corporation"
                    {...register("companyName", {
                      required: "Company name is required",
                    })}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    disabled={!isEditing}
                    InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
                    InputProps={{ style: { background: currentTheme.palette.background.paper, color: currentTheme.palette.text.primary } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: currentTheme.palette.text.primary,
                        background: currentTheme.palette.background.paper,
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb',
                        },
                      },
                    }}
                  />
                  {/* Website URL */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Website URL"
                    placeholder="https://acme.com"
                    type="url"
                    {...register("companyUrl")}
                    disabled={!isEditing}
                    InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
                    InputProps={{ style: { background: currentTheme.palette.background.paper, color: currentTheme.palette.text.primary } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: currentTheme.palette.text.primary,
                        background: currentTheme.palette.background.paper,
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb',
                        },
                      },
                    }}
                  />
                  {/* Company Description */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Company Description"
                    multiline
                    rows={4}
                    placeholder="Describe your company..."
                    {...register("companyDescription")}
                    disabled={!isEditing}
                    InputLabelProps={{ style: { color: currentTheme.palette.text.secondary } }}
                    InputProps={{ style: { background: currentTheme.palette.background.paper, color: currentTheme.palette.text.primary } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: currentTheme.palette.text.primary,
                        background: currentTheme.palette.background.paper,
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb',
                        },
                      },
                    }}
                  />
                  <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (companyData) {
                          reset({
                            companyName: companyData.companyName || "",
                            companyDescription:
                              companyData.companyDescription || "",
                            companyUrl: companyData.companyUrl || "",
                          });
                          setPreviewUrl(companyData.companyLogoUrl || null);
                        }
                        setIsEditing(false);
                      }}
                    >
                      Reset to Default
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSaving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                      {isSaving ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </Box>
                </Box>
              </form>
            ) : (
              <Box className="p-6">
                <Box className="flex flex-col items-center mb-8">
                  <Avatar
                    src={previewUrl || undefined}
                    sx={{
                      width: 192,
                      height: 192,
                      border: `4px solid ${themeMode === 'dark' ? '#222' : '#e5e7eb'}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      backgroundColor: themeMode === 'dark' ? '#222' : '#d1d5db',
                    }}
                  >
                    {!previewUrl && (companyData?.companyName?.[0]?.toUpperCase() || "C")}
                  </Avatar>
                </Box>
                <Box className="space-y-5 text-center">
                  <Typography variant="h4" className="font-bold" style={{ color: currentTheme.palette.text.primary }}>
                    {companyData?.companyName || "Company Name Not Set"}
                  </Typography>
                  {companyData?.companyUrl && (
                    <a
                      href={companyData.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                      style={{ color: currentTheme.palette.primary?.main || '#1976D2' }}
                    >
                      <Globe size={16} className="mr-1" />
                      {companyData.companyUrl.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {companyData?.companyDescription && (
                    <Box className="p-5 rounded border text-left" sx={{ bgcolor: currentTheme.palette.background.list, borderColor: themeMode === 'dark' ? '#222' : '#e5e7eb' }}>
                      <Typography variant="caption" className="font-semibold mb-2 block" style={{ color: currentTheme.palette.text.secondary }}>
                        ABOUT US
                      </Typography>
                      <Typography variant="body1" style={{ color: currentTheme.palette.text.primary }}>
                        {companyData.companyDescription}
                      </Typography>
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Pencil size={16} />}
                    onClick={() => setIsEditing(true)}
                    className="border rounded"
                    sx={{ borderColor: currentTheme.palette.primary?.main || '#1976D2', color: currentTheme.palette.primary?.main || '#1976D2', '&:hover': { bgcolor: currentTheme.palette.background.paper } }}
                  >
                    Edit Company Details
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ bgcolor: currentTheme.palette.background.paper, color: currentTheme.palette.text.primary }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
