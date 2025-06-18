import React from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";

export default function SearchAndAddSection({
  openAddUserDialog,
  setOpenAddUserDialog,
  setUsernameVerifiedAsNew,
  setUsernameVerificationMessage,
  setFormMessage,
  reset,
  searchTerm,
  setSearchTerm,
  isMobile,
  theme,
  buttonSx,
}) {
  return (
    <Box sx={{ 
      width: '100%', 
      px: 3, 
      mb: 2, 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: 'center', 
      gap: 2, 
      justifyContent: 'space-between' 
    }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setOpenAddUserDialog(true);
          setUsernameVerifiedAsNew(false);
          setUsernameVerificationMessage("");
          setFormMessage("");
          reset();
        }}
        sx={{
          ...buttonSx,
          height: 48,
          minWidth: isMobile ? '100%' : 150, // Full width on mobile
          borderRadius: 2.5,
          boxShadow: '0 2px 8px 0 rgba(66, 133, 244, 0.10)',
          whiteSpace: 'nowrap',
          fontSize: 16,
          px: 3,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Add User
      </Button>
      <TextField
        variant="outlined"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          minWidth: isMobile ? '100%' : 260, // Full width on mobile
          mb: 0,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            height: 48,
            background: theme === "dark" ? "#23272F" : "#E8EDF2",
            boxShadow: theme === "dark"
              ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(40,40,40,0.3)"
              : "inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
            fontSize: 16,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            // Ensure autofill background matches theme for search bar
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
              WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
              caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
            },
            '& input:-webkit-autofill:hover': {
              WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
              WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
              caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
            },
            '& input:-webkit-autofill:focus': {
              WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
              WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
              caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
            },
            '& input:-webkit-autofill:active': {
              WebkitBoxShadow: `0 0 0 1000px ${theme === "dark" ? "#23272F" : "#E8EDF2"} inset !important`,
              WebkitTextFillColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
              caretColor: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
            },
          },
          '& .MuiInputBase-input': {
            color: theme === "dark" ? "#F3F4F6" : "#222",
            py: 0,
            fontSize: 16,
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <SearchIcon color="action" sx={{ fontSize: 22 }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
} 