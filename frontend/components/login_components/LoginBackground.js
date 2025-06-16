import { Box } from "@mui/material";

export default function LoginBackground({ children }) {
  return (
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
      {children}
    </Box>
  );
} 