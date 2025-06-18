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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        <CircularProgress />
        <span className="ml-3">Loading company details...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        <Alert severity="error" className="max-w-md">
          Error loading company details:{" "}
          {error?.data?.message || error?.message || "Unknown error"}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Company Detail
            </h2>
          </div>

          {isEditing || !companyData ? (
            <form
              onSubmit={handleSubmit(handleAddOrUpdateCompanyDetails)}
              className="p-6"
            >
              <Box display="flex" flexDirection="column" gap={3}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  className="font-medium text-gray-800 dark:text-gray-100"
                >
                  Company Logo
                </Typography>
                <div
                  className="w-full p-8 border border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-300 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
                  InputLabelProps={{
                    className: "text-gray-800 dark:text-white",
                  }}
                  InputProps={{
                    className:
                      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit !important", // Force label color inheritance
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit !important", // Force text color inheritance
                      "& fieldset": {
                        borderColor: "border-gray-800 dark:border-gray-800",
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
                  InputLabelProps={{
                    className: "text-gray-800 dark:text-white",
                  }}
                  InputProps={{
                    className:
                      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit !important", // Force label color inheritance
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit !important", // Force text color inheritance
                      "& fieldset": {
                        borderColor: "border-gray-800 dark:border-gray-800",
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Company Description"
                  multiline
                  rows={4}
                  placeholder="Describe your company..."
                  {...register("companyDescription")}
                  disabled={!isEditing}
                  InputLabelProps={{
                    className: "text-gray-800 dark:text-white",
                  }}
                  InputProps={{
                    className:
                      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit !important", // Force label color inheritance
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit !important", // Force text color inheritance
                      "& fieldset": {
                        borderColor: "border-gray-800 dark:border-gray-800",
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
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <Avatar
                  src={previewUrl || undefined}
                  sx={{
                    width: 192,
                    height: 192,
                    border: "4px solid #e5e7eb",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    backgroundColor: "#d1d5db",
                  }}
                >
                  {!previewUrl &&
                    (companyData?.companyName?.[0]?.toUpperCase() || "C")}
                </Avatar>
              </div>

              <div className="space-y-5 text-center">
                <Typography variant="h4" className="font-bold">
                  {companyData?.companyName || "Company Name Not Set"}
                </Typography>
                {companyData?.companyUrl && (
                  <a
                    href={companyData.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Globe size={16} className="mr-1" />
                    {companyData.companyUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}

                {companyData?.companyDescription && (
                  <div className="p-5 rounded border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-left">
                    <Typography
                      variant="caption"
                      className="font-semibold text-gray-500 dark:text-gray-300 mb-2 block"
                    >
                      ABOUT US
                    </Typography>
                    <Typography variant="body1">
                      {companyData.companyDescription}
                    </Typography>
                  </div>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Pencil size={16} />}
                  onClick={() => setIsEditing(true)}
                  className="border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded"
                >
                  Edit Company Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
