// components/ProjectMetrics.js
import React from "react";
import { Box, Typography, Card, Grid, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, Paper } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { styled } from "@mui/system";


// Styled component for chart cards, adapted for dynamic theme
const ChartCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  height: "400px",
  minHeight: "300px",
}));

/**
 * ProjectMetrics Component
 * Displays various charts and insights related to project metrics.
 *
 * @param {object} props - Component props.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {object} props.projectMetricsData - Data object containing all project metrics for charts.
 * @param {Array<string>} props.CHART_COLORS - Array of colors to be used in charts.
 * @param {object} props.project - The project object.
 */
const ProjectMetrics = ({ activeTheme, projectMetricsData, CHART_COLORS, project }) => {
  // Branch selection logic
  const { branches, loading: branchesLoading } = useGithubBranches(project?.githubRepoLink);
  const [selectedBranch, setSelectedBranch] = React.useState("");
  React.useEffect(() => {
    if (branches.length > 0) {
      setSelectedBranch(branches[0].name);
    }
  }, [branches]);

  return (
    <>
      <Typography
        variant="h5"
        component="h2"
        className="font-bold mb-4"
        sx={{ color: activeTheme.palette.text.primary }}
      >
        Project Insights
      </Typography>
      <Grid container spacing={4} className="mb-8 mt-4">
        {/* Code Contribution (Lines) */}
        <Grid item xs={12} md={6}>
          <ChartCard
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              className="mb-4"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Code Contribution (Lines)
            </Typography>
            <Box className="flex-grow h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectMetricsData?.codeContributionData || []}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke={activeTheme.palette.text.secondary}
                  />
                  <YAxis stroke={activeTheme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backgroundColor: activeTheme.palette.background.paper,
                      border: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Lines of Code"
                    fill={CHART_COLORS[2]}
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Time Saved by AI Chart */}
        <Grid item xs={12} md={6}>
          <ChartCard
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              className="mb-4"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Time Saved by AI (Hours)
            </Typography>
            <Box className="flex-grow h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectMetricsData?.timeSavedData || []}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke={activeTheme.palette.text.secondary}
                  />
                  <YAxis stroke={activeTheme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backgroundColor: activeTheme.palette.background.paper,
                      border: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Hours Saved"
                    fill={CHART_COLORS[3]}
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Gemini AI Token Usage Chart */}
        <Grid item xs={12} md={6}>
          <ChartCard
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              className="mb-4"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Gemini AI Token Usage
            </Typography>
            <Box className="flex-grow h-full flex justify-center items-center min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectMetricsData?.geminiTokenData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(projectMetricsData?.geminiTokenData || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backgroundColor: activeTheme.palette.background.paper,
                      border: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* New Chart: AI-Assisted PRs vs. Developer-Only PRs */}
        <Grid item xs={12} md={6}>
          <ChartCard
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              className="mb-4"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Pull Request Contribution
            </Typography>
            <Box className="flex-grow h-full flex justify-center items-center min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectMetricsData?.prContributionData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(projectMetricsData?.prContributionData || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backgroundColor: activeTheme.palette.background.paper,
                      border: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* New Chart: PR Status Distribution */}
        {/* <Grid item xs={12} md={6}>
          <ChartCard
            sx={{
              bgcolor: activeTheme.palette.background.paper,
              border: `1px solid ${activeTheme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              className="mb-4"
              sx={{ color: activeTheme.palette.text.primary }}
            >
              Pull Request Status Distribution
            </Typography>
            <Box className="flex-grow h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectMetricsData?.prStatusData || []}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke={activeTheme.palette.text.secondary}
                  />
                  <YAxis stroke={activeTheme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backgroundColor: activeTheme.palette.background.paper,
                      border: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS[4]}
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid> */}
      </Grid>
    </>
  );
};

export default ProjectMetrics;
