"use client";

import { useMediaQuery, useTheme } from "@mui/material";
import { Container, Grid, Typography } from "@mui/material";
import Head from "next/head";
import SignupBackground from "@/components/signup_components/SignupBackground";
import SignupHeader from "@/components/signup_components/SignupHeader";
import SignupFeatures from "@/components/signup_components/SignupFeatures";
import SignupForm from "@/components/signup_components/SignupForm";

export default function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Head>
        <title>Sign Up | GitGPT</title>
        <meta name="description" content="Create a GitGPT account" />
      </Head>

      <SignupBackground>
        <Container maxWidth="xl" sx={{ height: "100vh", p: 0 }}>
          <Grid container sx={{ height: "100%" }}>
            {/* Left Section - Brand & Features (Hidden on mobile) */}
            {!isMobile && (
              <Grid
                item
                md={7}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  p: 6,
                }}
              >
                <SignupHeader isMobile={isMobile} />
                <SignupFeatures />
              </Grid>
            )}

            {/* Right Section - Sign Up Form */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 3, md: 4 },
                position: "relative",
              }}
            >
              <SignupForm isMobile={isMobile} />

              {/* Copyright */}
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 20,
                  color: "rgba(71, 85, 105, 0.5)",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                © {new Date().getFullYear()} GitGPT. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </SignupBackground>
    </>
  );
}
