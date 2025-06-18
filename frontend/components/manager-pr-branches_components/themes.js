import { createTheme } from "@mui/material/styles";

// Futuristic Light Theme
export const futuristicLightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3E63DD", // A vibrant, futuristic blue
      light: "#7986FA",
      dark: "#2A4AB0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00C49F", // A cool teal/mint
      light: "#66FFC2",
      dark: "#008C73",
      contrastText: "#000000",
    },
    background: {
      default: "#F4F7F9", // Very light grey, almost white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50", // Dark grey, not quite black
      secondary: "#566573", // Lighter grey
      disabled: "#AEB6BF",
    },
    error: { main: "#E74C3C" }, // Softer red
    warning: { main: "#F39C12" }, // Softer orange
    success: { main: "#2ECC71" }, // Softer green
    info: { main: "#3498DB" }, // Softer blue for info
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 700,
      fontSize: "1.65rem", // Slightly reduced for modern feel
      lineHeight: 1.3,
      color: "#2C3E50",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.15rem", // Slightly reduced
      lineHeight: 1.4,
      color: "#2C3E50",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    body1: {
      color: "#2C3E50",
    },
    body2: {
      color: "#566573",
    },
  },
  shape: {
    borderRadius: 10, // More rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 20px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#2A4AB0",
          },
        },
        outlinedPrimary: {
          borderColor: "#3E63DD",
          "&:hover": {
            backgroundColor: "rgba(62, 99, 221, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(100, 120, 150, 0.08)", // Softer, more diffused shadow
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #E0E6ED",
          backgroundColor: "#FFFFFF",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8F9FA", // Lighter header
            borderBottom: "1px solid #E0E6ED",
            color: "#3E63DD", // Primary color for header text
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "uppercase",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #F0F2F5", // Lighter cell borders
            fontSize: "0.875rem",
            "&:focus": {
              outline: "none", // Remove default focus outline
            },
            "&:focus-within": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "rgba(62, 99, 221, 0.04)", // Subtle hover
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(62, 99, 221, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(62, 99, 221, 0.1)",
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #E0E6ED",
          },
          "& .MuiDataGrid-iconButtonContainer": {
            "& .MuiIconButton-root": {
              color: "#566573", // Neutral color for icons
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16, // More prominent rounding for dialogs
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8F9FA",
          color: "#3E63DD",
          fontWeight: 700,
          fontSize: "1.25rem",
          padding: "16px 24px",
          borderBottom: "1px solid #E0E6ED",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #E0E6ED",
          padding: "16px 24px",
          backgroundColor: "#FDFEFE",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined", // Default to outlined for a modern look
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8, // Rounded fields
            backgroundColor: "rgba(255,255,255, 0.5)", // Slight transparency if needed over a bg
            "& fieldset": {
              borderColor: "#CFD8DC", // Softer border color
            },
            "&:hover fieldset": {
              borderColor: "#B0BEC5",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3E63DD", // Primary color for focus
              boxShadow: "0 0 0 2px rgba(62, 99, 221, 0.2)", // Focus ring
            },
          },
          "& .MuiInputLabel-root": {
            color: "#566573",
            fontWeight: 500,
            "&.Mui-focused": {
              color: "#3E63DD",
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255, 0.5)",
          "& fieldset": {
            borderColor: "#CFD8DC",
          },
          "&:hover fieldset": {
            borderColor: "#B0BEC5",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#3E63DD",
            boxShadow: "0 0 0 2px rgba(62, 99, 221, 0.2)",
          },
        },
        icon: {
          color: "#3E63DD", // Color for the dropdown arrow
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: "4px 8px",
          backgroundColor: "rgba(62, 99, 221, 0.1)", // Primary light background
          color: "#2A4AB0", // Primary dark text
        },
        avatar: {
          marginLeft: "2px !important",
          marginRight: "-2px !important",
          width: "20px !important",
          height: "20px !important",
        },
        labelSmall: {
          fontSize: "0.75rem",
        },
        sizeSmall: {
          height: "24px",
          padding: "0 8px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2C3E50", // Dark tooltip for contrast
          color: "#FFFFFF",
          borderRadius: 6,
          fontSize: "0.8rem",
          padding: "6px 10px",
        },
        arrow: {
          color: "#2C3E50",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px", // Adjust padding
          alignItems: "center", // Vertically align icon and text
        },
        standardSuccess: {
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          color: "#1D8348",
          "& .MuiAlert-icon": { color: "#2ECC71" },
        },
        standardError: {
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          color: "#B03A2E",
          "& .MuiAlert-icon": { color: "#E74C3C" },
        },
        standardWarning: {
          backgroundColor: "rgba(243, 156, 18, 0.1)",
          color: "#AF640D",
          "& .MuiAlert-icon": { color: "#F39C12" },
        },
        standardInfo: {
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          color: "#21618C",
          "& .MuiAlert-icon": { color: "#3498DB" },
        },
        icon: {
          marginRight: 12, // More space between icon and text
          fontSize: 22, // Slightly larger icons
        },
      },
    },
  },
});

