// pages/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Grid,
  Chip,
  Skeleton,
  Alert,
  Button,
} from "@mui/material";
import { GitHub, Email, Person } from "@mui/icons-material";
import GitHubAuthDialog from "@/components/GithubAuthDialog";
import {
  useCheckGitHubAuthStatusQuery,
  useGetGitHubDataQuery,
} from "@/features/githubApiSlice";

const Dashboard = () => {
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [githubData, setGithubData] = useState(null);

  // Check GitHub authentication status
  const {
    data: authStatus,
    isLoading: authStatusLoading,
    error: authStatusError,
  } = useCheckGitHubAuthStatusQuery();

  // Get GitHub data if authenticated
  const {
    data: gitHubDataResponse,
    isLoading: gitHubDataLoading,
    error: gitHubDataError,
    refetch: refetchGitHubData,
  } = useGetGitHubDataQuery(undefined, {
    skip: !authStatus?.isAuthenticatedToGithub,
  });

  useEffect(() => {
    if (authStatus && !authStatus.isAuthenticatedToGithub) {
      setShowGitHubDialog(true);
    }
  }, [authStatus]);

  useEffect(() => {
    if (gitHubDataResponse?.success) {
      setGithubData(gitHubDataResponse.data);
    }
  }, [gitHubDataResponse]);

  const handleGitHubAuthSuccess = (data) => {
    setGithubData(data);
    setShowGitHubDialog(false);
    // Refetch GitHub data to get the complete data from database
    refetchGitHubData();
  };

  const handleReconnectGitHub = () => {
    setShowGitHubDialog(true);
  };

  if (authStatusLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="text" width="40%" height={50} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ mt: 2 }}
        />
      </Container>
    );
  }

  if (authStatusError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load dashboard. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {authStatus?.isAuthenticatedToGithub ? (
        <>
          {gitHubDataLoading ? (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Skeleton variant="circular" width={80} height={80} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : gitHubDataError ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              Failed to load GitHub data. Please try reconnecting.
              <Button onClick={handleReconnectGitHub} sx={{ ml: 2 }}>
                Reconnect GitHub
              </Button>
            </Alert>
          ) : githubData ? (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  GitHub Profile
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
                >
                  <Avatar
                    src={githubData.avatarUrl}
                    alt={githubData.githubUsername}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {githubData.githubUsername}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {githubData.githubEmail}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GitHub fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ID: {githubData.githubId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    icon={<GitHub />}
                    label="GitHub Connected"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`Connected on ${new Date(
                      githubData.authenticatedAt || githubData.createdAt
                    ).toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleReconnectGitHub}
                  >
                    Update GitHub Connection
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            ""
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your repositories, issues, and pull requests.
                  </Typography>
                  {/* Add your quick actions here */}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your recent GitHub activity will appear here.
                  </Typography>
                  {/* Add recent activity here */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please connect your GitHub account to access all dashboard features.
        </Alert>
      )}

      <GitHubAuthDialog
        open={showGitHubDialog}
        onClose={() => setShowGitHubDialog(false)}
        onSuccess={handleGitHubAuthSuccess}
      />
    </Container>
  );
};

export default Dashboard;
