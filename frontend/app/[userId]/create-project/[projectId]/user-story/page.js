// page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Avatar,
  Chip,
  Stack,
  Snackbar,
  Divider,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Switch,
} from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  styled,
  keyframes,
  useTheme,
} from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useGenerateAiStoryMutation,
  useGenerateSalesforceCodeMutation,
} from "@/features/userStoryApiSlice";
import { useGetCollaboratorsQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import {
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} from "@/features/developerApiSlice";
import { useGetThemeQuery } from "@/features/themeApiSlice";

// Enhanced Keyframes for futuristic loading animation
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const neonGlow = keyframes`
  0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.5); }
  50% { text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.8); }
  100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.5); }
`;

const cardHover = keyframes`
  0% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
  50% { transform: perspective(1000px) rotateX(2deg) rotateY(2deg); }
  100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
`;

// Enhanced Theme definitions with 3D effects
const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode: mode,
      primary: {
        main: mode === "dark" ? "#80b0ff" : "#5e72e4",
        contrastText: mode === "dark" ? "#1a202c" : "#ffffff",
      },
      secondary: {
        main: mode === "dark" ? "#e0b0ff" : "#11cdef",
      },
      success: { main: "#2dce89" },
      error: { main: "#f5365c" },
      warning: { main: "#fb6340" },
      info: { main: "#11cdef" },
      background: {
        default: mode === "dark" ? "#121212" : "#f5f7fa",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#e0e0e0" : "#32325d",
        secondary: mode === "dark" ? "#b0b0b0" : "#525f7f",
      },
      divider: mode === "dark" ? "#333333" : "#e0e0e0",
      action: {
        selected:
          mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        hover: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
      },
      custom: {
        glassEffect:
          mode === "dark"
            ? "rgba(30, 30, 30, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
        glassBorder:
          mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        depthShadow:
          mode === "dark"
            ? "0 10px 20px rgba(0, 0, 0, 0.5), 0 6px 6px rgba(0, 0, 0, 0.4)"
            : "0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.08)",
        innerShadow:
          mode === "dark"
            ? "inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(60, 60, 60, 0.3)"
            : "inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
        neonPrimary:
          mode === "dark"
            ? "rgba(128, 176, 255, 0.8)"
            : "rgba(94, 114, 228, 0.8)",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
      h4: {
        fontWeight: 800,
        fontSize: "2rem",
        letterSpacing: "-0.5px",
      },
      h5: {
        fontWeight: 700,
        fontSize: "1.5rem",
        letterSpacing: "-0.25px",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1.1rem",
        letterSpacing: "-0.1px",
      },
      body1: {
        fontSize: "0.95rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.85rem",
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            padding: "10px 22px",
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                mode === "dark"
                  ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
                  : "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 100%)",
              opacity: 0,
              transition: "opacity 0.3s ease",
            },
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 8px 20px rgba(0,0,0,0.6), 0 -4px 10px rgba(255,255,255,0.05)"
                  : "0 8px 20px rgba(0, 0, 0, 0.15), 0 -4px 10px rgba(0,0,0,0.03)",
              "&::before": {
                opacity: 1,
              },
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          contained: {
            backgroundColor: mode === "dark" ? "#80b0ff" : "#5e72e4",
            color: mode === "dark" ? "#1a202c" : "#ffffff",
            boxShadow:
              mode === "dark"
                ? "0 4px 15px rgba(128, 176, 255, 0.3)"
                : "0 4px 15px rgba(94, 114, 228, 0.3)",
            "&:hover": {
              backgroundColor: mode === "dark" ? "#9ac0ff" : "#5262c9",
              boxShadow:
                mode === "dark"
                  ? "0 6px 20px rgba(128, 176, 255, 0.4)"
                  : "0 6px 20px rgba(94, 114, 228, 0.4)",
            },
          },
          outlined: {
            borderColor: mode === "dark" ? "#4a4a4a" : "#e0e0e0",
            color: mode === "dark" ? "#e0e0e0" : "#5e72e4",
            "&:hover": {
              borderColor: mode === "dark" ? "#80b0ff" : "#5e72e4",
              backgroundColor:
                mode === "dark"
                  ? "rgba(128,176,255,0.08)"
                  : "rgba(94,114,228,0.08)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            boxShadow:
              mode === "dark"
                ? "8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(40,40,40,0.3)"
                : "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
            border: `1px solid ${mode === "dark" ? "#3a3a3a" : "#e0e0e0"}`,
            transition: "all 0.3s ease, transform 0.5s ease",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            "&:hover": {
              transform:
                "translateY(-5px) perspective(1000px) rotateX(1deg) rotateY(1deg)",
              boxShadow:
                mode === "dark"
                  ? "12px 12px 24px rgba(0,0,0,0.6), -12px -12px 24px rgba(50,50,50,0.4)"
                  : "12px 12px 24px rgba(0,0,0,0.15), -12px -12px 24px rgba(255,255,255,0.9)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "20px",
            transformStyle: "preserve-3d",
            perspective: "1000px",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: mode === "dark" ? "#1a1a1a" : "#f0f0f0",
              transition: "all 0.3s ease",
              "& fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: `2px solid ${mode === "dark" ? "#80b0ff" : "#5e72e4"}`,
                boxShadow:
                  mode === "dark"
                    ? "0 0 10px rgba(128, 176, 255, 0.5)"
                    : "0 0 10px rgba(94, 114, 228, 0.3)",
              },
              boxShadow:
                mode === "dark"
                  ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(50,50,50,0.3)"
                  : "inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.7)",
            },
            "& .MuiInputLabel-root": {
              color: mode === "dark" ? "#b0b0b0" : "#525f7f",
              transform: "translate(14px, 14px) scale(1)",
              "&.Mui-focused": {
                color: mode === "dark" ? "#80b0ff" : "#5e72e4",
                transform: "translate(14px, -9px) scale(0.75)",
              },
              "&.MuiFormLabel-filled": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            },
            "& .MuiInputBase-input": {
              color: mode === "dark" ? "#e0e0e0" : "#32325d",
              padding: "12px 14px",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            backgroundColor: mode === "dark" ? "#1a1a1a" : "#f0f0f0",
            transition: "all 0.3s ease",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: `2px solid ${mode === "dark" ? "#80b0ff" : "#5e72e4"}`,
              boxShadow:
                mode === "dark"
                  ? "0 0 10px rgba(128, 176, 255, 0.5)"
                  : "0 0 10px rgba(94, 114, 228, 0.3)",
            },
            color: mode === "dark" ? "#e0e0e0" : "#32325d",
            boxShadow:
              mode === "dark"
                ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(50,50,50,0.3)"
                : "inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.7)",
          },
          icon: {
            color: mode === "dark" ? "#e0e0e0" : "#525f7f",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? "#b0b0b0" : "#525f7f",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "24px",
            transition: "all 0.3s ease",
            backgroundColor: mode === "dark" ? "#2a2a2a" : "#e9ecef",
            color: mode === "dark" ? "#e0e0e0" : "#525f7f",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 8px rgba(0,0,0,0.3)"
                  : "0 4px 8px rgba(0,0,0,0.1)",
            },
          },
          outlined: {
            borderColor: mode === "dark" ? "#4a4a4a" : "#d0d0d0",
          },
          colorSecondary: {
            backgroundColor: mode === "dark" ? "#4a3a5a" : "#e3f2fd",
            color: mode === "dark" ? "#e0b0ff" : "#1976d2",
          },
          colorSuccess: {
            backgroundColor: mode === "dark" ? "#2a4a3a" : "#e8f5e9",
            color: mode === "dark" ? "#81c784" : "#2e7d32",
          },
          colorWarning: {
            backgroundColor: mode === "dark" ? "#4a3a2a" : "#fff3e0",
            color: mode === "dark" ? "#ffb74d" : "#ed6c02",
          },
          colorInfo: {
            backgroundColor: mode === "dark" ? "#2a3a4a" : "#e1f5fe",
            color: mode === "dark" ? "#64b5f6" : "#0288d1",
          },
          colorError: {
            backgroundColor: mode === "dark" ? "#4a2a2a" : "#ffebee",
            color: mode === "dark" ? "#ef9a9a" : "#d32f2f",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#333333" : "#e0e0e0",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? "#e0e0e0" : "#525f7f",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              transform: "scale(1.1)",
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: mode === "dark" ? "#80b0ff" : "#5e72e4",
              "& + .MuiSwitch-track": {
                backgroundColor: mode === "dark" ? "#80b0ff" : "#5e72e4",
                opacity: 0.7,
              },
            },
          },
          track: {
            backgroundColor: mode === "dark" ? "#4a4a4a" : "#e0e0e0",
          },
          thumb: {
            boxShadow:
              mode === "dark"
                ? "0 2px 4px rgba(0,0,0,0.5)"
                : "0 2px 4px rgba(0,0,0,0.2)",
          },
        },
      },
    },
  });

