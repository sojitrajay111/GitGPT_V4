// components/CollaboratorsTable.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  Chip,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { alpha } from "@mui/system";

const COLLABORATOR_STATUS_COLORS = {
  accepted: "success",
  pending: "warning",
  declined: "error",
};

/**
 * CollaboratorsTable Component
 * Displays a table of project collaborators with their status and permissions.
 * Allows managers to add, edit, and delete collaborators.
 *
 * @param {object} props - Component props.
 * @param {object} props.activeTheme - The currently active Material-UI theme.
 * @param {Array<object>} props.collaborators - List of collaborator data objects.
 * @param {string} props.user_role - Current user's role ('manager' or 'developer').
 * @param {boolean} props.collaboratorsLoading - Loading state for collaborators data.
 * @param {boolean} props.collaboratorsIsError - Error state for collaborators data.
 * @param {object} props.collaboratorsError - Error object for collaborators data.
 * @param {string} props.collaboratorSearchFilter - Current filter string for collaborator search.
 * @param {function} props.setCollaboratorSearchFilter - Callback to set the collaborator search filter.
 * @param {function} props.handleOpenAddDialog - Callback to open the add collaborator dialog.
 * @param {function} props.handleOpenEditCollaboratorDialog - Callback to open the edit collaborator permissions dialog.
 * @param {function} props.handleOpenDeleteCollaboratorDialog - Callback to open the delete collaborator dialog.
 */
