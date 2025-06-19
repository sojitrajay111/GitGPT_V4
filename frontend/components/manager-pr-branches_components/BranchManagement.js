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
  Tooltip,
  Chip,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const BranchManagement = ({
  branches,
  branchesLoading,
  branchesError,
  handleOpenCreateBranchDialog,
  handleDeleteBranch,
  owner,
  repo,
  defaultBranchName,
  currentTheme,
}) => {
  const branchColumns = [
    {
      field: "name",
      headerName: "Branch",
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MuiLink
            href={`https://github.com/${owner}/${repo}/tree/${params.value}`}
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
          {params.row.isDefault && (
            <Chip
              label="Default"
              size="small"
              sx={{
                backgroundColor: currentTheme.palette.primary.light,
                color: currentTheme.palette.primary.contrastText,
                height: "20px",
              }}
            />
          )}
          {params.row.protected && (
            <Chip
              label="Protected"
              size="small"
              sx={{
                backgroundColor: currentTheme.palette.warning.light,
                color: currentTheme.palette.warning.contrastText,
                height: "20px",
              }}
            />
          )}
        </Box>
      ),
    },
    {
      field: "commitSha",
      headerName: "Last Commit",
      flex: 1,
      valueGetter: (params) => params.row?.commitSha?.substring(0, 7) || "N/A",
      renderCell: (params) =>
        params.row.commitSha ? (
          <Tooltip
            title={`View commit ${params.row.commitSha} on GitHub`}
            arrow
          >
            <MuiLink
              href={`https://github.com/${owner}/${repo}/commit/${params.row.commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "monospace",
                color: "text.secondary",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {params.value}
            </MuiLink>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<OpenInNewIcon fontSize="small" />}
          label="View on GitHub"
          onClick={() =>
            window.open(
              `https://github.com/${owner}/${repo}/tree/${params.row.name}`,
              "_blank"
            )
          }
          sx={{ color: "primary.main" }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon fontSize="small" />}
          label="Delete Branch"
          onClick={() => handleDeleteBranch(params.row.name)}
          disabled={params.row.isDefault || params.row.protected}
          sx={{
            color:
              params.row.isDefault || params.row.protected
                ? "text.disabled"
                : "error.main",
          }}
        />,
      ],
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
          <CallSplitIcon sx={{ mr: 1, color: "secondary.main" }} />{" "}
          Branches
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateBranchDialog}
        >
          New Branch
        </Button>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      {branchesLoading && (
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
            Loading branches...
          </Typography>
        </Box>
      )}
      {branchesError && (
        <Alert severity="error" icon={<ErrorOutlineIcon />}>
          Error loading branches:{" "}
          {branchesError.data?.message || branchesError.status}
        </Alert>
      )}
      {!branchesLoading && !branchesError && (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={branches}
            columns={branchColumns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            getRowId={(row) => row.name}
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