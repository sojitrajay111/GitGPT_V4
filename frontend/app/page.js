"use client";

import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

// Icons
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
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material"; // For carousel navigation

// --- Hardcoded Theme Values (Light Theme Focus) ---
const FONT_FAMILY = "Inter, sans-serif";

// Palette (Light Theme)
const PALETTE = {
  common: {
    black: "#000",
    white: "#fff",
  },
  primary: {
    main: "#4F46E5", // Modern Indigo
    light: "#6366F1",
    dark: "#3730A3",
  },
  secondary: {
    main: "#F59E0B", // Amber for accent
    light: "#FBBF24",
    dark: "#D97706",
  },
  background: {
    default: "#F9FAFB", // Very light gray background
    paper: "#FFFFFF", // White for paper elements
  },
  text: {
    primary: "#1F2937", // Darker gray for primary text
    secondary: "#4B5563", // Medium gray for secondary text
    disabled: "#9CA3AF",
  },
  divider: "#E5E7EB", // Lighter divider
  error: {
    main: "#EF4444",
  },
};

// Spacing (assuming 8px unit)
const SPACING_UNIT = 8;
const spacing = (multiplier) => `${multiplier * SPACING_UNIT}px`;

// Shape
const SHAPE = {
  borderRadius: 12, // More rounded corners
};

// Shadows (Light theme appropriate)
const SHADOWS = [
  "none",
  "0px 1px 3px rgba(0,0,0,0.08)", // subtle elevation
  "0px 4px 6px rgba(0,0,0,0.1)", // normal elevation
  "0px 10px 15px rgba(0,0,0,0.12)", // FeatureCard uses this
  "0px 15px 25px rgba(0,0,0,0.15)", // Stronger shadow on hover
  "0px 20px 35px rgba(0,0,0,0.18)", // Carousel shadow
];

// Styled Components
const HeroSection = styled(Box)({
  minHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: `${spacing(6)} ${spacing(2)}`,
  background: `linear-gradient(135deg, ${PALETTE.primary.main} 0%, ${PALETTE.primary.dark} 100%)`, // Gradient for hero
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
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", // Slightly less opaque pattern
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
  borderRadius: SHAPE.borderRadius,
  backgroundColor: PALETTE.background.paper, // White background for cards
  boxShadow: SHADOWS[2], // Lighter shadow
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: SHADOWS[3], // Stronger shadow on hover
  },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start", // Align content to top
});

const Section = styled(Box)({
  padding: `${spacing(10)} ${spacing(2)}`, // More vertical padding
  backgroundColor: PALETTE.background.default,
});

const StyledAppBar = styled(AppBar)({
  backgroundColor: alpha(PALETTE.background.paper, 0.98), // Almost opaque white for AppBar
  backdropFilter: "blur(12px)", // Increased blur
  boxShadow: SHADOWS[1], // Subtle shadow
  borderBottom: `1px solid ${PALETTE.divider}`,
});

const LogoText = styled(Typography)({
  fontWeight: "bold",
  letterSpacing: "0.5px", // Slightly less letter spacing
  color: PALETTE.text.primary, // Dark text for logo in light theme
  fontFamily: FONT_FAMILY,
});

const CarouselContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
  borderRadius: SHAPE.borderRadius * 2,
  boxShadow: SHADOWS[4], // Stronger shadow for carousel
  backgroundColor: PALETTE.background.paper,
  padding: spacing(6), // Increased padding
  margin: "0 auto",
  maxWidth: "95%", // More responsive width
  "@media (min-width:600px)": {
    maxWidth: "85%",
  },
  "@media (min-width:960px)": {
    maxWidth: "75%",
  },
  "@media (min-width:1200px)": {
    maxWidth: "65%",
  },
});

const CarouselInner = styled(Box)(({ transformValue }) => ({
  display: "flex",
  transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Smoother animation
  transform: `translateX(${transformValue}%)`,
}));

const CarouselItem = styled(Box)({
  minWidth: "100%",
  boxSizing: "border-box",
  padding: spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: PALETTE.text.primary,
});

