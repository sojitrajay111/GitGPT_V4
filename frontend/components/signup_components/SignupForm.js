import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/features/authApiSlice";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import SignupFormFields from "./SignupFormFields";

export default function SignupForm({ isMobile }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

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
        role: data.role || "developer",
      };

      await signup(payload).unwrap();

      setSnackbar({
        open: true,
        message: "User registered successfully! Redirecting to login...",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
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
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <Box
      sx={{
        width: "100%",
        animation: "fadeIn 1.2s ease-in-out",
        "@keyframes fadeIn": {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          borderRadius: 6,
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.95) 0%,
              rgba(255, 255, 255, 0.85) 100%
            )
          `,
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset
          `,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
          },
        }}
      >
        {/* Form Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "2rem", sm: "2.5rem" },
              background:
                "linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            Create Your Account
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(71, 85, 105, 0.7)",
              fontSize: "1.1rem",
            }}
          >
            Join GitGPT for seamless development workflows
          </Typography>
        </Box>

        {/* Sign Up Form */}
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <SignupFormFields
            register={register}
            errors={errors}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
            watch={watch}
          />

          {/* Sign Up Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 4,
              fontSize: "1.1rem",
              fontWeight: 700,
              textTransform: "none",
              background:
                "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
              },
              "&:disabled": {
                background:
                  "linear-gradient(135deg, #a5d2ff 0%, #d1b1ff 100%)",
                color: "#fff",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </Box>

        {/* "Already have an account?" link */}
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            color: "rgba(71, 85, 105, 0.8)",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center" }}>
            Already have an account?{" "}
            <Button
              onClick={handleLoginClick}
              disabled={isLoading}
              sx={{
                ml: 1,
                fontWeight: 700,
                color: "#3b82f6",
                textTransform: "none",
                "&:hover": {
                  textDecoration: "underline",
                  background: "transparent",
                  color: "#7c3aed",
                },
              }}
            >
              Login here
            </Button>
          </div>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
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
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 