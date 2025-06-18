import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Link as MuiLink,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const PRManagement = ({
  pullRequests,
  prsLoading,
  prsError,
  handleOpenCreatePrDialog,
  handleOpenEditPrDialog,
  handleClosePR,
  user_role,
  developerPermissions,
  currentTheme,
}) => {
  const prColumns = [
    {
      field: "title",
      headerName: "Pull Request",
      flex: 2,
      renderCell: (params) => (
        <MuiLink
          href={params.row.html_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontWeight: 500,
            color: "#1976d2",
            transition: "color 0.2s",
            "&:hover": {
              textDecoration: "underline",
              color: "#1565c0",
            },
          }}
        >
          {params.value}
        </MuiLink>
      ),
    },
    {
      field: "user",
      headerName: "Author",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%", gap: 1 }}>
          <Avatar
            src={params.value.avatar_url}
            alt={params.value.login}
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{params.value.login}</Typography>
        </Box>
      ),
    },
    {
      field: "state",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor:
              params.value === "open"
                ? currentTheme.palette.success.light
                : currentTheme.palette.error.light,
            color:
              params.value === "open"
                ? currentTheme.palette.success.contrastText
                : currentTheme.palette.error.contrastText,
          }}
        />
      ),
    },
    {
      field: "reviewers",
      headerName: "Reviewers",
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.requested_reviewers?.map((reviewer) => (
            <Tooltip
              key={reviewer.id}
              title={`Reviewer: ${reviewer.login}`}
              arrow
            >
              <Avatar
                src={reviewer.avatar_url}
                alt={reviewer.login}
                sx={{ width: 24, height: 24 }}
              />
            </Tooltip>
          ))}
        </Box>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<OpenInNewIcon fontSize="small" />}
            label="View on GitHub"
            onClick={() => window.open(params.row.html_url, "_blank")}
            sx={{ color: "primary.main" }}
          />,
        ];

        if (
          (user_role === "manager" ||
            (user_role === "developer" &&
              developerPermissions?.canEditPRs)) &&
          params.row.state === "open"
        ) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit PR"
              onClick={() => handleOpenEditPrDialog(params.row)}
              sx={{ color: "info.main" }}
            />
          );
        }

        if (
          (user_role === "manager" ||
            (user_role === "developer" &&
              developerPermissions?.canClosePRs)) &&
          params.row.state === "open"
        ) {
          actions.push(
            <GridActionsCellItem
              icon={<CloseIcon fontSize="small" />}
              label="Close PR"
              onClick={() => handleClosePR(params.row.number)}
              sx={{ color: "error.main" }}
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 24px rgba(62,99,221,0.08)",
        p: { xs: 2, sm: 3 },
        mb: 4,
        border: `1px solid ${currentTheme.palette.divider}`,
        maxWidth: '100%',
        width: '100%',
        minWidth: 900,
        backgroundColor: currentTheme.palette.background.paper,
        color: currentTheme.palette.text.primary,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <MergeTypeIcon sx={{ mr: 1, color: "secondary.main" }} />{" "}
          Pull Requests
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreatePrDialog}
        >
          New Pull Request
        </Button>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      {prsLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: 5,
            flexDirection: "column",
          }}
        >
          <CircularProgress />
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "text.secondary" }}
          >
            Loading pull requests...
          </Typography>
        </Box>
      )}
      {prsError && (
        <Alert severity="error" icon={<ErrorOutlineIcon />}>
          Error loading pull requests:{" "}
          {prsError.data?.message || prsError.status}
        </Alert>
      )}
      {!prsLoading && !prsError && (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={pullRequests}
            columns={prColumns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            autoHeight={false}
            slots={{ toolbar: GridToolbar }}
            sx={{
              borderRadius: 3,
              background: currentTheme.palette.background.paper,
              width: '100%',
              minWidth: 900,
              color: currentTheme.palette.text.primary,
              border: `1px solid ${currentTheme.palette.divider}`,
              "& .MuiDataGrid-row": {
                backgroundColor: currentTheme.palette.background.paper,
                "&:nth-of-type(even)": {
                  backgroundColor: currentTheme.palette.background.default,
                },
                "&:hover": {
                  backgroundColor: currentTheme.palette.action.hover,
                },
              },
              "& .MuiDataGrid-columnHeaders": {
                background: currentTheme.palette.background.default,
                color: currentTheme.palette.primary.main,
                fontWeight: 700,
                fontSize: "1rem",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottom: `1px solid ${currentTheme.palette.divider}`,
              },
              "& .MuiDataGrid-cell": {
                fontSize: "0.97rem",
                color: currentTheme.palette.text.primary,
                borderBottom: `1px solid ${currentTheme.palette.divider}`,
              },
              "& .MuiDataGrid-footerContainer": {
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                background: currentTheme.palette.background.paper,
                borderTop: `1px solid ${currentTheme.palette.divider}`,
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}; 