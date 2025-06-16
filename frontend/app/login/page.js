"use client";
import { useTheme, useMediaQuery, Container, Grid, Typography } from "@mui/material";
import Head from "next/head";
import LoginBackground from "@/components/login_components/LoginBackground";
import LoginHeader from "@/components/login_components/LoginHeader";
import LoginFeatures from "@/components/login_components/LoginFeatures";
import LoginForm from "@/components/login_components/LoginForm";

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Head>
        <title>Login | GitGPT</title>
        <meta name="description" content="Login to your GitGPT account" />
      </Head>

      <LoginBackground>
        <Container maxWidth="xl" sx={{ height: "100vh", p: 0 }}>
          <Grid container sx={{ height: "100%" }}>
            {/* Left Section - Brand & Features */}
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
                <LoginHeader isMobile={isMobile} />
                <LoginFeatures />
              </Grid>
            )}

            {/* Right Section - Login Form */}
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
              <LoginForm isMobile={isMobile} />

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
      </LoginBackground>
    </>
  );
}
