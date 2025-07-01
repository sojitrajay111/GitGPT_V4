"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useGetThemeQuery } from "@/features/themeApiSlice";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ProjectFlowTree from "@/components/project-details/ProjectFlowTree";

const lightTheme = createTheme({
  palette: { mode: "light" },
});
const darkTheme = createTheme({
  palette: { mode: "dark" },
});

const ProjectFlowTreePage = () => {
  const params = useParams();
  const userId = params.userId;
  const projectId = params.projectId;
  const { data: themeData } = useGetThemeQuery(userId);
  const theme = themeData?.theme || (typeof window !== "undefined" && localStorage.getItem("theme")) || "light";
  const activeTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: activeTheme.palette.background.default,
          px: { xs: 1, sm: 3, md: 6 },
          py: { xs: 2, sm: 4 },
        }}
      >
        
        <ProjectFlowTree />
      </Box>
    </ThemeProvider>
  );
};

export default ProjectFlowTreePage; 