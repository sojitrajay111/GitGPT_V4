"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/features/authApiSlice";
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
} from "@mui/material";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [signup, { isLoading }] = useSignupMutation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await signup(data).unwrap();
      setMessage("User registered successfully");
      setSeverity("success");
      setOpen(true);
      router.push("/login");
    } catch (error) {
      setMessage(error.data?.message || "An error occurred");
      setSeverity("error");
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Container maxWidth="sm" className="mt-10">
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          🚀 Create Your Account
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            label="Username"
            fullWidth
            {...register("username", { required: "Username is required" })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register("email", { required: "Email is required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <FormControl component="fieldset" error={!!errors.role}>
            <FormLabel component="legend">Role</FormLabel>
            <RadioGroup row defaultValue="developer">
              <FormControlLabel
                value="developer"
                control={<Radio />}
                label="Developer"
                {...register("role", { required: "Role is required" })}
              />
              <FormControlLabel
                value="manager"
                control={<Radio />}
                label="Manager"
                {...register("role", { required: "Role is required" })}
              />
            </RadioGroup>
            {errors.role && (
              <Typography variant="body2" color="error">
                {errors.role.message}
              </Typography>
            )}
          </FormControl>

          <Box textAlign="center" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignUp;
