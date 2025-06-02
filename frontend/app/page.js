"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Paper,
  Link as MUILink,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles"; // alpha can be used directly
import NextLink from "next/link";

// Icons (make sure to install @mui/icons-material)
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useRouter } from "next/navigation";

// --- Hardcoded Theme Values (Dark Theme Focus) ---
const FONT_FAMILY = "Inter, sans-serif"; // Example font

// Palette
const PALETTE = {
  common: {
    black: "#000",
    white: "#fff",
  },
  primary: {
    main: "#64B5F6", // A vibrant blue
    light: "#90CAF9",
    dark: "#2196F3",
  },
  secondary: {
    main: "#F48FB1", // A vibrant pink
    light: "#F8BBD0",
    dark: "#E91E63",
  },
  background: {
    default: "#121212", // Dark background
    paper: "#1e1e1e", // Slightly lighter for paper elements
  },
  text: {
    primary: "#ffffff",
    secondary: "#e0e0e0", // Lighter grey for secondary text
    disabled: "#757575",
  },
  divider: alpha("#ffffff", 0.12),
  error: {
    main: "#f44336",
  },
};

// Spacing (assuming 8px unit)
const SPACING_UNIT = 8;
const spacing = (multiplier) => `${multiplier * SPACING_UNIT}px`;

// Shape
const SHAPE = {
  borderRadius: 8, // Default border radius
};

// Shadows (example static shadows, MUI has a more complex array)
const SHADOWS = [
  "none",
  "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)", // elevation 1
  "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)", // elevation 2
  "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)", // elevation 3 (FeatureCard uses this)
  // ... up to 24, hardcoding a few for simplicity
  "0px 4px 12px rgba(0,0,0,0.2)", // A custom shadow for hover
  "0px 8px 16px rgba(0,0,0,0.25)", // Another custom shadow for hover
  "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)", // elevation 6 (FeatureCard shadow)
  "0px 6px 10px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)", // elevation 12 (FeatureCard hover)
];

// Styled Components
const HeroSection = styled(Box)({
  minHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: `${spacing(6)} ${spacing(2)}`,
  background: `linear-gradient(135deg, #1e2a38 0%, #3f51b5 100%)`,
  color: PALETTE.common.white,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    zIndex: 0,
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
});

const FeatureCard = styled(Paper)({
  padding: spacing(4),
  textAlign: "center",
  height: "100%",
  borderRadius: SHAPE.borderRadius * 2,
  backgroundColor: alpha(PALETTE.background.paper, 0.85), // Slightly more opaque
  backdropFilter: "blur(8px)",
  boxShadow: SHADOWS[6],
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: SHADOWS[12],
  },
});

const Section = styled(Box)({
  padding: `${spacing(8)} ${spacing(2)}`,
  backgroundColor: PALETTE.background.default,
});

const StyledAppBar = styled(AppBar)({
  backgroundColor: alpha(PALETTE.background.paper, 0.75), // Darker paper for AppBar
  backdropFilter: "blur(10px)",
  boxShadow: "none",
  borderBottom: `1px solid ${alpha(PALETTE.divider, 0.5)}`, // More subtle divider
});

const LogoText = styled(Typography)({
  fontWeight: "bold",
  letterSpacing: "1px",
  background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: FONT_FAMILY,
});

