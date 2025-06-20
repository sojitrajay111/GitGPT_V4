import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { SynthButton } from "../ui/SynthButton";

const FilterBar = ({ isDark, showFilters, setShowFilters }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2,
      mb: 4,
      background: isDark ? "#161717" : "#F5F6FA",
      borderRadius: 4,
      boxShadow: isDark
        ? 'inset 8px 8px 24px #181A20, inset -8px -8px 24px #23242A, 0 2px 12px 0 rgba(0,0,0,0.25)'
        : 'inset 4px 4px 16px #e5e7eb, inset -4px -4px 16px #fff, 0 2px 8px 0 rgba(100,120,150,0.04)',
      p: 2,
      border: isDark ? '1px solid #444' : '1px solid #e5e7eb',
    }}
  >
    {/* Search */}
    <TextField
      variant="outlined"
      placeholder="Search artifacts..."
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 220 },
        background: isDark ? "#2f2f2f" : "#fff",
        borderRadius: 1,
        border: isDark ? '1px  #e5e7eb' : '1px  #e5e7eb',
        boxShadow: isDark
          ? 'inset 4px 4px 12px #181A20, inset -4px -4px 12px #23242A'
          : 'inset 2px 2px 8px #e5e7eb, inset -2px -2px 8px #fff',
        input: { color: isDark ? "#fff" : "#23242A" },
        mb: { xs: 2, sm: 0 },
      }}
      size="small"
      fullWidth={true}
    />
    {/* Show Filters toggle */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: isDark ? "#2f2f2f" : "#fff",
        borderRadius: 3,
        px: 2,
        boxShadow: isDark
          ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
          : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
        minWidth: { xs: '100%', sm: 120 },
        height: 40,
        border: isDark ? '1px solid #e5e7eb' : '1px solid #e5e7eb',
        mb: { xs: 2, sm: 0 },
      }}
    >
      <Typography sx={{ color: isDark ? "#E5E7EB" : "#23242A", fontWeight: 500, mr: 1 }}>
        Show Filters
      </Typography>
      <SynthButton
        size="sm"
        variant="flat"
        style={{ minWidth: 40, width: 40, height: 24, padding: 0, background: 'none', boxShadow: 'none' }}
        onClick={() => setShowFilters((prev) => !prev)}
      >
        <Box sx={{ width: 32, height: 18, background: isDark ? "#333" : "#ddd", borderRadius: 9, position: "relative", transition: 'background 0.2s' }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              background: showFilters ? (isDark ? "#6366F1" : "#6366F1") : (isDark ? "#888" : "#fff"),
              borderRadius: "50%",
              position: "absolute",
              left: showFilters ? 16 : 2,
              top: 2,
              transition: 'left 0.2s, background 0.2s',
            }}
          />
        </Box>
      </SynthButton>
    </Box>
    {/* Filters (only if showFilters is true) */}
    {showFilters && (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
        <TextField
          select
          size="small"
          variant="outlined"
          defaultValue="All Projects"
          sx={{
            minWidth: { xs: '100%', sm: 120 },
            background: isDark ? "#2f2f2f" : "#fff",
            borderRadius: 1,
            border: isDark ? '1px #e5e7eb' : '1px  #e5e7eb',
            boxShadow: isDark
              ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
              : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
            color: isDark ? '#E5E7EB' : '#23242A',
            '& .MuiInputBase-input, & .MuiSelect-select': {
              color: isDark ? '#E5E7EB' : '#23242A',
            },
            mb: { xs: 2, sm: 0 },
          }}
          SelectProps={{ native: true }}
          fullWidth={true}
        >
          <option>All Projects</option>
        </TextField>
        <TextField
          select
          size="small"
          variant="outlined"
          defaultValue="All Sprints"
          sx={{
            minWidth: { xs: '100%', sm: 120 },
            background: isDark ? "#2f2f2f" : "#fff",
            borderRadius: 1,
            border: isDark ? '1px  #e5e7eb' : '1px #e5e7eb',
            boxShadow: isDark
              ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
              : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
            color: isDark ? '#E5E7EB' : '#23242A',
            '& .MuiInputBase-input, & .MuiSelect-select': {
              color: isDark ? '#E5E7EB' : '#23242A',
            },
            mb: { xs: 2, sm: 0 },
          }}
          SelectProps={{ native: true }}
          fullWidth={true}
        >
          <option>All Sprints</option>
        </TextField>
        <TextField
          select
          size="small"
          variant="outlined"
          defaultValue="All Types"
          sx={{
            minWidth: { xs: '100%', sm: 120 },
            background: isDark ? "#2f2f2f" : "#fff",
            borderRadius: 1,
            border: isDark ? '1px #e5e7eb' : '1px #e5e7eb',
            boxShadow: isDark
              ? 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23242A'
              : 'inset 1px 1px 4px #e5e7eb, inset -1px -1px 4px #fff',
            color: isDark ? '#E5E7EB' : '#23242A',
            '& .MuiInputBase-input, & .MuiSelect-select': {
              color: isDark ? '#E5E7EB' : '#23242A',
            },
            mb: { xs: 2, sm: 0 },
          }}
          SelectProps={{ native: true }}
          fullWidth={true}
        >
          <option>All Types</option>
        </TextField>
      </Box>
    )}
  </Box>
);

export default FilterBar; 