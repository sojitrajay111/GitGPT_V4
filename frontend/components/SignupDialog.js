"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/features/authApiSlice"; // RTK Query signup mutation
import { Snackbar, Alert, CircularProgress } from "@mui/material"; // Retain MUI for Snackbar/CircularProgress
import {
  Eye,
  EyeOff,
  X, // Lucide icons for design
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Your custom Button component
import { Input } from "@/components/ui/input"; // Your custom Input component
import { Label } from "@/components/ui/label"; // Your custom Label component

export default function SignupDialog({
  open,
  onClose,
  onSuccess,
  onShowLoginDialog,
}) {
  // Added onShowLoginDialog prop
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm({ mode: "onChange" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: "manager", // Default role as per your original signup logic
      };

      await signup(payload).unwrap();

      setSnackbar({
        open: true,
        message: "Account created successfully! Redirecting to login...",
        severity: "success",
      });

      reset(); // Reset form fields

      setTimeout(() => {
        onSuccess(); // Call onSuccess to signal parent that signup is done (to close this dialog)
        onShowLoginDialog(); // Request parent to open LoginDialog
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.data?.message ||
        error.error ||
        "An unexpected error occurred during signup.";

      setSnackbar({
        open: true,
        message: errorMessage,
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleLoginClick = () => {
    onShowLoginDialog(); // Request parent to open LoginDialog
    onClose(); // Close the signup dialog
  };

  if (!open) {
    return null; // Don't render anything if the dialog is not open
  }

  return (
    // Overlay for the dialog
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      {/* Reduced overall padding from p-8 to p-6 */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-700 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} /> {/* Slightly smaller X icon */}
        </button>

        {/* Header */}
        {/* Reduced mb-8 to mb-6 */}
        <div className="text-center mb-6">
          {/* Reduced mb-2 to mb-1 */}
          <h1 className="text-2xl font-bold text-white mb-1">
            Create Your Account
          </h1>
          <p className="text-gray-400 text-sm">Join GitGPT to get started</p>{" "}
          {/* Smaller text */}
        </div>

        {/* Signup Form */}
        {/* Reduced space-y-6 to space-y-4 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1">
            {" "}
            {/* Reduced space-y-2 to space-y-1 */}
            <Label
              htmlFor="username"
              className="text-xs font-medium text-gray-300"
            >
              {" "}
              {/* Smaller label text */}
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g., raj@149"
              required
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" // Smaller padding and text
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 6,
                  message: "Must be at least 6 characters",
                },
                validate: {
                  hasLetter: (value) =>
                    /[a-zA-Z]/.test(value) ||
                    "Must contain at least one letter",
                  hasNumber: (value) =>
                    /[0-9]/.test(value) || "Must contain at least one number",
                  hasSpecialChar: (value) =>
                    /[^a-zA-Z0-9\s]/.test(value) ||
                    "Must contain a special character",
                  noSpaces: (value) =>
                    !/\s/.test(value) || "Cannot contain spaces",
                },
              })}
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username && (
              <p role="alert" className="text-red-400 text-xs mt-0.5">
                {" "}
                {/* Smaller error text */}
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-gray-300"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              required
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p role="alert" className="text-red-400 text-xs mt-0.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-gray-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="w-full px-3 py-2.5 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" // Adjusted pr
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Must be at least 8 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Must include uppercase, number, and special character",
                  },
                })}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors" // Adjusted right
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
                {/* Smaller icons */}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="text-red-400 text-xs mt-0.5">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-gray-300"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                className="w-full px-3 py-2.5 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p role="alert" className="text-red-400 text-xs mt-0.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-base" // Adjusted py and font size
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <CircularProgress size={18} color="inherit" /> // Smaller progress spinner
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Divider */}
        {/* Reduced my-6 to my-4 */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-gray-400 text-xs font-medium">
            Or continue with
          </span>{" "}
          {/* Smaller text and padding */}
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-3">
          {" "}
          {/* Reduced mt-4 to mt-3 */}
          <p className="text-gray-400 text-sm">
            {" "}
            {/* Smaller text */}
            Already have an account?{" "}
            <a
              onClick={handleLoginClick}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Login here
            </a>
          </p>
        </div>

        {/* Copyright */}
        {/* Reduced mt-6 to mt-4 and font size */}
        <div className="text-center text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} GitGPT. All rights reserved.
        </div>
      </div>

      {/* Snackbar for messages */}
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
