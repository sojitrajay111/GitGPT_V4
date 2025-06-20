"use client";

import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react"; // Lucide icons for design
import { Button } from "@/components/ui/button"; // Your custom Button component
import { Input } from "@/components/ui/input"; // Your custom Input component
import { Label } from "@/components/ui/label"; // Your custom Label component
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/features/authApiSlice"; // RTK Query login mutation

// MUI components retained for Snackbar and CircularProgress, as they handle complex behavior
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form"; // React Hook Form for validation
import Cookies from "js-cookie"; // For cookie management

export default function LoginDialog({
  open,
  onClose,
  onSuccess,
  onShowSignupDialog,
}) {
  // Added onShowSignupDialog prop
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await login({
        identifier: data.email,
        password: data.password,
      }).unwrap();

      localStorage.setItem("token", response.token);
      Cookies.set("token", response.token, {
        expires: 2,
        secure: process.env.NODE_ENV === "production",
      });

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        onSuccess(response?.user?.id); // Pass userId to the parent for redirection
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.data?.message || "Login failed. Please check your credentials.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSignupClick = () => {
    onShowSignupDialog(); // Request parent to open SignupDialog
    onClose(); // Close the login dialog
  };

  if (!open) {
    return null; // Don't render anything if the dialog is not open
  }

  return (
    // Overlay for the dialog (from Tailwind design)
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-700 relative">
        {/* Close Button (from Tailwind design with Lucide X icon) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={24} />
        </button>

        {/* Header (from Tailwind design) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Please Login to your account</p>
        </div>

        {/* Login Form (structure from Tailwind, logic from MUI) */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                {...register("password", {
                  required: "Password is required",
                })}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <a
              href="#"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button (from Tailwind design, with MUI CircularProgress) */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <CircularProgress size={20} color="inherit" />}
            {isLoading ? "Logging In..." : "Login"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <a
              onClick={handleSignupClick}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>

      {/* Snackbar for messages (retained from MUI version) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
