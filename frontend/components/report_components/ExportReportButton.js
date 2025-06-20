import React from "react";
import { alpha } from "@mui/material/styles";

export default function ExportReportButton({ onClick, currentTheme }) {
  return (
    <button
      id="export-button"
      onClick={onClick}
      className="flex items-center px-6 py-2 border rounded-lg font-medium shadow-sm hover:shadow-md transition-colors duration-200 ease-in-out"
      style={{
        borderColor: currentTheme.palette.primary.main,
        color: currentTheme.palette.primary.main,
        backgroundColor: currentTheme.palette.background.paper,
        '&:hover': {
          backgroundColor: alpha(currentTheme.palette.primary.main, 0.05),
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v5a1 1 0 102 0V8zm4 0a1 1 0 10-2 0v5a1 1 0 102 0V8z"
          clipRule="evenodd"
        />
      </svg>
      Export Report
    </button>
  );
} 