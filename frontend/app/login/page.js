"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/features/authApiSlice"; // Adjust the import path as needed
import {
  Snackbar,
  Alert,
  TextField,
  Button,
  Container,
  Typography,
} from "@mui/material";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      localStorage.setItem("token", response.token);
      setMessage("Login successful");
      setSeverity("success");
      setOpen(true);
      router.push("/dashboard");
    } catch (error) {
      setMessage(error.data?.message || "An error occurred");
      setSeverity("error");
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Container maxWidth="sm" className="mt-10">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          {...register("email", { required: "Email is required" })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          {...register("password", { required: "Password is required" })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? "Logging In..." : "Login"}
        </Button>
      </form>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
