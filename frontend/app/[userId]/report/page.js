"use client";

import React, { useState, useEffect, useRef } from "react";

import { useParams } from "next/navigation";
import { useGetProjectsQuery, useGetDeveloperProjectsQuery, useGetProjectReportDataQuery } from "@/features/projectApiSlice";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { pdf } from '@react-pdf/renderer';
import domToImage from 'dom-to-image-more';

// Material-UI imports for theme
import { createTheme, ThemeProvider, Box, Typography, Switch, CircularProgress, alpha } from "@mui/material";
import { useGetThemeQuery, useUpdateThemeMutation } from "@/features/themeApiSlice";

import StatCardGrid from "@/components/report_components/StatCardGrid";
import ProjectSelector from "@/components/report_components/ProjectSelector";
import ExportReportButton from "@/components/report_components/ExportReportButton";
import DeveloperActivityChart from "@/components/report_components/DeveloperActivityChart";
import CodeContributionChart from "@/components/report_components/CodeContributionChart";
import AIImpactChart from "@/components/report_components/AIImpactChart";
import DeveloperVelocityChart from "@/components/report_components/DeveloperVelocityChart";
import ProjectStatusChart from "@/components/report_components/ProjectStatusChart";
import DetailedProjectReports from "@/components/report_components/DetailedProjectReports";
import ReportPDFDocument from "@/components/report_components/ReportPDFDocument";

// Recharts is a great library for visualizing data in React.
// It's chosen for its flexibility and comprehensive set of chart types.

// Static Data for the Charts (These will serve as initial/fallback data)
const developerActivityData = [
  { name: "Mon", "Hours Worked": 8, "Tasks Completed": 3 },
  { name: "Tue", "Hours Worked": 7.5, "Tasks Completed": 4 },
  { name: "Wed", "Hours Worked": 8.5, "Tasks Completed": 3 },
  { name: "Thu", "Hours Worked": 9, "Tasks Completed": 5 },
  { name: "Fri", "Hours Worked": 7, "Tasks Completed": 2 },
  { name: "Sat", "Hours Worked": 4, "Tasks Completed": 1 },
  { name: "Sun", "Hours Worked": 2, "Tasks Completed": 0 },
];

const codeContributionData = [
  { name: "Jan", "Developer LOC": 4000, "AI Generated LOC": 2400 },
  { name: "Feb", "Developer LOC": 3000, "AI Generated LOC": 1398 },
  { name: "Mar", "Developer LOC": 2000, "AI Generated LOC": 9800 },
  { name: "Apr", "Developer LOC": 2780, "AI Generated LOC": 3908 },
  { name: "May", "Developer LOC": 1890, "AI Generated LOC": 4800 },
  { name: "Jun", "Developer LOC": 2390, "AI Generated LOC": 3800 },
];

const aiImpactData = [
  { name: "Feature A", "Time Reduced (Hours)": 15, "Cost Saved ($)": 750 },
  { name: "Feature B", "Time Reduced (Hours)": 10, "Cost Saved ($)": 500 },
  { name: "Feature C", "Time Reduced (Hours)": 20, "Cost Saved ($)": 1000 },
  { name: "Feature D", "Time Reduced (Hours)": 8, "Cost Saved ($)": 400 },
];

const developerVelocityData = [
  { name: "Before AI", value: 5.2 },
  { name: "With AI", value: 2.8 },
];

const projectStatusData = [
  { name: "Completed Projects", value: 60 },
  { name: "In Progress", value: 35 },
  { name: "On Hold", value: 5 },
];

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"]; // Shades of indigo and blue for light theme

