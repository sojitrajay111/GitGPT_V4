// components/ConfigurationDashboard.js
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Settings, Database, Edit, Trash2, Power } from 'lucide-react';
import ConfigurationWizard from './ConfigurationWizard';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

// Import Shadcn/ui's Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // THIS IS THE KEY CHANGE

/**
 * @typedef {Object} Configuration
 * @property {string} id
 * @property {string} title
 * @property {Array<{key: string, value: string}>} items
 * @property {string} createdAt
 * @property {boolean} isActive
 */

const ConfigurationDashboard = () => {
  const params = useParams();
  const userId = params.userId;
  const [configurations, setConfigurations] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Fetch configurations on component mount
  useEffect(() => {
    console.log('Current userId:', userId);
    if (userId) {
      fetchConfigurations();
    }
  }, [userId]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.get(
        `http://localhost:3001/api/configurations/${userId}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setConfigurations(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch configurations');
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      if (error.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Please log in again to continue.",
        });
      } else {
        toast.error("Error Loading Configurations", {
          description: error.message || "Failed to load configurations. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async (configData) => {
    try {
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.post(
        `http://localhost:3001/api/configurations/${userId}`,
        {
          configTitle: configData.title,
          configValue: configData.items.map(item => ({
        key: item.key,
        value: item.value
          })),
          isActive: true
        },
        getAuthHeaders()
      );

      if (response.data.success) {
      toast.success("Configuration Saved", {
        description: `${configData.title} has been ${editingConfig ? 'updated' : 'added'} successfully.`,
      });
      handleCloseWizard();
        fetchConfigurations(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      if (error.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Please log in again to continue.",
        });
      } else {
      toast.error("Error Saving Configuration", {
          description: error.message || "Failed to save configuration. Please try again.",
      });
      }
    }
  };

  const handleEditConfiguration = (config) => {
    // Transform the configuration data to match the wizard's expected format
    const transformedConfig = {
      title: config.configTitle,
      items: config.configValue.map(item => ({
        key: item.key,
        value: item.value
      })),
      isActive: config.isActive
    };
    setEditingConfig(transformedConfig);
    setIsWizardOpen(true);
  };

  const handleDeleteConfiguration = async (id) => {
    try {
      if (!userId) {
        throw new Error('User ID not found');
      }

      const configToDelete = configurations.find(config => config._id === id);
      if (!configToDelete) {
        throw new Error('Configuration not found');
      }

      const response = await axios.delete(
        `http://localhost:3001/api/configurations/${userId}/${configToDelete.configTitle}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
      toast.success("Configuration Deleted", {
        description: "The configuration has been removed successfully.",
      });
        fetchConfigurations(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      if (error.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Please log in again to continue.",
        });
      } else {
      toast.error("Error Deleting Configuration", {
          description: error.message || "Failed to delete configuration. Please try again.",
      });
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      if (!userId) {
        throw new Error('User ID not found');
      }

      const configToToggle = configurations.find(config => config._id === id);
      if (!configToToggle) {
        throw new Error('Configuration not found');
      }

      const response = await axios.patch(
        `http://localhost:3001/api/configurations/${userId}/${configToToggle.configTitle}/toggle`,
        {},
        getAuthHeaders()
      );
      
      if (response.data.success) {
        toast.info("Status Changed", {
          description: `${configToToggle.configTitle} is now ${response.data.data.isActive ? 'Active' : 'Inactive'}.`,
        });
        fetchConfigurations(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to toggle configuration status');
      }
    } catch (error) {
      console.error('Error toggling configuration status:', error);
      if (error.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Please log in again to continue.",
        });
      } else {
        toast.error("Error Changing Status", {
          description: error.message || "Failed to change configuration status. Please try again.",
        });
      }
    }
  };

  const handleOpenWizard = () => {
    setEditingConfig(null);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setEditingConfig(null);
    setIsWizardOpen(false);
  };

  // --- Table Column Definitions ---
  /** @type {ColumnDef<Configuration>[]} */
  const columns = [
    {
      accessorKey: "configTitle",
      header: "Service",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span role="img" aria-label="chip">💾</span>
          <div>
            <div className="font-semibold">{row.getValue("configTitle")}</div>
            <div className="text-xs text-muted-foreground">ID: {row.original._id}</div>
          </div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "configValue",
      header: "Sample value",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.configValue.map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {item.key}
            </Badge>
          ))}
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "success" : "secondary"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
      filterFn: (row, columnId, value) => {
        return row.getValue(columnId) === (value === "Active");
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      },
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const config = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditConfiguration(config)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(config._id)}>
                <Power className="mr-2 h-4 w-4" /> {config.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteConfiguration(config._id)} className="text-red-600 focus:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // --- TanStack Table Initialization ---
  const table = useReactTable({
    data: configurations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  });

  // --- Calculate summary stats ---
  const totalConfigurations = configurations.length;
  const activeConfigurations = configurations.filter(config => config.isActive).length;
  const lastUpdatedDate = configurations.length > 0
    ? new Date(Math.max(...configurations.map(c => new Date(c.createdAt).getTime()))).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuration Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage API settings and configurations for your tools
            </p>
          </div>
          <Button onClick={handleOpenWizard} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Configuration
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConfigurations}</div>
              <p className="text-xs text-muted-foreground">Overall count</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Configurations</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeConfigurations}</div>
              <p className="text-xs text-muted-foreground">Currently deployed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Badge variant="outline">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {lastUpdatedDate}
              </div>
              <p className="text-xs text-muted-foreground">Latest configuration change</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Configured Services</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {table.getFilteredRowModel().rows.length} of {configurations.length} configurations
            </p>
          </CardHeader>
          <CardContent>
            {/* Search Input for the table */}
            <div className="flex items-center py-4">
              <Input
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="max-w-sm"
              />
            </div>
            {/* The actual table rendering */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>

            {configurations.length === 0 && (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No configurations yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first configuration
                </p>
                <Button onClick={handleOpenWizard} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfigurationWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onSave={handleSaveConfiguration}
        editingConfig={editingConfig}
      />
    </div>
  );
};

export default ConfigurationDashboard;