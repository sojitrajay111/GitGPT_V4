import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

export default function UserDataGrid({
  isLoadingUsers,
  filteredUsers,
  handleEditUser,
  confirmDelete,
  isDeletingUser,
  isMobile,
  theme,
}) {
  const columns = [
    {
      field: "index",
      headerName: "Index",
      width: 90,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        const currentIndex = filteredUsers.findIndex(user => user._id === params.row._id);
        return currentIndex !== -1 ? currentIndex + 1 : '';
      },
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: "username", 
      headerName: "Name", 
      width: 200, 
      minWidth: 200, 
      flex: 1, 
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ), 
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: "email", 
      headerName: "Email", 
      width: 250, 
      minWidth: 250, 
      flex: 1.5, 
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      headerAlign: 'center',
      align: 'center', 
    },
    {
      field: "jobRole",
      headerName: "Job Role",
      width: 180,
      minWidth: 180,
      flex: 1,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        return params.row.jobRole || "-";
      },
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      width: 150,
      minWidth: 150,
      flex: 0.8,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        const lastLogin = params.row.lastLogin;
        if (!lastLogin) {
          return "Never";
        }
        const date = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
          return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
          return `${diffHours} hours ago`;
        } else if (diffDays < 30) {
          return `${diffDays} days ago`;
        } else {
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      },
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      minWidth: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              borderRadius: 1.5,
              ...(params.value === "Active" && {
                backgroundColor: theme === "dark" ? "#2C3E2D" : "#E8F5E9", // Dark green subtle / Light green
                color: theme === "dark" ? "#A5D6A7" : "#1B5E20", // Lighter green text / Darker green text
              }),
              ...(params.value === "Inactive" && {
                backgroundColor: theme === "dark" ? "#4E2B2E" : "#FFEBEE", // Dark red subtle / Light red
                color: theme === "dark" ? "#EF9A9A" : "#D32F2F", // Lighter red text / Darker red text
              }),
              ...(params.value === "Pending" && {
                backgroundColor: theme === "dark" ? "#4F4125" : "#FFF8E1", // Dark yellow subtle / Light yellow
                color: theme === "dark" ? "#FFD54F" : "#FFA000", // Lighter yellow text / Darker yellow text
              }),
            }}
          />
        );
      },
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%" flexGrow={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditUser(params.row)}
            aria-label="edit user"
            sx={{
              margin: 0,
              color: theme === "dark" ? "#6366F1" : "#5F4BFF",
              '&:hover': {
                backgroundColor: theme === "dark" ? "rgba(99, 102, 241, 0.1)" : "rgba(95, 75, 255, 0.1)",
              },
              ...(params.row.status === "Pending" && {
                color: theme === "dark" ? "#B0B3B8" : "#9E9E9E",
                cursor: "not-allowed",
                pointerEvents: "none",
                '&:hover': {
                  backgroundColor: "transparent",
                },
              }),
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => confirmDelete(params.id)}
            aria-label="delete user"
            disabled={isDeletingUser}
            sx={{ margin: 0 }}
          >
            {isDeletingUser ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Box>
      ),
      headerAlign: 'center',
      align: 'center',
    },
  ];

  return (
    <Box
      sx={{
        height: 440,
        width: "100%",
        px: isMobile ? 1 : 4, // Reduce horizontal padding on mobile
        pb: isMobile ? 1 : 2, // Reduce bottom padding on mobile
      }}
    >
      <Box
        sx={{
          height: "100%", 
          width: "100%",
          background: theme === "dark" ? "#23272F" : "#F7F8FA",
          borderRadius: 3,
          border: 'none', 
          p: isMobile ? 1 : 2, // Reduce padding inside the DataGrid container on mobile
          mt: 0,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {isLoadingUsers ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography sx={{ ml: 2, color: theme === "dark" ? "#B0B3B8" : "#5F6368" }}>Loading users...</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filteredUsers}
            getRowId={(row) => row._id}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              background: 'transparent',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                '& strong': {
                  color: `${theme === "dark" ? "#F3F4F6" : "#222"} !important`,
                },
              },
              '& .MuiDataGrid-row': {
                backgroundColor: theme === "dark" ? "#181A20" : "#fff",
                color: theme === "dark" ? "#F3F4F6" : "#222",
                '&:nth-of-type(odd)': {
                  backgroundColor: theme === "dark" ? "#101014" : "#f9f9f9",
                },
                '&:hover': {
                  backgroundColor: theme === "dark" ? "transparent" : "#e0e0e0",
                },
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: theme === "dark" ? "#23272F" : "#F7F8FA",
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
              '& .MuiTablePagination-root': {
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
              '& .MuiDataGrid-cell': {
                color: theme === "dark" ? "#F3F4F6" : "#222",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 !important',
              },
              '& .MuiDataGrid-sortIcon': {
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
              '& .MuiDataGrid-menuIcon': {
                color: theme === "dark" ? "#F3F4F6" : "#222",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
} 