export default function ReportContent() {
  const { userId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [chartImages, setChartImages] = useState({});

  // Refs for chart elements
  const developerActivityChartRef = useRef(null);
  const codeContributionChartRef = useRef(null);
  const aiImpactChartRef = useRef(null);
  const developerVelocityChartRef = useRef(null);
  const projectStatusChartRef = useRef(null);

  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const user_role = userData?.user?.role;

  const { data: managerProjectsData, isLoading: managerProjectsLoading, isError: managerProjectsError } = useGetProjectsQuery(userId, { skip: user_role !== "manager" || !userId });
  const { data: developerProjectsData, isLoading: developerProjectsLoading, isError: developerProjectsError } = useGetDeveloperProjectsQuery(userId, { skip: user_role !== "developer" || !userId });

  const allProjects = user_role === "manager" ? managerProjectsData?.projects : developerProjectsData;

  const isLoadingProjects = managerProjectsLoading || developerProjectsLoading;
  const isErrorProjects = managerProjectsError || developerProjectsError;

  // Use theme from RTK Query
  const { data: themeData, isLoading: isThemeLoading, refetch: refetchTheme } = useGetThemeQuery(userId);
  const [updateTheme] = useUpdateThemeMutation();
  const darkMode = themeData?.theme === "dark";

  // Define light and dark themes using Material-UI's createTheme
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#F5F7FA', // Light background
        paper: 'rgba(255, 255, 255, 0.98)', // White with slight transparency
        list: '#F7F8FA',
      },
      text: {
        primary: '#263238', // Dark charcoal
        secondary: '#546E7A', // Medium grey
      },
      primary: {
        main: '#1976D2', // Google Blue
        dark: '#1565C0',
        contrastText: '#fff',
      },
      error: {
        main: '#D32F2F', // Standard red
        dark: '#C62828',
      },
      divider: '#E0E0E0',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 38,
            height: 20,
            padding: 0,
            display: 'flex',
            '&:active': {
              '& .MuiSwitch-thumb': {
                width: 18,
              },
            },
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#A78BFA', // Light purple for checked track
                opacity: 1,
                border: 0,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#A78BFA',
              border: '6px solid #fff',
            },
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
          },
          track: {
            borderRadius: 20 / 2,
            opacity: 1,
            backgroundColor: '#E0E0E0', // Light grey for unchecked track
            transition: 'background-color 0.3s',
            '.Mui-checked.MuiSwitch-colorPrimary + &': {
              backgroundColor: '#A78BFA',
            },
          },
        },
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#000', // Main background
        paper: '#161717', // Cards/dialogs
        list: '#2f2f2f', // Lists
      },
      text: {
        primary: '#ECEFF1', // Lightest grey
        secondary: '#B0BEC5', // Light grey
      },
      primary: {
        main: '#64B5F6', // Lighter blue for dark mode
        dark: '#42A5F5',
        contrastText: '#263238',
      },
      error: {
        main: '#EF5350', // Lighter red
        dark: '#E53935',
      },
      divider: '#455A64',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 38,
            height: 20,
            padding: 0,
            display: 'flex',
            '&:active': {
              '& .MuiSwitch-thumb': {
                width: 18,
              },
            },
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#8B5CF6', // Darker purple for checked track in dark mode
                opacity: 1,
                border: 0,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#8B5CF6',
              border: '6px solid #fff',
            },
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
          },
          track: {
            borderRadius: 20 / 2,
            opacity: 1,
            backgroundColor: '#4F4F4F', // Darker grey for unchecked track in dark mode
            transition: 'background-color 0.3s',
            '.Mui-checked.MuiSwitch-colorPrimary + &': {
              backgroundColor: '#8B5CF6',
            },
          },
        },
      },
    },
  });

  const currentTheme = darkMode ? darkTheme : lightTheme;

  const handleThemeToggle = async () => {
    try {
      const newTheme = darkMode ? "light" : "dark";
      await updateTheme({ userId, theme: newTheme }).unwrap();
      refetchTheme(); // Refetch theme to ensure UI updates
      // No snackbar here, as we don't have one in Report page currently.
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  useEffect(() => {
    if (allProjects && allProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(allProjects[0]._id);
    }
  }, [allProjects, selectedProjectId]);

  // New: Fetch project report data based on selectedProjectId
  const { data: projectReportData, isLoading: isReportDataLoading, isError: isReportDataError, error: reportDataError } = useGetProjectReportDataQuery(selectedProjectId, {
    skip: !selectedProjectId,
    // Add error handling to prevent the query from failing
    refetchOnError: false,
  });

  const handleProjectChange = (event) => {
    setSelectedProjectId(event.target.value);
  };

  // Using fetched projectReportData, with a fallback to initial static data
  const currentProjectData = projectReportData || {
    developerActivity: developerActivityData,
    codeContribution: codeContributionData,
    aiImpact: aiImpactData,
    developerVelocity: developerVelocityData,
    projectStatus: projectStatusData,
    totalDevelopers: 5, // Add default value
    totalTasks: 35,      // Add default value
    pendingTasks: 10,    // Add default value
    statCards: {
      tasksCompleted: 0,
      avgCompletionTime: "0",
      teamProductivity: "0",
      pendingReviews: 0,
    }
  };

  console.log('projectReportData from API:', projectReportData);
  console.log('currentProjectData being used:', currentProjectData);

  if (isLoadingProjects) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isErrorProjects) {
    console.error('Project Error:', managerProjectsError || developerProjectsError);
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center items-center text-red-500">
        <p className="mb-4">Error loading projects.</p>
        <p className="text-sm text-gray-600">
          Please check if the backend server is running and the API endpoints are properly configured.
        </p>
      </div>
    );
  }

  // Show a warning if report data is not available
  if (isReportDataError) {
    console.warn('Report data not available:', reportDataError);
    // Continue rendering with fallback data
  }

  const handleExportReport = async () => {
    if (!selectedProjectId) {
      alert("Please select a project to export.");
      return;
    }

    const selectedProject = allProjects.find(p => p._id === selectedProjectId);
    const projectName = selectedProject ? selectedProject.projectName : "Project Report";
    const projectData = currentProjectData; // Use the dynamically fetched/fallback data

    // New: Capture charts as images
    const capturedChartImages = {};

    const captureChart = async (chartRef) => {
        if (chartRef.current) {
            // Only hide legend and tooltip wrappers to preserve axis labels and tick values
            const elementsToHide = chartRef.current.querySelectorAll(
                '.recharts-legend-wrapper, .recharts-tooltip-wrapper'
            );

            elementsToHide.forEach(el => {
                el.style.visibility = 'hidden';
            });

            try {
                // Using dom-to-image-more to capture the chart as an image
                const dataUrl = await domToImage.toPng(chartRef.current, {
                    quality: 1.0,
                    scale: 2, // Increase scale for higher resolution
                    style: {
                        backgroundColor: 'white', // Ensure white background for charts
                    }
                });
                return dataUrl;
            } catch (error) {
                console.error("Error capturing chart as image:", error);
                return null;
            } finally {
                // Restore visibility of hidden elements
                elementsToHide.forEach(el => {
                    el.style.visibility = 'visible';
                });
            }
        }
        return null;
    };

    // Capture all charts
    capturedChartImages.developerActivity = await captureChart(developerActivityChartRef);
    capturedChartImages.codeContribution = await captureChart(codeContributionChartRef);
    capturedChartImages.aiImpact = await captureChart(aiImpactChartRef);
    capturedChartImages.developerVelocity = await captureChart(developerVelocityChartRef);
    capturedChartImages.projectStatus = await captureChart(projectStatusChartRef);

    try {
      const blob = await pdf(
        <ReportPDFDocument
          projectData={projectData}
          projectName={projectName}
          chartImages={capturedChartImages}
          COLORS={COLORS}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Box sx={{
        minHeight: "100vh",
        backgroundColor: currentTheme.palette.background.default,
        color: currentTheme.palette.text.primary,
        p: { xs: 2, sm: 3, md: 4, lg: 5 }, // Reduced responsive padding
        transition: "background-color 0.3s, color 0.3s",
      }}>
        <div id="report-content" className="min-h-screen"
          style={{
            backgroundColor: currentTheme.palette.background.default, // Ensure background reflects theme
            color: currentTheme.palette.text.primary, // Ensure text color reflects theme
          }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-3xl font-extrabold mb-4 sm:mb-0"
              style={{ color: currentTheme.palette.text.primary }}>
              Project Analytics Dashboard
            </h2>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <ProjectSelector
                allProjects={allProjects}
                selectedProjectId={selectedProjectId}
                handleProjectChange={handleProjectChange}
                currentTheme={currentTheme}
              />
              <ExportReportButton
                onClick={handleExportReport}
                currentTheme={currentTheme}
              />
            </div>
          </div>
          <StatCardGrid data={currentProjectData} currentTheme={currentTheme} />
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DeveloperActivityChart
              data={currentProjectData.developerActivity}
              currentTheme={currentTheme}
              chartRef={developerActivityChartRef}
            />
            <CodeContributionChart
              data={currentProjectData.codeContribution}
              currentTheme={currentTheme}
              chartRef={codeContributionChartRef}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AIImpactChart
              data={currentProjectData.aiImpact}
              currentTheme={currentTheme}
              chartRef={aiImpactChartRef}
            />
            <DeveloperVelocityChart
              data={currentProjectData.developerVelocity}
              currentTheme={currentTheme}
              chartRef={developerVelocityChartRef}
            />
          </div>
          <ProjectStatusChart
            data={currentProjectData.projectStatus}
            currentTheme={currentTheme}
            COLORS={COLORS}
            chartRef={projectStatusChartRef}
          />
          <DetailedProjectReports currentTheme={currentTheme} />
        </div>
      </Box>
    </ThemeProvider>
  );
}