export default function MainPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Redirect to login page
    router.push("/login");
  };
  const handleSignup = () => {
    // Redirect to signup page
    router.push("/signup");
  };
  const managerFeatures = [
    {
      icon: (
        <AccountTreeIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main }}
        />
      ),
      title: "Project Creation & GitHub Sync",
      description:
        "Effortlessly create projects and link or create new GitHub repositories directly within GitGPT.",
    },
    {
      icon: (
        <GroupsIcon fontSize="large" sx={{ color: PALETTE.primary.main }} />
      ),
      title: "Collaborator Management",
      description:
        "Invite Developers/BAs, assign roles, and manage permissions seamlessly from the project details page.",
    },
    {
      icon: (
        <AssignmentIcon fontSize="large" sx={{ color: PALETTE.primary.main }} />
      ),
      title: "AI-Powered User Stories",
      description:
        "Craft, enhance, or generate user stories with AI assistance. Assign tasks to developers and track progress.",
    },
    {
      icon: (
        <AnalyticsIcon fontSize="large" sx={{ color: PALETTE.primary.main }} />
      ),
      title: "Intelligent Code Analysis",
      description:
        "Leverage AI to understand your codebase, ask questions, generate code snippets, and push changes to GitHub.",
    },
    {
      icon: (
        <DescriptionIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main }}
        />
      ),
      title: "Smart Documentation",
      description:
        "Upload existing project documents or use AI to generate comprehensive documentation from project descriptions.",
    },
  ];

  const devBaFeatures = [
    {
      icon: (
        <DashboardIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main }}
        />
      ),
      title: "Centralized Dashboard",
      description:
        "View and accept collaboration requests. Access all your active projects from a unified working dashboard.",
    },
    {
      icon: (
        <CodeIcon fontSize="large" sx={{ color: PALETTE.secondary.main }} />
      ),
      title: "Permitted Feature Access",
      description:
        "Utilize powerful features like AI-assisted PR generation and review, based on manager-defined permissions.",
    },
    {
      icon: (
        <AssignmentIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main }}
        />
      ),
      title: "Assigned User Stories",
      description:
        "Clearly see user stories assigned to you by the manager, enabling focused development efforts.",
    },
    {
      icon: (
        <NotificationsIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main }}
        />
      ),
      title: "Real-time Notifications",
      description:
        "Stay updated with important project events, assignments, and communications through integrated notifications.",
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: PALETTE.background.default,
        color: PALETTE.text.primary,
        fontFamily: FONT_FAMILY,
      }}
    >
      <StyledAppBar position="fixed">
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <NextLink href="/" passHref>
              <MUILink
                sx={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <GitHubIcon
                  sx={{
                    mr: 1.5,
                    fontSize: "2rem",
                    color: PALETTE.common.white,
                  }}
                />
                <LogoText variant="h5" component="h1">
                  GitGPT
                </LogoText>
              </MUILink>
            </NextLink>
            <Box>
              <NextLink href="/login" passHref>
                <Button
                  variant="outlined"
                  sx={{
                    mr: 1.5,
                    borderColor: alpha(PALETTE.common.white, 0.5),
                    color: PALETTE.common.white,
                    fontFamily: FONT_FAMILY,
                    "&:hover": {
                      borderColor: PALETTE.common.white,
                      backgroundColor: alpha(PALETTE.common.white, 0.08),
                    },
                  }}
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </NextLink>
              <NextLink href="/signup" passHref>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: PALETTE.secondary.main,
                    fontFamily: FONT_FAMILY,
                    boxShadow: `0 4px 15px 0 ${alpha(
                      PALETTE.secondary.main,
                      0.4
                    )}`,
                    "&:hover": { backgroundColor: PALETTE.secondary.dark },
                  }}
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </NextLink>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <HeroSection>
        <Container maxWidth="md">
          <AutoAwesomeIcon sx={{ fontSize: "4rem", mb: 2, color: "#FFD700" }} />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              letterSpacing: "-1px",
              fontFamily: FONT_FAMILY,
            }}
          >
            GitGPT: Intelligent Project Management, Reimagined.
          </Typography>
          <Typography
            variant="h5"
            component="p"
            paragraph
            sx={{ mb: 4, opacity: 0.9, fontFamily: FONT_FAMILY }}
          >
            Streamline your development lifecycle with AI-powered tools for
            managers and developers. From user story creation to code analysis
            and documentation, GitGPT integrates seamlessly with GitHub to boost
            productivity.
          </Typography>
          <NextLink href="/signup" passHref>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                padding: "12px 30px",
                fontSize: "1.1rem",
                borderRadius: "50px",
                backgroundColor: PALETTE.secondary.main,
                fontFamily: FONT_FAMILY,
                boxShadow: `0 6px 20px 0 ${alpha(PALETTE.secondary.main, 0.5)}`,
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: PALETTE.secondary.dark,
                },
              }}
            >
              Get Started Free
            </Button>
          </NextLink>
        </Container>
      </HeroSection>

      <Section>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: "bold", mb: 6, fontFamily: FONT_FAMILY }}
          >
            For <span style={{ color: PALETTE.primary.main }}>Managers</span>:
            Command Your Projects with AI
          </Typography>
          <Grid container spacing={4}>
            {managerFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: "600",
                      fontFamily: FONT_FAMILY,
                      color: PALETTE.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: PALETTE.text.secondary,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
          backgroundColor: PALETTE.background.default,
        }}
      >
        <Box
          sx={{
            width: "50%",
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${PALETTE.divider}, transparent)`,
          }}
        />
      </Box>

      <Section
        sx={{
          backgroundColor:
            PALETTE.background.paper /* Different bg for contrast */,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: "bold", mb: 6, fontFamily: FONT_FAMILY }}
          >
            For{" "}
            <span style={{ color: PALETTE.secondary.main }}>
              Developers & BAs
            </span>
            : Accelerate Your Workflow
          </Typography>
          <Grid container spacing={4}>
            {devBaFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: "600",
                      fontFamily: FONT_FAMILY,
                      color: PALETTE.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: PALETTE.text.secondary,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      <Box
        sx={{
          py: 8,
          textAlign: "center",
          backgroundColor: "#1e2a38" /* Darker accent from hero */,
          color: PALETTE.common.white,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", fontFamily: FONT_FAMILY }}
          >
            Ready to Transform Your Git Workflow?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            paragraph
            sx={{ mb: 4, opacity: 0.8, fontFamily: FONT_FAMILY }}
          >
            Join GitGPT today and experience the future of project management
            and development, supercharged by AI.
          </Typography>
          <NextLink href="/signup" passHref>
            <Button
              variant="contained"
              size="large"
              sx={{
                padding: "12px 30px",
                fontSize: "1.1rem",
                borderRadius: "50px",
                backgroundColor: PALETTE.secondary.main,
                fontFamily: FONT_FAMILY,
                boxShadow: `0 6px 20px 0 ${alpha(PALETTE.secondary.main, 0.5)}`,
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: PALETTE.secondary.dark,
                },
              }}
            >
              Sign Up Now
            </Button>
          </NextLink>
          <NextLink href="/login" passHref>
            <Button
              variant="outlined"
              size="large"
              sx={{
                ml: 2,
                padding: "12px 30px",
                fontSize: "1.1rem",
                borderRadius: "50px",
                borderColor: alpha(PALETTE.common.white, 0.7),
                color: PALETTE.common.white,
                fontFamily: FONT_FAMILY,
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: alpha(PALETTE.common.white, 0.1),
                  borderColor: PALETTE.common.white,
                },
              }}
            >
              Login
            </Button>
          </NextLink>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 4,
          textAlign: "center",
          backgroundColor: PALETTE.background.paper,
          borderTop: `1px solid ${PALETTE.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{ color: PALETTE.text.secondary, fontFamily: FONT_FAMILY }}
          >
            &copy; {new Date().getFullYear()} GitGPT. All rights reserved.
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: PALETTE.text.disabled, fontFamily: FONT_FAMILY }}
          >
            Revolutionizing Code Collaboration with AI.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
