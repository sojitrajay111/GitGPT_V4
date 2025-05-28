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
import { GitHub, Email, Person, Logout } from "@mui/icons-material";
import GitHubAuthDialog from "@/components/GitHubAuthDialog";
import {
  useGetGitHubStatusQuery,
  useDisconnectGitHubMutation,
} from "@/features/githubApiSlice";
import { useParams, useRouter } from "next/navigation";

const Dashboard = () => {
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const params = useParams();
  const userId = params.userId;
  const router = useRouter();

  // Get GitHub status (authentication + data in one call)
  const {
    data: statusResponse,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useGetGitHubStatusQuery(userId);

  // Disconnect GitHub mutation
  const [disconnectGitHub, { isLoading: disconnectLoading }] =
    useDisconnectGitHubMutation();

  useEffect(() => {
    if (statusResponse?.success) {
      setIsAuthenticated(statusResponse.isAuthenticated);

      if (statusResponse.isAuthenticated && statusResponse.data) {
        setGithubData(statusResponse.data);
        setShowGitHubDialog(false);
      } else {
        setGithubData(null);
        setShowGitHubDialog(true);
      }
    }
  }, [statusResponse]);

  const handleGitHubAuthSuccess = (data) => {
    setGithubData(data);
    setIsAuthenticated(true);
    setShowGitHubDialog(false);
    // Refetch status to get the complete data from database
    refetchStatus();
  };

  const handleReconnectGitHub = () => {
    setShowGitHubDialog(true);
  };

  const handleCreateProjectClick = () => {
    router.push(`/${userId}/create-project`);
  };

  const handleDisconnectGitHub = async () => {
    try {
      await disconnectGitHub().unwrap();
      setGithubData(null);
      setIsAuthenticated(false);
      setShowGitHubDialog(true);
      // Refetch status to update the UI
      refetchStatus();
    } catch (error) {
      console.error("Failed to disconnect GitHub:", error);
    }
  };

  // Loading state
  if (statusLoading) {
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

  // Error state
  if (statusError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load dashboard. Please try refreshing the page.
          <Button onClick={() => refetchStatus()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Dashboard</Typography>

        {/* Show disconnect button only if authenticated */}
        <Button
          variant="outlined"
          color="success"
          // CORRECTED: Wrap router.push in an arrow function
          onClick={handleCreateProjectClick}
        >
          Create Project
        </Button>
      </Box>

      {isAuthenticated && githubData ? (
        <>
          {/* GitHub Profile Card */}
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

          {/* Dashboard Content */}
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

      {/* GitHub Authentication Dialog */}
      <GitHubAuthDialog
        open={showGitHubDialog}
        onClose={() => setShowGitHubDialog(false)}
        onSuccess={handleGitHubAuthSuccess}
      />
    </Container>
  );
};

export default Dashboard;
