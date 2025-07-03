import { Box, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, Paper, Button } from "@mui/material";
import React from "react";
import SyncIcon from "@mui/icons-material/Sync";

export default function BranchSyncBar({ project }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { branches, loading: branchesLoading } = useGithubBranches(project?.githubRepoLink);
  const [selectedBranch, setSelectedBranch] = React.useState("");

  React.useEffect(() => {
    if (branches.length > 0) setSelectedBranch(branches[0].name);
  }, [branches]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 3,
        mb: 4,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        gap: 3,
        bgcolor: "rgba(40,40,50,0.7)",
        borderRadius: 4,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        width: "100%",
        maxWidth: 700,
        mx: "auto",
      }}
    >
      <FormControl
        size="small"
        sx={{
          minWidth: 180,
          flex: 1,
          mb: isMobile ? 2 : 0,
          bgcolor: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <InputLabel sx={{ color: "#fff" }}>Branch</InputLabel>
        <Select
          value={selectedBranch}
          label="Branch"
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={branchesLoading}
          sx={{
            color: "#fff",
            ".MuiOutlinedInput-notchedOutline": { border: 0 },
            "& .MuiSvgIcon-root": { color: "#fff" },
            bgcolor: "transparent",
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: "#23232b",
                color: "#fff",
                borderRadius: 2,
                mt: 1,
              },
            },
          }}
        >
          {branches.map((b) => (
            <MenuItem key={b.name} value={b.name}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ flex: isMobile ? "unset" : 1, width: isMobile ? "100%" : "auto" }}>
        <SyncContributionsButton
          projectId={project._id}
          branchName={selectedBranch}
          repoUrl={project.githubRepoLink}
          ButtonProps={{
            startIcon: <SyncIcon />,
            sx: {
              width: "100%",
              background: "linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)",
              color: "#23232b",
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(160,140,210,0.18)",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              transition: "all 0.2s",
              '&:hover': {
                background: "linear-gradient(90deg, #fbc2eb 0%, #a18cd1 100%)",
                transform: "scale(1.04)",
                boxShadow: "0 6px 24px rgba(160,140,210,0.22)",
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
} 