const CollaboratorsTable = ({
  activeTheme,
  collaborators,
  user_role,
  collaboratorsLoading,
  collaboratorsIsError,
  collaboratorsError,
  collaboratorSearchFilter,
  setCollaboratorSearchFilter,
  handleOpenAddDialog,
  handleOpenEditCollaboratorDialog,
  handleOpenDeleteCollaboratorDialog,
}) => {
  const filteredCollaborators = collaborators.filter((collab) =>
    collab.username
      .toLowerCase()
      .includes(collaboratorSearchFilter.toLowerCase())
  );

  return (
    <Box className="mb-8 ">
      <Box className="flex justify-between items-center flex-wrap mb-4">
        <Box className="flex items-center mb-4 sm:mb-0 mt-5">
          <PeopleIcon
            className="mr-3 text-3xl"
            sx={{ color: activeTheme.palette.primary.main }}
          />
          <Typography
            variant="h5"
            component="h2"
            className="font-bold"
            sx={{ color: activeTheme.palette.text.primary }}
          >
            Team Collaborators
          </Typography>
          <Chip
            label={`${collaborators.length} members`}
            size="medium"
            color="primary"
            className="ml-3 font-semibold text-sm px-2 py-1"
          />
        </Box>

        {user_role === "manager" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddDialog}
            startIcon={<AddIcon />}
            size="large"
          >
            Add Collaborator
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 6, borderColor: activeTheme.palette.divider }} />

      {collaboratorsLoading ? (
        <Box className="flex justify-center py-10">
          <CircularProgress
            size={40}
            sx={{ color: activeTheme.palette.primary.main }}
          />
        </Box>
      ) : collaboratorsIsError ? (
        <Alert severity="error" className="rounded-xl">
          {collaboratorsError?.data?.message || "Error loading collaborators"}
        </Alert>
      ) : (
        <Card
          className="p-0 overflow-hidden"
          sx={{
            bgcolor: activeTheme.palette.background.paper,
            border: `1px solid ${activeTheme.palette.divider}`,
          }}
        >
          <Box className="p-4">
            <TextField
              fullWidth
              label="Search Collaborators"
              variant="outlined"
              size="small"
              value={collaboratorSearchFilter}
              onChange={(e) => setCollaboratorSearchFilter(e.target.value)}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <PeopleIcon
                    sx={{
                      color: activeTheme.palette.text.secondary,
                      mr: 1,
                    }}
                  />
                ),
              }}
            />
          </Box>
          {filteredCollaborators.length > 0 ? (
            <Box className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr
                    sx={{
                      bgcolor: activeTheme.palette.background.paper,
                      borderBottom: `1px solid ${activeTheme.palette.divider}`,
                    }}
                  >
                    <th
                      className="py-3 px-6 text-left"
                      sx={{ color: activeTheme.palette.text.secondary }}
                    >
                      Collaborator
                    </th>
                    <th
                      className="py-3 px-6 text-left"
                      sx={{ color: activeTheme.palette.text.secondary }}
                    >
                      Status
                    </th>
                    <th
                      className="py-3 px-6 text-left hidden md:table-cell"
                      sx={{ color: activeTheme.palette.text.secondary }}
                    >
                      Permissions
                    </th>
                    {user_role === "manager" && (
                      <th
                        className="py-3 px-6 text-center"
                        sx={{ color: activeTheme.palette.text.secondary }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCollaborators.map((collab) => (
                    <tr
                      key={collab.githubId || collab.username}
                      className="border-b transition-colors duration-200"
                      sx={{
                        borderColor: activeTheme.palette.divider,
                        "&:hover": {
                          bgcolor: activeTheme.palette.action.hover,
                        },
                      }}
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <Box className="flex items-center">
                          <Avatar
                            src={collab.avatarUrl}
                            alt={collab.username}
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 2,
                              border: `2px solid ${activeTheme.palette.secondary.main}`,
                            }}
                          />
                          <Typography
                            variant="body1"
                            className="font-medium"
                            sx={{ color: activeTheme.palette.text.primary }}
                          >
                            {collab.username}
                          </Typography>
                        </Box>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <Chip
                          label={collab.status}
                          size="small"
                          color={
                            COLLABORATOR_STATUS_COLORS[collab.status] ||
                            "default"
                          }
                          className="font-semibold text-xs py-1 px-2"
                          sx={{
                            backgroundColor: alpha(
                              activeTheme.palette[
                                COLLABORATOR_STATUS_COLORS[collab.status]
                              ]?.main || activeTheme.palette.text.secondary,
                              0.1
                            ),
                            color:
                              activeTheme.palette[
                                COLLABORATOR_STATUS_COLORS[collab.status]
                              ]?.main || activeTheme.palette.text.primary,
                          }}
                        />
                      </td>
                      <td className="py-3 px-6 text-left hidden md:table-cell">
                        <Box className="flex flex-wrap gap-1">
                          {collab.permissions &&
                          collab.permissions.length > 0 ? (
                            collab.permissions.map((perm) => (
                              <Chip
                                key={perm}
                                label={perm}
                                size="small"
                                color="primary"
                                className="font-semibold text-xs px-2 py-0.5"
                                sx={{
                                  backgroundColor: alpha(
                                    activeTheme.palette.primary.light,
                                    0.1
                                  ),
                                  color: activeTheme.palette.primary.light,
                                }}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                color: activeTheme.palette.text.secondary,
                              }}
                              className="italic"
                            >
                              No specific permissions
                            </Typography>
                          )}
                        </Box>
                      </td>
                      {user_role === "manager" && (
                        <td className="py-3 px-6 text-center">
                          <Box className="flex justify-center gap-2">
                            <IconButton
                              aria-label="edit"
                              onClick={() =>
                                handleOpenEditCollaboratorDialog(collab)
                              }
                              sx={{
                                color: activeTheme.palette.primary.main,
                                bgcolor: alpha(
                                  activeTheme.palette.primary.main,
                                  0.1
                                ),
                                "&:hover": {
                                  bgcolor: alpha(
                                    activeTheme.palette.primary.main,
                                    0.2
                                  ),
                                },
                              }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() =>
                                handleOpenDeleteCollaboratorDialog(collab)
                              }
                              sx={{
                                color: activeTheme.palette.error.main,
                                bgcolor: alpha(
                                  activeTheme.palette.error.main,
                                  0.1
                                ),
                                "&:hover": {
                                  bgcolor: alpha(
                                    activeTheme.palette.error.main,
                                    0.2
                                  ),
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box
              className="text-center py-10 px-4 border border-dashed rounded-xl m-4"
              sx={{ borderColor: activeTheme.palette.divider }}
            >
              <PeopleIcon
                className="text-6xl mb-4"
                sx={{ color: alpha(activeTheme.palette.primary.main, 0.4) }}
              />
              <Typography
                variant="h6"
                className="mb-2"
                sx={{ color: activeTheme.palette.text.primary }}
              >
                No collaborators yet
              </Typography>
              <Typography
                variant="body2"
                className="mb-4"
                sx={{ color: activeTheme.palette.text.secondary }}
              >
                Start building your team by adding new collaborators to this
                project.
              </Typography>
              {user_role === "manager" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  size="medium"
                >
                  Add Your First Collaborator
                </Button>
              )}
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default CollaboratorsTable;
