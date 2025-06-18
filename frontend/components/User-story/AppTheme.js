// components/AppTheme.jsx
import React, { useMemo, useEffect } from "react";
import { ThemeProvider, createTheme, keyframes } from "@mui/material/styles";

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

/**
 * Creates and provides a custom Material-UI theme based on the given mode ('light' or 'dark').
 * Includes custom palette, typography, and component style overrides with 3D and modern effects.
 *
 * @param {string} mode - The theme mode ('light' or 'dark').
 * @returns {object} The Material-UI theme object.
 */
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

/**
 * Provides a Material-UI theme context to its children.
 * It also manages the 'dark' class on the document's root element based on the theme mode.
 *
 * @param {object} props - The component props.
 * @param {string} props.themeMode - The theme mode ('light' or 'dark').
 * @param {boolean} props.isThemeLoading - Loading state for theme data.
 * @param {boolean} props.isThemeError - Error state for theme data.
 * @param {React.ReactNode} props.children - The child components to be rendered within the theme context.
 */
const AppTheme = ({ themeMode, isThemeLoading, isThemeError, children }) => {
  // Memoize the theme creation to prevent unnecessary re-renders
  const currentTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  // Effect to toggle 'dark' class on documentElement for global theme styling
  useEffect(() => {
    if (!isThemeLoading && !isThemeError && themeMode) {
      document.documentElement.classList.toggle("dark", themeMode === "dark");
    }
  }, [themeMode, isThemeLoading, isThemeError]);

  return <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>;
};

export default AppTheme;
