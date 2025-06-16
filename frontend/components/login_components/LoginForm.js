import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/features/authApiSlice";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  LockOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import Cookies from "js-cookie";

export default function LoginForm({ isMobile }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await login({
        identifier: data.identifier,
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
        router.push(`/${response?.user?.id}/dashboard`);
        router.refresh();
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.data?.message || "An error occurred",
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

  const handleSignupClick = () => {
    router.push("/signup");
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
        {/* Mobile Logo */}
        {isMobile && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="GitGPT Logo"
              sx={{
                width: 80,
                height: 80,
                mb: 2,
                filter: "drop-shadow(0 4px 16px rgba(59, 130, 246, 0.2))",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              GitGPT
            </Typography>
          </Box>
        )}

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
            Welcome Back
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(71, 85, 105, 0.7)",
              fontSize: "1.1rem",
            }}
          >
            Login to access your GitGPT dashboard
          </Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* Username or Email Field */}
          <TextField
            fullWidth
            margin="normal"
            id="identifier"
            label="Username or Email"
            autoComplete="username"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlined sx={{ color: "rgba(59, 130, 246, 0.7)" }} />
                </InputAdornment>
              ),
            }}
            {...register("identifier", {
              required: "Username or Email is required",
            })}
            error={!!errors.identifier}
            helperText={errors.identifier?.message}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(10px)",
                "& fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.5)",
                  borderWidth: 1.5,
                },
                "&:hover fieldset": {
                  borderColor: "rgba(59, 130, 246, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(71, 85, 105, 0.7)",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: "rgba(59, 130, 246, 0.7)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{ color: "rgba(71, 85, 105, 0.5)" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("password", {
              required: "Password is required",
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(10px)",
                "& fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.5)",
                  borderWidth: 1.5,
                },
                "&:hover fieldset": {
                  borderColor: "rgba(59, 130, 246, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(71, 85, 105, 0.7)",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
            }}
          />

          {/* Login Button */}
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
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #a5d2ff 0%, #d1b1ff 100%)",
                color: "#fff",
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
          </Button>
        </Box>

        {/* Forgot password and Sign Up links */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              color: "rgba(71, 85, 105, 0.8)",
              mb: { xs: 2, sm: 0 },
            }}
          >
            New to GitGPT?{" "}
            <Button
              onClick={handleSignupClick}
              disabled={isLoading}
              sx={{
                ml: 0.5,
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
              Sign up here
            </Button>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              textAlign: { xs: "center", sm: "right" },
            }}
          >
            <Typography
              variant="body2"
              component="a"
              href="#"
              sx={{
                fontWeight: 600,
                color: "rgba(71, 85, 105, 0.7)",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                  color: "#7c3aed",
                },
              }}
            >
              Forgot password?
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
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