"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/features/authApiSlice"; // Assuming this path is correct
import {
  Snackbar,
  Alert,
  TextField,
  Button,
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Box,
  Grid,
  Fade,
  Slide,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  PersonOutlined, // Icon for Username
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  GitHub,
  AutoAwesome,
  Code,
  Speed,
  Security,
} from "@mui/icons-material";
import Head from "next/head";
// No Cookies or useLoginMutation needed for signup page directly

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch, // Used to validate confirm password against password
  } = useForm();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [signup, { isLoading }] = useSignupMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  /**
   * Handles the form submission for user registration.
   * Calls the signup mutation and handles success/error messages.
   * @param {Object} data - The form data (username, email, password, confirmPassword, role).
   */
  const onSubmit = async (data) => {
    try {
      // Ensure 'role' is part of the data sent to the API
      // If RadioGroup uses 'defaultValue', it won't be in `data` if not changed.
      // Explicitly set it if not present, though useForm should handle it with register.
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role || "developer", // Default role if not selected, assuming default 'developer' from RadioGroup
      };

      await signup(payload).unwrap(); // Send the payload
      setSnackbar({
        open: true,
        message: "User registered successfully! Redirecting to login...",
        severity: "success",
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      // Handle API error response structure
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

  /**
   * Closes the snackbar notification.
   * @param {Event} event - The event object.
   * @param {string} reason - The reason the snackbar is being closed (e.g., "clickaway").
   */
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Toggles the visibility of the password field.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Toggles the visibility of the confirm password field.
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  /**
   * Handles click on the "Already have an account?" link, redirecting to the login page.
   */
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Sign Up | GitGPT</title>
        <meta name="description" content="Create a GitGPT account" />
      </Head>

      {/* Main container with futuristic background */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: `
            linear-gradient(135deg,
              rgba(240, 248, 255, 0.8) 0%,
              rgba(230, 240, 255, 0.9) 25%,
              rgba(255, 250, 240, 0.8) 50%,
              rgba(245, 245, 255, 0.9) 75%,
              rgba(248, 250, 252, 1) 100%
            ),
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
          `,
          position: "relative",
          overflow: "auto",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 100px,
                rgba(255, 255, 255, 0.03) 100px,
                rgba(255, 255, 255, 0.03) 102px
              )
            `,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100vh", p: 0 }}>
          <Grid container sx={{ height: "100%" }}>
            {/* Left Section - Brand & Features (Hidden on mobile) */}
            {!isMobile && (
              <Grid
                item
                md={7}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  p: 6,
                }}
              >
                <Slide in={true} direction="right" timeout={800}>
                  <Box
                    sx={{
                      textAlign: "center",
                      maxWidth: 600,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    {/* Animated Logo */}
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        mb: 4,
                      }}
                    >
                      <Box
                        component="img"
                        src="/logo.png" // Path to logo in public folder
                        alt="GitGPT Logo"
                        sx={{
                          width: { md: 140, lg: 160 },
                          height: { md: 140, lg: 160 },
                          filter: `
                            drop-shadow(0 8px 32px rgba(59, 130, 246, 0.2))
                            drop-shadow(0 4px 16px rgba(139, 92, 246, 0.1))
                          `,
                          animation: "float 6s ease-in-out infinite",
                          "@keyframes float": {
                            "0%, 100%": { transform: "translateY(0px)" },
                            "50%": { transform: "translateY(-10px)" },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 200,
                          height: 200,
                          background: `
                            conic-gradient(
                              from 0deg,
                              transparent,
                              rgba(59, 130, 246, 0.1),
                              transparent,
                              rgba(139, 92, 246, 0.1),
                              transparent
                            )
                          `,
                          borderRadius: "50%",
                          animation: "spin 20s linear infinite",
                          "@keyframes spin": {
                            "0%": {
                              transform: "translate(-50%, -50%) rotate(0deg)",
                            },
                            "100%": {
                              transform: "translate(-50%, -50%) rotate(360deg)",
                            },
                          },
                          zIndex: -1,
                        }}
                      />
                    </Box>

                    {/* Brand Title */}
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 900,
                        mb: 2,
                        fontSize: { md: "3rem", lg: "3.5rem" },
                        background: `
                          linear-gradient(
                            135deg,
                            #1e40af 0%,
                            #3b82f6 25%,
                            #8b5cf6 50%,
                            #06b6d4 75%,
                            #10b981 100%
                          )
                        `,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundSize: "200% 200%",
                        animation: "gradientShift 8s ease-in-out infinite",
                        "@keyframes gradientShift": {
                          "0%, 100%": { backgroundPosition: "0% 50%" },
                          "50%": { backgroundPosition: "100% 50%" },
                        },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      GitGPT
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                      variant="h5"
                      sx={{
                        color: "rgba(71, 85, 105, 0.8)",
                        mb: 6,
                        fontWeight: 400,
                        lineHeight: 1.4,
                        maxWidth: 480,
                        mx: "auto",
                      }}
                    >
                      Your AI-powered coding companion for{" "}
                      <Box
                        component="span"
                        sx={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: 600,
                        }}
                      >
                        seamless development workflows
                      </Box>
                    </Typography>

                    {/* Feature Cards */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 3,
                        maxWidth: 500,
                        mx: "auto",
                      }}
                    >
                      {[
                        {
                          icon: <AutoAwesome sx={{ fontSize: 32 }} />,
                          title: "AI Pair Programming",
                          color: "#3b82f6",
                        },
                        {
                          icon: <Code sx={{ fontSize: 32 }} />,
                          title: "Smart Code Reviews",
                          color: "#8b5cf6",
                        },
                        {
                          icon: <Speed sx={{ fontSize: 32 }} />,
                          title: "Automated Workflows",
                          color: "#06b6d4",
                        },
                        {
                          icon: <Security sx={{ fontSize: 32 }} />,
                          title: "Secure Integration",
                          color: "#10b981",
                        },
                      ].map((feature, index) => (
                        <Fade
                          in={true}
                          key={index}
                          timeout={1000 + index * 200}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 4,
                              background: `
                                linear-gradient(135deg,
                                  rgba(255, 255, 255, 0.9) 0%,
                                  rgba(255, 255, 255, 0.7) 100%
                                )
                              `,
                              backdropFilter: "blur(20px)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              textAlign: "center",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1)`,
                                "& .feature-icon": {
                                  transform: "scale(1.1)",
                                  color: feature.color,
                                },
                              },
                            }}
                          >
                            <Box
                              className="feature-icon"
                              sx={{
                                color: "rgba(71, 85, 105, 0.7)",
                                mb: 2,
                                transition: "all 0.3s ease",
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "rgba(30, 41, 59, 0.9)",
                                fontSize: "0.95rem",
                              }}
                            >
                              {feature.title}
                            </Typography>
                          </Paper>
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                </Slide>
              </Grid>
            )}

            {/* Right Section - Sign Up Form */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 3, md: 4 },
                position: "relative",
              }}
            >
              <Fade in={true} timeout={1200}>
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
                        src="/logo.png" // Path to logo in public folder
                        alt="GitGPT Logo"
                        sx={{
                          width: 80,
                          height: 80,
                          mb: 2,
                          filter:
                            "drop-shadow(0 4px 16px rgba(59, 130, 246, 0.2))",
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
                  <Box
                    component="form"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    {/* Username Field */}
                    <TextField
                      fullWidth
                      margin="normal"
                      id="username"
                      label="Username"
                      autoComplete="username"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlined
                              sx={{ color: "rgba(59, 130, 246, 0.7)" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      {...register("username", {
                        required: "Username is required",
                      })}
                      error={!!errors.username}
                      helperText={errors.username?.message}
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

                    {/* Email Field */}
                    <TextField
                      fullWidth
                      margin="normal"
                      id="email"
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined
                              sx={{ color: "rgba(59, 130, 246, 0.7)" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
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
                      autoComplete="new-password"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined
                              sx={{ color: "rgba(59, 130, 246, 0.7)" }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              sx={{ color: "rgba(71, 85, 105, 0.5)" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
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

                    {/* Confirm Password Field */}
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      autoComplete="new-password"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined
                              sx={{ color: "rgba(59, 130, 246, 0.7)" }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                              sx={{ color: "rgba(71, 85, 105, 0.5)" }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      {...register("confirmPassword", {
                        required: "Confirm Password is required",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
                      })}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      sx={{
                        mb: 4, // Increased margin for role selection below
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

                    {/* Role Selection */}
                    <FormControl
                      component="fieldset"
                      error={!!errors.role}
                      sx={{ mb: 4 }} // Added margin bottom
                    >
                      <FormLabel
                        component="legend"
                        sx={{
                          color: "rgba(71, 85, 105, 0.8)",
                          fontWeight: 600,
                          mb: 1,
                          "&.Mui-focused": {
                            color: "#3b82f6", // Match focus color
                          },
                        }}
                      >
                        Your Role
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-label="role"
                        defaultValue="developer"
                        name="radio-buttons-group"
                        {...register("role", { required: "Role is required" })}
                      >
                        <FormControlLabel
                          value="developer"
                          control={
                            <Radio
                              sx={{
                                color: "rgba(71, 85, 105, 0.7)",
                                "&.Mui-checked": {
                                  color: "#3b82f6",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ color: "rgba(71, 85, 105, 0.9)" }}
                            >
                              Developer
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          value="manager"
                          control={
                            <Radio
                              sx={{
                                color: "rgba(71, 85, 105, 0.7)",
                                "&.Mui-checked": {
                                  color: "#3b82f6",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ color: "rgba(71, 85, 105, 0.9)" }}
                            >
                              Manager
                            </Typography>
                          }
                        />
                      </RadioGroup>
                      {errors.role && (
                        <Typography variant="body2" color="error">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Sign Up Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PersonOutlined /> // A generic user icon for signup
                        )
                      }
                      sx={{
                        py: 2,
                        mb: 3,
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        textTransform: "none",
                        background: `
                          linear-gradient(135deg,
                            #1e40af 0%,
                            #3b82f6 25%,
                            #8b5cf6 75%,
                            #06b6d4 100%
                          )
                        `,
                        backgroundSize: "200% 200%",
                        boxShadow: `
                          0 8px 32px rgba(59, 130, 246, 0.3),
                          0 0 0 1px rgba(255, 255, 255, 0.2) inset
                        `,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          backgroundPosition: "100% 0%",
                          transform: "translateY(-2px)",
                          boxShadow: `
                            0 12px 40px rgba(59, 130, 246, 0.4),
                            0 0 0 1px rgba(255, 255, 255, 0.3) inset
                          `,
                        },
                        "&:active": {
                          transform: "translateY(0px)",
                        },
                        "&:disabled": {
                          background: "rgba(148, 163, 184, 0.5)",
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                    >
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </Button>

                    {/* Divider */}
                    <Box
                      sx={{
                        position: "relative",
                        textAlign: "center",
                        mb: 3,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          right: 0,
                          height: 1,
                          background:
                            "linear-gradient(90deg, transparent, rgba(203, 213, 225, 0.5), transparent)",
                        },
                      }}
                    >
                      <Chip
                        label="OR CONTINUE WITH"
                        sx={{
                          background: "rgba(255, 255, 255, 0.9)",
                          color: "rgba(71, 85, 105, 0.6)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          border: "1px solid rgba(203, 213, 225, 0.3)",
                        }}
                      />
                    </Box>

                    {/* GitHub Login */}
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GitHub />}
                      sx={{
                        py: 1.8,
                        mb: 4,
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        borderColor: "rgba(203, 213, 225, 0.5)",
                        borderWidth: 1.5,
                        color: "rgba(30, 41, 59, 0.8)",
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: "rgba(30, 41, 59, 0.3)",
                          background: "rgba(248, 250, 252, 0.9)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                        },
                      }}
                    >
                      Continue with GitHub
                    </Button>

                    {/* Footer Link to Login */}
                    <Box
                      sx={{ textAlign: "center", cursor: "pointer" }}
                      onClick={handleLoginClick}
                    >
                      <div className="flex justify-center items-center">
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(71, 85, 105, 0.7)", mb: 1 }}
                        >
                          Already have an account?
                        </Typography>

                        <Button
                          variant="text"
                          onClick={handleLoginClick}
                          sx={{
                            color: "#3b82f6",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                              textDecoration: "underline",
                              color: "#1e40af",
                            },
                          }}
                        >
                          Login here
                        </Button>
                      </div>
                    </Box>
                  </Box>
                </Paper>
              </Fade>

              {/* Copyright */}
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 20,
                  color: "rgba(71, 85, 105, 0.5)",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                © {new Date().getFullYear()} GitGPT. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>

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
    </>
  );
}
