import { Box, Paper, Typography, Fade } from "@mui/material";
import { AutoAwesome, Code, Speed, Security } from "@mui/icons-material";

const features = [
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
];

export default function SignupFeatures() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 3,
        maxWidth: 500,
        mx: "auto",
      }}
    >
      {features.map((feature, index) => (
        <Fade in={true} key={index} timeout={1000 + index * 200}>
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
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
  );
} 