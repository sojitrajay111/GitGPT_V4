'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Image as ImageIcon, Globe, Briefcase } from 'lucide-react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import {
  useAddOrUpdateCompanyDetailsMutation,
  useGetCompanyDetailsQuery,
} from '@/features/companyApi';

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
      saveError,
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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (companyData) {
      setValue('companyName', companyData.companyName || '');
      setValue('companyDescription', companyData.companyDescription || '');
      setValue('companyUrl', companyData.companyUrl || '');
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
      setSnackbarMessage('Company details saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsEditing(false);
      setSelectedFile(null);
      refetch();
    }
    if (saveError) {
      setSnackbarMessage(
        `Error saving company details: ${saveErrorMessage?.data?.message || saveErrorMessage?.message || 'Unknown error'}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [isSuccess, saveError, saveErrorMessage, refetch]);

  const handleAddOrUpdateCompanyDetails = async (data) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('companyName', data.companyName);
      formData.append('companyDescription', data.companyDescription);
      formData.append('companyUrl', data.companyUrl);
      if (selectedFile) {
        formData.append('companyLogo', selectedFile);
      }
      await addOrUpdateCompanyDetails(formData).unwrap();
    } catch (err) {
      console.error('Failed to save company details:', err);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <span className="ml-3 text-gray-600">Loading company details...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert severity="error" className="max-w-md">
          Error loading company details: {error?.data?.message || error?.message || 'Unknown error'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing || !companyData 
                ? (companyData ? 'Edit Company' : 'Add Company') 
                : 'Company Profile'}
            </h2>
          </div>

          {isEditing || !companyData ? (
            <form 
              onSubmit={handleSubmit(handleAddOrUpdateCompanyDetails)}
              className="p-6 space-y-6"
            >
              {/* Logo Upload */}
              <div className="flex flex-col items-center">
                <div 
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                    isEditing 
                      ? 'border-2 border-dashed border-blue-200 cursor-pointer hover:border-blue-300 bg-blue-50'
                      : 'border border-gray-200'
                  } overflow-hidden transition-colors`}
                  onClick={triggerFileInput}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-blue-400">
                      <ImageIcon size={32} />
                      <span className="text-xs mt-1">Upload Logo</span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Pencil size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={!isEditing}
                  className="hidden"
                />
                {isEditing && (
                  <p className="mt-2 text-sm text-gray-500">
                    Click to {previewUrl ? 'change' : 'upload'} logo
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <TextField
                    fullWidth
                    placeholder="Enter company name"
                    {...register('companyName', { required: 'Company name is required' })}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    disabled={!isEditing}
                    InputProps={{
                      className: 'bg-gray-50 rounded-lg',
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <TextField
                    fullWidth
                    placeholder="https://yourcompany.com"
                    type="url"
                    {...register('companyUrl')}
                    disabled={!isEditing}
                    InputProps={{
                      className: 'bg-gray-50 rounded-lg',
                      startAdornment: (
                        <div className="mr-2 text-gray-400">
                          <Globe size={18} />
                        </div>
                      )
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe your company..."
                    {...register('companyDescription')}
                    disabled={!isEditing}
                    InputProps={{
                      className: 'bg-gray-50 rounded-lg',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (isEditing && companyData) {
                      reset({
                        companyName: companyData.companyName || '',
                        companyDescription: companyData.companyDescription || '',
                        companyUrl: companyData.companyUrl || '',
                      });
                      setPreviewUrl(companyData.companyLogoUrl || null);
                    } else {
                      reset();
                      setPreviewUrl(null);
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="px-5 py-2"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Details'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar
                    src={previewUrl || undefined}
                    className="w-48 h-48 border-4 border-gray shadow-lg"
                  >
                    {!previewUrl && (companyData?.companyName?.[0]?.toUpperCase() || 'C')}
                  </Avatar>
                  {/* <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"> */}
                    {/* <Briefcase className="text-blue-600" size={20} /> */}
                  {/* </div> */}
                </div>
              </div>

              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {companyData?.companyName || 'Company Name Not Set'}
                  </h1>
                  {companyData?.companyUrl && (
                    <a 
                      href={companyData.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                    >
                      <Globe size={16} className="mr-1" />
                      {companyData.companyUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>

                {companyData?.companyDescription && (
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">ABOUT US</h3>
                    <p className="text-gray-700">
                      {companyData.companyDescription}
                    </p>
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    variant="outlined"
                    startIcon={<Pencil size={16} />}
                    onClick={() => setIsEditing(true)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Edit Company Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          className="shadow-lg"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}