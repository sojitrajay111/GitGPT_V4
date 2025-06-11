"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  InputAdornment,
  Avatar,
  Tooltip,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport
} from '@mui/x-data-grid';
import {
  Edit,
  Delete,
  Add,
  Search,
  CheckCircle,
  PendingActions,
  PlayCircleFilled,
  Cancel
} from '@mui/icons-material';

const statusOptions = [
  { value: 'Pending', label: 'Pending', color: 'warning', icon: <PendingActions /> },
  { value: 'In Progress', label: 'In Progress', color: 'info', icon: <PlayCircleFilled /> },
  { value: 'Completed', label: 'Completed', color: 'success', icon: <CheckCircle /> },
  { value: 'Rejected', label: 'Rejected', color: 'error', icon: <Cancel /> },
];

const initialUsers = [
  { id: 1, username: 'john_doe', email: 'john@example.com', status: 'Pending' },
  { id: 2, username: 'jane_smith', email: 'jane@example.com', status: 'Completed' },
  { id: 3, username: 'mike_johnson', email: 'mike@example.com', status: 'In Progress' },
  { id: 4, username: 'sara_wilson', email: 'sara@example.com', status: 'Rejected' },
  { id: 5, username: 'alex_carter', email: 'alex@example.com', status: 'Pending' },
  { id: 6, username: 'charlie_brown', email: 'charlie@example.com', status: 'In Progress' },
  { id: 7, username: 'diana_ross', email: 'diana@example.com', status: 'Completed' },
  { id: 8, username: 'eve_adams', email: 'eve@example.com', status: 'Pending' },
  { id: 9, username: 'frank_black', email: 'frank@example.com', status: 'In Progress' },
  { id: 10, username: 'grace_kelly', email: 'grace@example.com', status: 'Completed' },
  { id: 11, username: 'david_wilson_super_long_username', email: 'david.wilson.test@longdomainexample.com', status: 'Pending' },
  { id: 12, username: 'olivia_perez_max', email: 'olivia.perez.maximum@another-example.co.uk', status: 'In Progress' },
];

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 2, justifyContent: 'flex-start' }}>
      <GridToolbarFilterButton />
      <GridToolbarExport
        printOptions={{ disableToolbarButton: true }}
        sx={{ ml: 1 }}
      />
    </GridToolbarContainer>
  );
}

export default function ManageUser() {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    status: 'Pending'
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isEditing, setIsEditing] = useState(false); // New state to track if we're editing
  const [editingUserId, setEditingUserId] = useState(null); // New state to store the ID of the user being edited

  const handleOpen = () => {
    setIsEditing(false); // When opening for add, ensure isEditing is false
    setEditingUserId(null); // Clear editing user ID
    setNewUser({ username: '', email: '', status: 'Pending' }); // Reset form for new user
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewUser({ username: '', email: '', status: 'Pending' });
    setIsEditing(false); // Reset editing state on close
    setEditingUserId(null); // Clear editing user ID
  };

  const handleEdit = (user) => {
    setIsEditing(true); // Set editing state to true
    setEditingUserId(user.id); // Store the ID of the user being edited
    setNewUser({ ...user }); // Pre-fill the form with user data
    setOpen(true); // Open the dialog
  };

  const handleSaveUser = () => {
    // Basic validation
    if (!newUser.username.trim()) {
      setSnackbar({
        open: true,
        message: 'Username cannot be empty.',
        severity: 'error'
      });
      return;
    }
    if (!newUser.email.trim()) {
      setSnackbar({
        open: true,
        message: 'Email cannot be empty.',
        severity: 'error'
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing user
        setUsers(prev =>
          prev.map(user =>
            user.id === editingUserId
              ? { ...newUser, id: editingUserId } // Ensure ID is preserved
              : user
          )
        );
        setSnackbar({
          open: true,
          message: 'User updated successfully!',
          severity: 'success'
        });
      } else {
        // Add new user
        const newEntry = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          status: newUser.status,
        };
        setUsers(prev => [...prev, newEntry]);
        setSnackbar({
          open: true,
          message: 'User added successfully!',
          severity: 'success'
        });
      }
      handleClose();
      setLoading(false);
    }, 1000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
      setSnackbar({
        open: true,
        message: 'User deleted successfully!',
        severity: 'info'
      });
    }
  };

  const handleVerifyEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email);
    setSnackbar({
      open: true,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
      severity: isValid ? 'success' : 'error'
    });
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Index',
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 180,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => {
        const status = statusOptions.find(opt => opt.value === params.value);
        return (
          <Chip
            label={status.label}
            color={status.color}
            icon={status.icon}
            variant="outlined"
            size="small"
            sx={{ width: 'fit-content' }}
          />
        );
      },
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'action',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title="Edit user">
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)} // Call handleEdit with the row data
              sx={{ mr: 1 }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      headerAlign: 'center',
      align: 'center'
    },
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1200,
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpen}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
              mr: 2,
              ml: 57
            }}
          >
            Add User
          </Button>

          <TextField
            variant="outlined"
            placeholder="Search users..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            components={{
              Toolbar: CustomToolbar,
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f7fa',
                borderRadius: 1,
                borderBottom: 'none'
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#f5f7fa',
                borderRadius: 1,
                borderTop: 'none'
              },
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                width: '0px',
                height: '0px',
                background: 'transparent',
              },
              '& .MuiDataGrid-virtualScroller': {
                scrollbarWidth: 'none',
                overflowX: 'auto',
              },
              '-ms-overflow-style': 'none',
            }}
            disableRowSelectionOnClick
            onRowClick={(params) => console.log('Row clicked:', params)}
          />
        </Box>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3
          }}
        >
          {isEditing ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box mt={1} display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              variant="outlined"
            />
            <Button
              variant="outlined"
              onClick={() => setSnackbar({ open: true, message: 'Username verification not implemented.', severity: 'info' })}
              sx={{ height: 56, mt: 1 }}
            >
              Verify
            </Button>
          </Box>

          <Box mt={2} display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              variant="outlined"
            />
          </Box>

          
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser} // Now calls handleSaveUser
            disabled={loading || !newUser.username || !newUser.email}
            sx={{ borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update User' : 'Save User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}