export default function MainPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLogin = () => {
    router.push("/login");
  };
  const handleSignup = () => {
    router.push("/signup");
  };

  const projectInfoSlides = [
    {
      title: "Seamless GitHub Integration",
      description:
        "Connect your GitHub repositories effortlessly. GitGPT syncs your project data in real-time, providing a unified view of your development ecosystem. Push code, manage branches, and track commits all in one place.",
      icon: (
        <GitHubIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "AI-Powered Sprint Planning",
      description:
        "Utilize AI to assist with sprint planning. Generate realistic estimates, identify potential bottlenecks, and optimize task distribution among your team members for efficient project execution.",
      icon: (
        <AutoAwesomeIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "Automated Code Review & Suggestions",
      description:
        "Leverage AI for intelligent code reviews. Get instant feedback on code quality, potential bugs, and stylistic improvements. Receive context-aware suggestions to enhance your codebase and maintain best practices.",
      icon: (
        <CodeIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "Comprehensive Reporting & Analytics",
      description:
        "Gain deep insights into your project's performance with customizable reports and analytics. Track team productivity, identify trends, and make data-driven decisions to keep your projects on track and within budget.",
      icon: (
        <AnalyticsIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "Real-time Collaboration & Communication",
      description:
        "Facilitate seamless communication among team members. Share updates, discuss issues, and collaborate on documents in real-time, fostering a more connected and productive work environment.",
      icon: (
        <GroupsIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "Smart Documentation Generation",
      description:
        "Automatically generate comprehensive project documentation from your code and user stories, saving countless hours and ensuring consistency.",
      icon: (
        <DescriptionIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main, fontSize: "3.5rem" }}
        />
      ),
    },
    {
      title: "Task & Workflow Automation",
      description:
        "Automate repetitive tasks and workflows, from issue assignment to pull request management, freeing up your team to focus on core development.",
      icon: (
        <AssignmentIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main, fontSize: "3.5rem" }}
        />
      ),
    },
  ];

  const totalSlides = projectInfoSlides.length;

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(goToNextSlide, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, [activeSlide, totalSlides]);

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
    {
      icon: (
        <NotificationsIcon
          fontSize="large"
          sx={{ color: PALETTE.primary.main }}
        />
      ),
      title: "Real-time Progress Tracking",
      description:
        "Monitor team activities and project milestones with real-time updates and customizable dashboards.",
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
    {
      icon: (
        <GitHubIcon fontSize="large" sx={{ color: PALETTE.secondary.main }} />
      ),
      title: "Streamlined PR Workflow",
      description:
        "Create, review, and merge pull requests with AI assistance, ensuring code quality and efficient collaboration.",
    },
    {
      icon: (
        <DescriptionIcon
          fontSize="large"
          sx={{ color: PALETTE.secondary.main }}
        />
      ),
      title: "Contextual Code Search",
      description:
        "Quickly find relevant code snippets and documentation within your projects using AI-powered search.",
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: PALETTE.background.default,
        color: PALETTE.text.primary,
        fontFamily: FONT_FAMILY,
        overflowX: "hidden", // Prevent horizontal scroll on body
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
                <img
                  src="/logo.png" // Path to your logo.png in the public folder
                  alt="GitGPT Logo"
                  style={{ width: "36px", height: "36px", marginRight: "12px" }} // Slightly larger logo in app bar
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
                    borderColor: alpha(PALETTE.text.primary, 0.3), // Lighter border
                    color: PALETTE.text.primary,
                    fontFamily: FONT_FAMILY,
                    borderRadius: "50px", // Rounded buttons
                    "&:hover": {
                      borderColor: PALETTE.primary.main,
                      backgroundColor: alpha(PALETTE.primary.main, 0.05), // Softer hover
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
                    backgroundColor: PALETTE.primary.main, // Use primary color for main action
                    fontFamily: FONT_FAMILY,
                    boxShadow: SHADOWS[1], // Subtle shadow for contained button
                    borderRadius: "50px", // Rounded buttons
                    "&:hover": {
                      backgroundColor: PALETTE.primary.dark,
                      boxShadow: SHADOWS[2],
                    },
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
          <AutoAwesomeIcon sx={{ fontSize: "5rem", mb: 2, color: "#FFD700" }} />{" "}
          {/* Larger icon */}
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "extrabold", // Bolder font
              letterSpacing: "-1.5px", // Tighter letter spacing
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" }, // Responsive font size
            }}
          >
            GitGPT: Intelligent Project Management, Reimagined.
          </Typography>
          <Typography
            variant="h5"
            component="p"
            paragraph
            sx={{
              mb: 4,
              opacity: 0.9,
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" }, // Responsive font size
            }}
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
                padding: "14px 36px", // Slightly larger button
                fontSize: "1.15rem",
                borderRadius: "50px",
                backgroundColor: PALETTE.secondary.main, // Using secondary for main CTA
                fontFamily: FONT_FAMILY,
                boxShadow: `0 8px 25px 0 ${alpha(PALETTE.secondary.main, 0.4)}`, // Stronger shadow
                transition:
                  "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: PALETTE.secondary.dark,
                  boxShadow: `0 12px 30px 0 ${alpha(
                    PALETTE.secondary.dark,
                    0.5
                  )}`,
                },
              }}
            >
              Get Started Free
            </Button>
          </NextLink>
        </Container>
      </HeroSection>

      {/* New Section: Project Insights Carousel */}
      <Section
        sx={{
          backgroundColor: PALETTE.background.paper,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              mb: 6,
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, // Responsive font size
            }}
          >
            Discover Key{" "}
            <span style={{ color: PALETTE.primary.main }}>Features</span>
          </Typography>

          <CarouselContainer>
            <CarouselInner transformValue={-activeSlide * 100}>
              {projectInfoSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <Box sx={{ mb: 3 }}>{slide.icon}</Box>{" "}
                  {/* Increased margin */}
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: "700", fontFamily: FONT_FAMILY, mb: 1.5 }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: PALETTE.text.secondary,
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.7, // Better readability
                      maxWidth: "700px", // Constrain text width
                    }}
                  >
                    {slide.description}
                  </Typography>
                </CarouselItem>
              ))}
            </CarouselInner>

            {/* Carousel Navigation Buttons */}
            <IconButton
              onClick={goToPrevSlide}
              sx={{
                position: "absolute",
                left: spacing(2),
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: alpha(PALETTE.common.white, 0.8), // Slightly more opaque
                "&:hover": {
                  backgroundColor: PALETTE.common.white,
                  boxShadow: SHADOWS[1],
                },
                boxShadow: SHADOWS[0], // No initial shadow
                color: PALETTE.text.primary,
                zIndex: 1, // Ensure buttons are above content
                p: 1.5, // Larger touch target
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={goToNextSlide}
              sx={{
                position: "absolute",
                right: spacing(2),
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: alpha(PALETTE.common.white, 0.8),
                "&:hover": {
                  backgroundColor: PALETTE.common.white,
                  boxShadow: SHADOWS[1],
                },
                boxShadow: SHADOWS[0],
                color: PALETTE.text.primary,
                zIndex: 1,
                p: 1.5, // Larger touch target
              }}
            >
              <KeyboardArrowRight />
            </IconButton>

            {/* Carousel Dots */}
            <Box
              sx={{
                position: "absolute",
                bottom: spacing(3), // Lower position
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: spacing(1.5), // More space between dots
              }}
            >
              {projectInfoSlides.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12, // Slightly larger dots
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor:
                      activeSlide === index
                        ? PALETTE.primary.main
                        : alpha(PALETTE.text.secondary, 0.3), // Lighter inactive dot
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.2)",
                    },
                  }}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </Box>
          </CarouselContainer>
        </Container>
      </Section>

      <Section sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              mb: 8,
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, // Responsive font size
            }}
          >
            For <span style={{ color: PALETTE.primary.main }}>Managers</span>:
            Command Your Projects with AI
          </Typography>
          <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center">
            {" "}
            {/* Responsive spacing and centering */}
            {managerFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: alpha(PALETTE.primary.main, 0.1),
                      color: PALETTE.primary.main,
                      boxShadow: SHADOWS[0], // No shadow on icon container
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: "700",
                      fontFamily: FONT_FAMILY,
                      color: PALETTE.text.primary,
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: PALETTE.text.secondary,
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.6,
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
            width: "60%", // Wider divider
            height: "1px", // Thinner divider
            background: `linear-gradient(90deg, transparent, ${PALETTE.divider}, transparent)`,
          }}
        />
      </Box>

      <Section
        sx={{
          backgroundColor:
            PALETTE.background.paper /* Different bg for contrast */,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              mb: 8,
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, // Responsive font size
            }}
          >
            For{" "}
            <span style={{ color: PALETTE.secondary.main }}>
              Developers & BAs
            </span>
            : Accelerate Your Workflow
          </Typography>
          <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center">
            {" "}
            {/* Responsive spacing and centering */}
            {devBaFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: alpha(PALETTE.secondary.main, 0.1),
                      color: PALETTE.secondary.main,
                      boxShadow: SHADOWS[0],
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: "700",
                      fontFamily: FONT_FAMILY,
                      color: PALETTE.text.primary,
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: PALETTE.text.secondary,
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.6,
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
          py: { xs: 8, md: 12 },
          textAlign: "center",
          backgroundColor: PALETTE.primary.dark, // Darker accent for call to action
          color: PALETTE.common.white,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, // Responsive font size
            }}
          >
            Ready to Transform Your Git Workflow?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            paragraph
            sx={{
              mb: 5,
              opacity: 0.9,
              fontFamily: FONT_FAMILY,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" }, // Responsive font size
            }}
          >
            Join GitGPT today and experience the future of project management
            and development, supercharged by AI.
          </Typography>
          <NextLink href="/signup" passHref>
            <Button
              variant="contained"
              size="large"
              sx={{
                padding: "14px 36px",
                fontSize: "1.15rem",
                borderRadius: "50px",
                backgroundColor: PALETTE.secondary.main, // Use secondary color
                fontFamily: FONT_FAMILY,
                boxShadow: `0 8px 25px 0 ${alpha(PALETTE.secondary.main, 0.4)}`,
                transition:
                  "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: PALETTE.secondary.dark,
                  boxShadow: `0 12px 30px 0 ${alpha(
                    PALETTE.secondary.dark,
                    0.5
                  )}`,
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
                ml: { xs: 0, sm: 2 }, // No margin-left on extra small screens, then 2 on small and up
                mt: { xs: 2, sm: 0 }, // Margin-top on extra small screens, then 0 on small and up
                padding: "14px 36px",
                fontSize: "1.15rem",
                borderRadius: "50px",
                borderColor: alpha(PALETTE.common.white, 0.7),
                color: PALETTE.common.white,
                fontFamily: FONT_FAMILY,
                transition:
                  "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
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
            sx={{
              color: PALETTE.text.disabled,
              fontFamily: FONT_FAMILY,
              mt: 0.5,
            }}
          >
            Revolutionizing Code Collaboration with AI.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
