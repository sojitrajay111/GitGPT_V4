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
  const [configurations, setConfigurations] = useState([
    {
      id: '1',
      title: 'ChatGPT API',
      items: [
        { key: 'api_key', value: 'sk-...' },
        { key: 'model', value: 'gpt-4' },
        { key: 'max_tokens', value: '2048' }
      ],
      createdAt: '2025-06-11',
      isActive: true
    },
    {
      id: '2',
      title: 'JIRA Settings',
      items: [
        { key: 'base_url', value: 'https://company.atlassian.net' },
        { key: 'username', value: 'user@company.com' },
        { key: 'api_token', value: 'ATATT...' }
      ],
      createdAt: '2025-06-10',
      isActive: false
    }
  ]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Handlers (remain mostly the same) ---
  const handleSaveConfiguration = (configData) => {
    if (editingConfig) {
      setConfigurations(configurations.map(config =>
        config.id === editingConfig.id
          ? { ...config, ...configData }
          : config
      ));
      toast.success("Configuration Updated", {
        description: `${configData.title} has been updated successfully.`,
      });
    } else {
      const newConfig = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        ...configData,
        isActive: true
      };
      setConfigurations([...configurations, newConfig]);
      toast.success("Configuration Added", {
        description: `${configData.title} has been added successfully.`,
      });
    }
    setEditingConfig(null);
    setIsWizardOpen(false);
  };

  const handleEditConfiguration = (config) => {
    setEditingConfig(config);
    setIsWizardOpen(true);
  };

  const handleDeleteConfiguration = (id) => {
    setConfigurations(configurations.filter(config => config.id !== id));
    toast.error("Configuration Deleted", {
      description: "The configuration has been removed successfully.",
    });
  };

  const handleToggleStatus = (id) => {
    setConfigurations(prevConfigs => {
      const updatedConfigs = prevConfigs.map(config =>
        config.id === id
          ? { ...config, isActive: !config.isActive }
          : config
      );
      const toggledConfig = updatedConfigs.find(config => config.id === id);
      if (toggledConfig) {
        toast.info("Status Changed", {
          description: `${toggledConfig.title} is now ${toggledConfig.isActive ? 'Active' : 'Inactive'}.`,
        });
      }
      return updatedConfigs;
    });
  };

  const handleOpenWizard = () => {
    setEditingConfig(null);
    setIsWizardOpen(true);
  };

  // --- Table Column Definitions ---
  /** @type {ColumnDef<Configuration>[]} */
  const columns = [
    {
      accessorKey: "title",
      header: "Service",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span role="img" aria-label="chip">💾</span>
          <div>
            <div className="font-semibold">{row.getValue("title")}</div>
            <div className="text-xs text-muted-foreground">ID: {row.original.id}</div>
          </div>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "items",
      header: "Sample value",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.items.map((item, index) => (
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
              <DropdownMenuItem onClick={() => handleToggleStatus(config.id)}>
                <Power className="mr-2 h-4 w-4" /> {config.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteConfiguration(config.id)} className="text-red-600 focus:text-red-700">
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
      globalFilter: searchTerm, // Connect global filter to searchTerm state
    },
    onGlobalFilterChange: setSearchTerm, // Update searchTerm when global filter changes
  });

  // --- Calculate summary stats ---
  const totalConfigurations = configurations.length;
  const activeConfigurations = configurations.filter(config => config.isActive).length;
  const lastUpdatedDate = configurations.length > 0
    ? new Date(Math.max(...configurations.map(c => new Date(c.createdAt).getTime()))).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

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

            {/* Pagination Controls (Optional, if you want pagination) */}
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
        onClose={() => setIsWizardOpen(false)}
        onSave={handleSaveConfiguration}
        editingConfig={editingConfig}
      />
    </div>
  );
};

export default ConfigurationDashboard;