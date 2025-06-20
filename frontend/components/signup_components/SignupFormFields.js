import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  PersonOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  EmailOutlined,
} from "@mui/icons-material";

export default function SignupFormFields({
  register,
  errors,
  showPassword,
  showConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
}) {
  return (
    <>
      {/* Username Field */}
      <TextField
        fullWidth
        margin="normal"
        id="username"
        label="Username"
        placeholder="e.g., raj@149"
        autoComplete="username"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlined sx={{ color: "rgba(59, 130, 246, 0.7)" }} />
            </InputAdornment>
          ),
        }}
        {...register("username", {
          required: "Username is required.",
          minLength: {
            value: 6,
            message: "Username must be at least 6 characters.",
          },
          validate: {
            hasLetter: (value) =>
              /[a-zA-Z]/.test(value) ||
              "Username must contain at least one letter.",
            hasNumber: (value) =>
              /[0-9]/.test(value) ||
              "Username must contain at least one number.",
            hasSpecialChar: (value) =>
              /[^a-zA-Z0-9\s]/.test(value) ||
              "Username must contain at least one special character (e.g., !, @, #, $).",
            noSpaces: (value) =>
              !/\s/.test(value) || "Username cannot contain spaces.",
          },
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
        placeholder="e.g., raj@example.com"
        autoComplete="email"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlined sx={{ color: "rgba(59, 130, 246, 0.7)" }} />
            </InputAdornment>
          ),
        }}
        {...register("email", {
          required: "Email is required.",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: "Invalid email address.",
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
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          validate: {
            hasUpperCase: (value) =>
              /[A-Z]/.test(value) ||
              "Password must contain at least one uppercase letter",
            hasLowerCase: (value) =>
              /[a-z]/.test(value) ||
              "Password must contain at least one lowercase letter",
            hasNumber: (value) =>
              /[0-9]/.test(value) ||
              "Password must contain at least one number",
            hasSpecialChar: (value) =>
              /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
              "Password must contain at least one special character",
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
              <LockOutlined sx={{ color: "rgba(59, 130, 246, 0.7)" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleConfirmPasswordVisibility}
                edge="end"
                sx={{ color: "rgba(71, 85, 105, 0.5)" }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...register("confirmPassword", {
          required: "Confirm Password is required",
          validate: (value) =>
            value === watch("password") || "Passwords do not match",
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
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

      {/* Role Selection */}
      <FormControl component="fieldset" margin="normal" sx={{ mb: 4 }}>
        <FormLabel
          component="legend"
          sx={{ color: "rgba(71, 85, 105, 0.7)", mb: 1.5 }}
        >
          Register as
        </FormLabel>
        <RadioGroup
          row
          aria-label="role"
          name="role"
          defaultValue="developer"
        >
          <FormControlLabel
            value="developer"
            control={<Radio sx={{ color: "#3b82f6" }} />}
            label={
              <Chip
                label="Developer"
                size="small"
                sx={{
                  backgroundColor: "#e0f2fe",
                  color: "#1e40af",
                  fontWeight: 600,
                }}
              />
            }
            {...register("role")}
          />
          <FormControlLabel
            value="manager"
            control={<Radio sx={{ color: "#8b5cf6" }} />}
            label={
              <Chip
                label="Manager"
                size="small"
                sx={{
                  backgroundColor: "#f3e8ff",
                  color: "#5b21b6",
                  fontWeight: 600,
                }}
              />
            }
            {...register("role")}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
} 