// Futuristic Dark Theme
export const futuristicDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7986FA",
      light: "#AAB6FE",
      dark: "#3E63DD",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00C49F",
      light: "#66FFC2",
      dark: "#008C73",
      contrastText: "#000000",
    },
    background: {
      default: "#181A20",
      paper: "#23263A",
    },
    text: {
      primary: "#F4F7F9",
      secondary: "#B0BEC5",
      disabled: "#6C757D",
    },
    error: { main: "#E57373" },
    warning: { main: "#FFB74D" },
    success: { main: "#81C784" },
    info: { main: "#64B5F6" },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 700,
      fontSize: "1.65rem",
      lineHeight: 1.3,
      color: "#F4F7F9",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.15rem",
      lineHeight: 1.4,
      color: "#F4F7F9",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    body1: {
      color: "#F4F7F9",
    },
    body2: {
      color: "#B0BEC5",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "8px 20px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#2A4AB0",
          },
        },
        outlinedPrimary: {
          borderColor: "#3E63DD",
          "&:hover": {
            backgroundColor: "rgba(62, 99, 221, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(100, 120, 150, 0.08)", // Softer, more diffused shadow
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #E0E6ED",
          backgroundColor: "#FFFFFF",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8F9FA", // Lighter header
            borderBottom: "1px solid #E0E6ED",
            color: "#3E63DD", // Primary color for header text
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "uppercase",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #F0F2F5", // Lighter cell borders
            fontSize: "0.875rem",
            "&:focus": {
              outline: "none", // Remove default focus outline
            },
            "&:focus-within": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "rgba(62, 99, 221, 0.04)", // Subtle hover
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(62, 99, 221, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(62, 99, 221, 0.1)",
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #E0E6ED",
          },
          "& .MuiDataGrid-iconButtonContainer": {
            "& .MuiIconButton-root": {
              color: "#566573", // Neutral color for icons
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#23263A",
          color: "#F4F7F9",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#23263A",
          color: "#AAB6FE",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#23263A",
          color: "#F4F7F9",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1C1E2A",
            color: "#F4F7F9",
            "& fieldset": {
              borderColor: "#35384A",
            },
            "&:hover fieldset": {
              borderColor: "#7986FA",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#AAB6FE",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#AAB6FE",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#1C1E2A",
          color: "#F4F7F9",
          "& fieldset": {
            borderColor: "#35384A",
          },
          "&:hover fieldset": {
            borderColor: "#7986FA",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#AAB6FE",
          },
        },
        icon: {
          color: "#AAB6FE",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: "4px 8px",
          backgroundColor: "rgba(62, 99, 221, 0.1)", // Primary light background
          color: "#2A4AB0", // Primary dark text
        },
        avatar: {
          marginLeft: "2px !important",
          marginRight: "-2px !important",
          width: "20px !important",
          height: "20px !important",
        },
        labelSmall: {
          fontSize: "0.75rem",
        },
        sizeSmall: {
          height: "24px",
          padding: "0 8px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2C3E50", // Dark tooltip for contrast
          color: "#FFFFFF",
          borderRadius: 6,
          fontSize: "0.8rem",
          padding: "6px 10px",
        },
        arrow: {
          color: "#2C3E50",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px", // Adjust padding
          alignItems: "center", // Vertically align icon and text
        },
        standardSuccess: {
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          color: "#1D8348",
          "& .MuiAlert-icon": { color: "#2ECC71" },
        },
        standardError: {
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          color: "#B03A2E",
          "& .MuiAlert-icon": { color: "#E74C3C" },
        },
        standardWarning: {
          backgroundColor: "rgba(243, 156, 18, 0.1)",
          color: "#AF640D",
          "& .MuiAlert-icon": { color: "#F39C12" },
        },
        standardInfo: {
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          color: "#21618C",
          "& .MuiAlert-icon": { color: "#3498DB" },
        },
        icon: {
          marginRight: 12, // More space between icon and text
          fontSize: 22, // Slightly larger icons
        },
      },
    },
  },
}); 