// Enhanced Styled components with 3D effects
const HeaderCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)"
      : "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)",
  color: "white",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 10px 30px rgba(0,0,0,0.5), 0 -5px 15px rgba(255,255,255,0.05)"
      : "0 10px 30px rgba(0,0,0,0.2), 0 -5px 15px rgba(255,255,255,0.1)",
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, rgba(128,176,255,0.1) 0%, transparent 50%, rgba(224,176,255,0.1) 100%)"
        : "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)",
    animation: `${rotate} 20s linear infinite`,
    opacity: 0.5,
  },
}));

const StoryCard = styled(Card)(({ theme, storyStatus }) => {
  let borderColor;
  let statusChipBgColor;
  let statusChipTextColor;

  switch (storyStatus) {
    case "AI DEVELOPED":
      borderColor = theme.palette.secondary.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSecondary
          .backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSecondary.color;
      break;
    case "COMPLETED":
      borderColor = theme.palette.success.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSuccess
          .backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorSuccess.color;
      break;
    case "IN REVIEW":
      borderColor = theme.palette.warning.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorWarning
          .backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorWarning.color;
      break;
    case "PLANNING":
      borderColor = theme.palette.info.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.colorInfo
          .backgroundColor;
      statusChipTextColor =
        theme.palette.components?.MuiChip.styleOverrides.colorInfo.color;
      break;
    default:
      borderColor = theme.palette.primary.main;
      statusChipBgColor =
        theme.palette.components?.MuiChip.styleOverrides.root.backgroundColor;
      statusChipTextColor = theme.palette.text.secondary;
      break;
  }

  return {
    borderLeft: `5px solid ${borderColor}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: "all 0.3s ease",
    transformStyle: "preserve-3d",
    "& .status-chip": {
      backgroundColor: statusChipBgColor,
      color: statusChipTextColor,
      fontWeight: 600,
      borderRadius: "8px",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 2px 4px rgba(0,0,0,0.3)"
          : "0 2px 4px rgba(0,0,0,0.1)",
    },
    "& .MuiTypography-root": {
      color: theme.palette.text.primary,
    },
    "& .MuiTypography-caption, & .MuiTypography-body2": {
      color: theme.palette.text.secondary,
    },
    "&:hover": {
      transform:
        "translateY(-5px) perspective(1000px) rotateX(1deg) rotateY(1deg)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "12px 12px 24px rgba(0,0,0,0.6), -12px -12px 24px rgba(50,50,50,0.4)"
          : "12px 12px 24px rgba(0,0,0,0.15), -12px -12px 24px rgba(255,255,255,0.9)",
      backgroundColor: theme.palette.action.hover,
    },
  };
});

const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.custom.glassEffect,
  backdropFilter: "blur(10px)",
  border: `1px solid ${theme.palette.custom.glassBorder}`,
  boxShadow: theme.palette.custom.depthShadow,
  borderRadius: "20px",
  padding: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 15px 35px rgba(0,0,0,0.6), 0 -10px 20px rgba(50,50,50,0.4)"
        : "0 15px 35px rgba(0,0,0,0.15), 0 -10px 20px rgba(255,255,255,0.9)",
  },
}));

const AIContentBox = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.7)"
      : "rgba(240, 240, 240, 0.7)",
  backdropFilter: "blur(5px)",
  border: `1px solid ${theme.palette.mode === "dark" ? "#3a3a3a" : "#d0d0d0"}`,
  borderRadius: "16px",
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  color: theme.palette.text.primary,
  boxShadow: theme.palette.custom.innerShadow,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: theme.palette.secondary.main,
  },
}));

const LoadingDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "24px",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(145deg, #181818 0%, #000000 100%)"
        : "linear-gradient(145deg, #f5f7fa 0%, #e0e0e0 100%)",
    color: theme.palette.text.primary,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 50px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.6)"
        : "0 20px 50px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.1)",
    padding: theme.spacing(4),
    maxWidth: "500px",
    width: "90%",
    textAlign: "center",
    transformStyle: "preserve-3d",
    perspective: "1000px",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        theme.palette.mode === "dark"
          ? "linear-gradient(45deg, rgba(128,176,255,0.1) 0%, transparent 50%, rgba(224,176,255,0.1) 100%)"
          : "linear-gradient(45deg, rgba(94,114,228,0.1) 0%, transparent 50%, rgba(17,205,239,0.1) 100%)",
      animation: `${rotate} 20s linear infinite`,
      opacity: 0.5,
    },
  },
}));

const AnimatedIcon = styled(Box)(({ theme }) => ({
  fontSize: "4rem",
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  animation: `${rotate} 2s linear infinite, ${float} 3s ease-in-out infinite`,
  display: "inline-block",
  filter:
    theme.palette.mode === "dark"
      ? "drop-shadow(0 0 5px rgba(128, 176, 255, 0.7))"
      : "drop-shadow(0 0 5px rgba(94, 114, 228, 0.5))",
}));

const StatusMessage = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  animation: theme.palette.mode === "dark" ? `${neonGlow} 2s infinite` : "none",
}));

const CompletedStepsList = styled(Box)(({ theme }) => ({
  maxHeight: "150px",
  overflowY: "auto",
  textAlign: "left",
  paddingLeft: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderLeft: `2px solid ${theme.palette.secondary.main}`,
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.mode === "dark" ? "#555" : "#888",
    borderRadius: "3px",
  },
}));

const CompletedStepItem = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  animation: `${fadeIn} 0.5s ease-out`,
  "& svg": {
    marginRight: theme.spacing(1),
    color: theme.palette.success.main,
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0 0 3px rgba(45, 206, 137, 0.5))"
        : "none",
  },
}));

const TruncatedText = ({ content, maxLines = 5, title }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const lines = content ? content.split("\n") : [];
  const needsTruncation = lines.length > maxLines;

  const displayedContent =
    expanded || !needsTruncation
      ? content
      : lines.slice(0, maxLines).join("\n") + (needsTruncation ? "..." : "");

  return (
    <Box mb={2}>
      {title && (
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={600}
          mb={1}
          sx={{
            display: "flex",
            alignItems: "center",
            "&::before": {
              content: '""',
              display: "inline-block",
              width: "4px",
              height: "16px",
              backgroundColor: theme.palette.primary.main,
              marginRight: "8px",
              borderRadius: "2px",
            },
          }}
        >
          {title}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {displayedContent}
      </Typography>
      {needsTruncation && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{
            mt: 1,
            p: 0,
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </Box>
  );
};

const UserStoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId, projectId } = params;

  // State for forms and views
  const [activePanel, setActivePanel] = useState("list");
  const [selectedStory, setSelectedStory] = useState(null);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // State for code generation loading and status
  const [isGeneratingCodeProcess, setIsGeneratingCodeProcess] = useState(false);
  const [currentGenerationStatus, setCurrentGenerationStatus] = useState("");
  const [completedGenerationSteps, setCompletedGenerationSteps] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [activeGenerationStoryId, setActiveGenerationStoryId] = useState(null);

  // Form fields state
  const [userStoryTitle, setUserStoryTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [testingScenarios, setTestingScenarios] = useState("");
  const [selectedCollaboratorGithubIds, setSelectedCollaboratorGithubIds] =
    useState([]);
  const [generatedStoryContent, setGeneratedStoryContent] = useState("");
  const [storyStatus, setStoryStatus] = useState("PLANNING");
  const [storyPriority, setStoryPriority] = useState("Medium");
  const [estimatedTime, setEstimatedTime] = useState("");

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for theme mode, initialized from RTK Query
  const {
    data: themeData,
    isLoading: isThemeLoading,
    isError: isThemeError,
  } = useGetThemeQuery(userId, {
    skip: !userId,
  });

  const themeMode = themeData?.theme || "light";

  useEffect(() => {
    if (!isThemeLoading && !isThemeError && themeMode) {
      document.documentElement.classList.toggle("dark", themeMode === "dark");
    }
  }, [themeMode, isThemeLoading, isThemeError]);

  // Memoize the theme creation to prevent unnecessary re-renders
  const currentTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  // RTK Query Hooks
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const userRole = userData?.user?.role;
  const githubId = userData?.githubData?.githubId;

  const projectGithubRepoUrl = "https://github.com/your-org/your-repo-name"; // Placeholder

  const { data: developerPermissions } = useGetCollaboratorPermissionsQuery(
    { projectId, githubId },
    { skip: !projectId || !githubId || userRole !== "developer" }
  );
  const { data: developerUserStories } = useGetDeveloperUserStoriesQuery(
    githubId,
    { skip: !githubId }
  );
  const {
    data: userStoriesData,
    isLoading: storiesLoading,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(projectId, { skip: !projectId });
  const { data: collaboratorsData, isLoading: collaboratorsLoading } =
    useGetCollaboratorsQuery(projectId, { skip: !projectId });

  const [createUserStory, { isLoading: isCreating }] =
    useCreateUserStoryMutation();
  const [updateUserStory, { isLoading: isUpdating }] =
    useUpdateUserStoryMutation();
  const [deleteUserStory, { isLoading: isDeleting }] =
    useDeleteUserStoryMutation();
  const [generateAiStory, { isLoading: isGenerating }] =
    useGenerateAiStoryMutation();
  const [triggerSalesforceCodeGeneration] = useGenerateSalesforceCodeMutation();

  const canManageStories =
    userRole === "manager" ||
    developerPermissions?.includes("User story creation");

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => {
    setUserStoryTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setTestingScenarios("");
    setSelectedCollaboratorGithubIds([]);
    setGeneratedStoryContent("");
    setStoryStatus("PLANNING");
    setStoryPriority("Medium");
    setEstimatedTime("");
    setSelectedStory(null);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setActivePanel("create");
  };

  const handleOpenEditForm = (story) => {
    setSelectedStory(story);
    setUserStoryTitle(story.userStoryTitle);
    setDescription(story.description);
    setAcceptanceCriteria(story.acceptanceCriteria);
    setTestingScenarios(story.testingScenarios);
    setSelectedCollaboratorGithubIds(
      story.collaborators?.map((c) => c.githubId) || []
    );
    setGeneratedStoryContent(story.aiEnhancedUserStory || "");
    setStoryStatus(story.status || "PLANNING");
    setStoryPriority(story.priority || "Medium");
    setEstimatedTime(story.estimatedTime || "");
    setActivePanel("edit");
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setActivePanel("view");
  };

  const handleOpenDeleteDialog = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setDeleteDialogOpen(false);
    if (!isGeneratingCodeProcess) {
      setIsGeneratingCodeProcess(false);
      setCompletedGenerationSteps([]);
      setCurrentGenerationStatus("");
      setGenerationError(null);
      setGithubResult(null);
      setActiveGenerationStoryId(null);
    }
  };

  const handleCollaboratorChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCollaboratorGithubIds((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleGenerateStory = async () => {
    if (!userStoryTitle || !description) {
      showSnackbar(
        "Please fill in Title and Description before generating AI content.",
        "warning"
      );
      return;
    }
    try {
      const result = await generateAiStory({
        userStoryTitle,
        description,
        acceptanceCriteria,
        testingScenarios,
      }).unwrap();
      setGeneratedStoryContent(result.aiEnhancedText);
      showSnackbar("AI content generated successfully!");
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to generate AI content.",
        "error"
      );
    }
  };

  const handleGenerateSalesforceCode = async () => {
    const storyToGenerate = selectedStory;
    if (!storyToGenerate?._id) {
      showSnackbar("Please select a user story first.", "warning");
      return;
    }
    if (!projectGithubRepoUrl) {
      showSnackbar(
        "Project GitHub repository URL is not configured. Please update project settings.",
        "error"
      );
      return;
    }

    setIsGeneratingCodeProcess(true);
    setActiveGenerationStoryId(storyToGenerate._id);
    setCompletedGenerationSteps([]);
    setCurrentGenerationStatus("AI code generation initiated...");
    setGenerationError(null);
    setGithubResult(null);

    setCompletedGenerationSteps([
      { message: "AI code generation initiated..." },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-stories/${storyToGenerate._id}/generate-salesforce-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            projectId,
            githubRepoUrl: projectGithubRepoUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setGenerationError(
          errorData.message ||
            "An unknown error occurred during generation setup."
        );
        setCurrentGenerationStatus("Failed to start.");
        showSnackbar(
          errorData.message || "Failed to start code generation.",
          "error"
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lastIndex = 0;
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n\n", lastIndex)) !== -1) {
          const eventString = buffer.substring(lastIndex, newlineIndex);
          lastIndex = newlineIndex + 2;

          if (eventString.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(eventString.substring(6));

              setCompletedGenerationSteps((prev) => {
                if (
                  prev.length === 0 ||
                  prev[prev.length - 1]?.message !== eventData.message
                ) {
                  return [...prev, { message: eventData.message }];
                }
                return prev;
              });

              setCurrentGenerationStatus(eventData.message);

              if (eventData.type === "complete") {
                setGithubResult(eventData);
                showSnackbar(
                  "Salesforce code generated and PR created successfully!",
                  "success"
                );
                refetchUserStories();
                setSelectedStory((prev) => ({
                  ...prev,
                  githubBranch: eventData.githubBranch,
                  prUrl: eventData.prUrl,
                  status: "AI DEVELOPED",
                }));
              } else if (eventData.type === "error") {
                setGenerationError(eventData.message);
                setCurrentGenerationStatus("Process failed.");
                showSnackbar(eventData.message, "error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
        buffer = buffer.substring(lastIndex);
      }
    } catch (err) {
      console.error("Fetch error during Salesforce code generation:", err);
      setGenerationError(
        err.message || "Network error during code generation."
      );
      setCurrentGenerationStatus("Failed to connect or stream.");
      showSnackbar(
        err.message || "Network error during code generation.",
        "error"
      );
    } finally {
      setTimeout(() => {
        setIsGeneratingCodeProcess(false);
        setActiveGenerationStoryId(null);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    const storyData = {
      userStoryTitle,
      description,
      acceptanceCriteria,
      testingScenarios,
      collaboratorGithubIds: selectedCollaboratorGithubIds,
      aiEnhancedUserStory: generatedStoryContent,
      status: storyStatus,
      priority: storyPriority,
      estimatedTime: estimatedTime,
    };

    try {
      if (selectedStory && activePanel === "edit") {
        await updateUserStory({
          userStoryId: selectedStory._id,
          ...storyData,
        }).unwrap();
        showSnackbar("User story updated successfully!");
      } else {
        await createUserStory({ projectId, ...storyData }).unwrap();
        showSnackbar("User story created successfully!");
      }
      resetForm();
      refetchUserStories();
      setActivePanel("list");
    } catch (err) {
      showSnackbar(err.data?.message || "An error occurred.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserStory(storyToDelete._id).unwrap();
      showSnackbar("User story deleted successfully!");
      handleCloseDialogs();
      refetchUserStories();
      setActivePanel("list");
      setSelectedStory(null);
    } catch (err) {
      showSnackbar(
        err.data?.message || "Failed to delete user story.",
        "error"
      );
    }
  };

  const allUserStories =
    userRole === "developer"
      ? developerUserStories
      : userStoriesData?.userStories || [];

  const filteredUserStories = useMemo(() => {
    return allUserStories.filter((story) => {
      const matchesSearch = story.userStoryTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCompletedStatus = showCompleted
        ? story.status === "COMPLETED"
        : story.status !== "COMPLETED";
      return matchesSearch && matchesCompletedStatus;
    });
  }, [allUserStories, searchTerm, showCompleted]);

  filteredUserStories.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const theme = useTheme();

  // Render function for the story creation/edit form
  const renderStoryForm = () => (
    <GlassCard
      sx={{
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {activePanel === "edit" ? "Edit User Story" : "Create New User Story"}
      </Typography>

      <TextField
        fullWidth
        label="User Story Title"
        value={userStoryTitle}
        onChange={(e) => setUserStoryTitle(e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Acceptance Criteria"
        value={acceptanceCriteria}
        onChange={(e) => setAcceptanceCriteria(e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Testing Scenarios"
        value={testingScenarios}
        onChange={(e) => setTestingScenarios(e.target.value)}
      />

      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={storyStatus}
          label="Status"
          onChange={(e) => setStoryStatus(e.target.value)}
        >
          <MenuItem value="PLANNING">Planning</MenuItem>
          <MenuItem value="IN REVIEW">In Review</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="AI DEVELOPED">AI Developed</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Priority</InputLabel>
        <Select
          value={storyPriority}
          label="Priority"
          onChange={(e) => setStoryPriority(e.target.value)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Estimated Time (e.g., 8h, 2d)"
        value={estimatedTime}
        onChange={(e) => setEstimatedTime(e.target.value)}
      />

      {/* COLLABORATORS */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Assign Collaborators
        </Typography>
        {collaboratorsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            {collaboratorsData?.collaborators.map((c) => (
              <FormControlLabel
                key={c.githubId}
                control={
                  <Checkbox
                    checked={selectedCollaboratorGithubIds.includes(c.githubId)}
                    onChange={handleCollaboratorChange}
                    value={c.githubId}
                    sx={{
                      color: theme.palette.text.secondary,
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={c.avatarUrl} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2" color="text.primary">
                      {c.username}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        )}
      </Box>

      {/* GENERATE AI STORY */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleGenerateStory}
          disabled={isGenerating}
          startIcon={<AutoFixHighIcon />}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
          }}
        >
          {isGenerating
            ? "Generating..."
            : selectedStory
            ? "Regenerate with AI"
            : "Enhance with AI"}
        </Button>
      </Box>

      {generatedStoryContent && (
        <AIContentBox>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {generatedStoryContent}
          </Typography>
        </AIContentBox>
      )}

      {/* FINAL ACTION BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        <Button onClick={() => setActivePanel("list")} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (
            <CircularProgress size={24} color="inherit" />
          ) : activePanel === "edit" ? (
            "Save Changes"
          ) : (
            "Create Story"
          )}
        </Button>
      </Box>
    </GlassCard>
  );

  // Render function for the story detail view
  const renderStoryDetail = () => (
    <GlassCard
      sx={{
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          onClick={() => setActivePanel("list")}
          sx={{ color: theme.palette.text.secondary }}
        >
          <ChevronLeftIcon />
        </IconButton>
        {canManageStories && selectedStory && (
          <Box>
            <IconButton
              onClick={() => handleOpenEditForm(selectedStory)}
              color="text.primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleOpenDeleteDialog(selectedStory)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        )}
      </Box>

      {selectedStory ? (
        <>
          <Typography
            variant="h4"
            gutterBottom
            mt={2}
            color="text.primary"
            sx={{
              fontWeight: 800,
              fontSize: "2.2rem",
              lineHeight: 1.2,
            }}
          >
            {selectedStory.userStoryTitle}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{ fontStyle: "italic" }}
          >
            Story #{selectedStory._id.substring(selectedStory._id.length - 4)}
          </Typography>

          <Grid container spacing={2} mb={2}>
            <Grid item>
              <Chip
                label={`Priority: ${selectedStory.priority}`}
                color={
                  selectedStory.priority === "High"
                    ? "error"
                    : selectedStory.priority === "Medium"
                    ? "warning"
                    : "success"
                }
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Status: ${selectedStory.status}`}
                color={
                  selectedStory.status === "COMPLETED"
                    ? "success"
                    : selectedStory.status === "AI DEVELOPED"
                    ? "secondary"
                    : selectedStory.status === "IN REVIEW"
                    ? "warning"
                    : "info"
                }
              />
            </Grid>
            <Grid item>
              <Chip label={`Estimated: ${selectedStory.estimatedTime}`} />
            </Grid>
            <Grid item>
              <Chip
                label={`Created: ${new Date(
                  selectedStory.createdAt
                ).toLocaleDateString()}`}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <TruncatedText
            content={selectedStory.description}
            title="Description"
          />
          <TruncatedText
            content={selectedStory.acceptanceCriteria}
            title="Acceptance Criteria"
          />
          <TruncatedText
            content={selectedStory.testingScenarios}
            title="Testing Scenarios"
          />

          {selectedStory.aiEnhancedUserStory && (
            <AIContentBox>
              <Typography
                variant="subtitle2"
                color="text.primary"
                fontWeight={600}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&::before": {
                    content: '""',
                    display: "inline-block",
                    width: "4px",
                    height: "16px",
                    backgroundColor: theme.palette.secondary.main,
                    marginRight: "8px",
                    borderRadius: "2px",
                  },
                }}
              >
                AI ENHANCED SUGGESTIONS
              </Typography>
              <TruncatedText
                content={selectedStory.aiEnhancedUserStory}
                maxLines={5}
              />
            </AIContentBox>
          )}

          {(selectedStory.githubBranch || selectedStory.prUrl) && (
            <Box
              mt={2}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.custom?.innerShadow,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "black" }}
                fontWeight={600}
                mb={1}
              >
                GitHub Details:
              </Typography>
              {selectedStory.githubBranch && (
                <Typography variant="body2" sx={{ color: "black" }}>
                  Branch:{" "}
                  <a
                    href={`${projectGithubRepoUrl}/tree/${selectedStory.githubBranch}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    {selectedStory.githubBranch}
                  </a>
                </Typography>
              )}
              {selectedStory.prUrl && (
                <Typography variant="body2" sx={{ color: "black" }}>
                  Pull Request:{" "}
                  <a
                    href={selectedStory.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    }}
                  >
                    View PR
                  </a>
                </Typography>
              )}
            </Box>
          )}

          {selectedStory.collaborators &&
            selectedStory.collaborators.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned Collaborators:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedStory.collaborators.map((c) => (
                    <Chip
                      key={c.githubId}
                      avatar={<Avatar src={c.avatarUrl} />}
                      label={c.username}
                      size="small"
                      color="text.primary"
                      sx={{
                        backgroundColor: theme.palette.action.selected,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

          <Box sx={{ mt: "auto", pt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateSalesforceCode}
              disabled={isGeneratingCodeProcess || !projectGithubRepoUrl}
              startIcon={
                isGeneratingCodeProcess &&
                activeGenerationStoryId === selectedStory._id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutoFixHighIcon />
                )
              }
              sx={{
                py: 1.5,
                borderRadius: "12px",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 15px rgba(128, 176, 255, 0.5)"
                    : "0 0 15px rgba(94, 114, 228, 0.3)",
              }}
            >
              {isGeneratingCodeProcess &&
              activeGenerationStoryId === selectedStory._id
                ? "Generating Code..."
                : "Generate Salesforce Code"}
            </Button>
          </Box>
        </>
      ) : (
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          mt={5}
        >
          Select a story from the left sidebar or create a new one.
        </Typography>
      )}
    </GlassCard>
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          backgroundColor: currentTheme.palette.background.default,
          color: currentTheme.palette.text.primary,
          overflowX: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              currentTheme.palette.mode === "dark"
                ? "radial-gradient(circle at 20% 30%, rgba(128, 176, 255, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(224, 176, 255, 0.1) 0%, transparent 30%)"
                : "radial-gradient(circle at 20% 30%, rgba(94, 114, 228, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(17, 205, 239, 0.1) 0%, transparent 30%)",
            zIndex: 0,
          },
        }}
      >
        {/* Left Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", sm: 350 },
            flexShrink: 0,
            borderRight: `1px solid ${currentTheme.palette.divider}`,
            backgroundColor: currentTheme.palette.background.paper,
            p: 3,
            display:
              activePanel === "list" ? "flex" : { xs: "none", sm: "flex" },
            flexDirection: "column",
            overflowY: "auto",
            boxShadow:
              currentTheme.palette.mode === "dark"
                ? "5px 0 15px rgba(0,0,0,0.5)"
                : "5px 0 15px rgba(0,0,0,0.1)",
            zIndex: 1,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                currentTheme.palette.mode === "dark"
                  ? "linear-gradient(45deg, rgba(128,176,255,0.05) 0%, transparent 50%, rgba(224,176,255,0.05) 100%)"
                  : "linear-gradient(45deg, rgba(94,114,228,0.05) 0%, transparent 50%, rgba(17,205,239,0.05) 100%)",
              opacity: 0.3,
              zIndex: -1,
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" component="h2" fontWeight={700}>
              User Stories
            </Typography>
            {canManageStories && (
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenCreateForm}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "12px",
                }}
              >
                New
              </Button>
            )}
          </Box>

          <TextField
            fullWidth
            label="Search stories..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <SearchIcon
                  sx={{ mr: 1, color: currentTheme.palette.text.secondary }}
                />
              ),
              sx: {
                borderRadius: "25px",
                paddingLeft: "12px",
                backgroundColor:
                  currentTheme.palette.mode === "dark" ? "#1a1a1a" : "#ffffff",
                boxShadow: currentTheme.palette.custom.innerShadow,
                "& fieldset": { border: "none" },
              },
            }}
            InputLabelProps={{
              sx: { color: currentTheme.palette.text.secondary },
            }}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              boxShadow:
                "rgba(0, 0, 0, 0.09) 0px 2px 1px, " +
                "rgba(0, 0, 0, 0.09) 0px 4px 2px, " +
                "rgba(0, 0, 0, 0.09) 0px 8px 4px, " +
                "rgba(0, 0, 0, 0.09) 0px 16px 8px, " +
                "rgba(0, 0, 0, 0.09) 0px 32px 16px",
              p: 2,
              borderRadius: 2,
              mb: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : "white",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.primary">
                  Show Completed
                </Typography>
              }
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {storiesLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : filteredUserStories.length === 0 ? (
            <Box textAlign="center" py={2}>
              <Typography color="text.secondary" variant="body2">
                No user stories found.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: "auto" }}>
              {filteredUserStories.map((story) => (
                <StoryCard
                  key={story._id}
                  storyStatus={story.status}
                  onClick={() => handleViewStory(story)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedStory?._id === story._id
                        ? currentTheme.palette.action.selected
                        : currentTheme.palette.background.paper,
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={0.5}
                    >
                      <Typography variant="body1" fontWeight={600} flexGrow={1}>
                        {story.userStoryTitle}
                      </Typography>
                      {story.status === "AI DEVELOPED" && (
                        <Chip
                          label="AI DEVELOPED"
                          color="secondary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      variant="caption"
                      color="text.secondary"
                      mt={0.5}
                    >
                      <Typography variant="caption">
                        {story.collaborators?.[0]?.username || "Unassigned"}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon
                          sx={{
                            fontSize: "0.9rem",
                            mr: 0.5,
                            color: currentTheme.palette.text.secondary,
                          }}
                        />
                        <Typography variant="caption">
                          {story.estimatedTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Box mt={1}>
                      <Chip
                        label={story.status}
                        size="small"
                        className="status-chip"
                      />
                      <Chip
                        label={`Priority: ${story.priority}`}
                        size="small"
                        sx={{ ml: 1 }}
                        color={
                          story.priority === "High"
                            ? "error"
                            : story.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                      />
                    </Box>
                  </CardContent>
                </StoryCard>
              ))}
            </Stack>
          )}
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "transparent",
            overflowY: "auto",
            display:
              activePanel !== "list" ? "flex" : { xs: "none", sm: "flex" },
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          {activePanel === "create" || activePanel === "edit"
            ? renderStoryForm()
            : renderStoryDetail()}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDialogs}
          maxWidth="xs"
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: currentTheme.palette.background.paper,
              color: currentTheme.palette.text.primary,
              borderRadius: "20px",
              boxShadow: currentTheme.palette.custom.depthShadow,
              border: `1px solid ${currentTheme.palette.divider}`,
              transformStyle: "preserve-3d",
            },
          }}
        >
          <DialogTitle
            sx={{ color: currentTheme.palette.text.primary, fontWeight: 700 }}
          >
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: currentTheme.palette.text.secondary }}>
              Are you sure you want to delete the story "
              <strong>{storyToDelete?.userStoryTitle}</strong>"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleCloseDialogs}
              variant="outlined"
              sx={{ color: currentTheme.palette.text.primary }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Advanced Code Generation Loading Dialog */}
        <LoadingDialog
          open={
            isGeneratingCodeProcess &&
            activeGenerationStoryId === selectedStory?._id
          }
          onClose={(event, reason) => {
            if (reason === "escapeKeyDown" || reason === "backdropClick") {
              showSnackbar(
                "Code generation is in progress. Please use the 'Close' button.",
                "info"
              );
              return;
            }
            handleCloseDialogs();
          }}
          aria-labelledby="loading-dialog-title"
        >
          <DialogTitle
            id="loading-dialog-title"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {generationError
              ? "Code Generation Failed"
              : "AI Code Generation Progress"}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {!generationError && !githubResult ? (
              <>
                <AnimatedIcon>
                  <AutoFixHighIcon sx={{ fontSize: "inherit" }} />
                </AnimatedIcon>
                <StatusMessage>{currentGenerationStatus}</StatusMessage>
                <LinearProgress
                  color="primary"
                  sx={{
                    my: 2,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#3a3a3a"
                        : "rgba(0,0,0,0.1)",
                  }}
                />
              </>
            ) : (
              <>
                {generationError ? (
                  <Box>
                    <Typography color="error" variant="h6" mb={2}>
                      Error: {generationError}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Please check the backend logs for more details or try
                      again.
                    </Typography>
                  </Box>
                ) : (
                  githubResult && (
                    <Box>
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: "4rem",
                          color: "success.main",
                          mb: 2,
                          animation: `${pulse} 1.5s infinite`,
                          filter:
                            "drop-shadow(0 0 5px rgba(45, 206, 137, 0.5))",
                        }}
                      />
                      <Typography color="success.main" variant="h6" mb={1}>
                        Process Completed Successfully!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mb={2}>
                        Your Salesforce code has been generated and pushed to
                        GitHub.
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Branch:{" "}
                          <a
                            href={
                              githubResult.githubRepoUrl +
                              "/tree/" +
                              githubResult.githubBranch
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: currentTheme.palette.secondary.main,
                              textDecoration: "underline",
                            }}
                          >
                            {githubResult.githubBranch}
                          </a>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pull Request:{" "}
                          <a
                            href={githubResult.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: currentTheme.palette.secondary.main,
                              textDecoration: "underline",
                            }}
                          >
                            View PR
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}

            <CompletedStepsList>
              {completedGenerationSteps.map((step, index) => (
                <CompletedStepItem key={index}>
                  <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
                  {step.message}
                </CompletedStepItem>
              ))}
            </CompletedStepsList>
          </DialogContent>
          <DialogActions sx={{ p: "16px 24px" }}>
            <Button
              onClick={handleCloseDialogs}
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </LoadingDialog>

        {/* Snackbar for notifications */}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default UserStoryPage;
