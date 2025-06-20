import { Box, Typography, Slide } from "@mui/material";

export default function LoginHeader({ isMobile }) {
  return (
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
            src="/logo.png"
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
      </Box>
    </Slide>
  );
} 