'use client';
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaSave, FaSearch, FaPlus, FaGithub, FaEnvelope, FaKey } from 'react-icons/fa';

const GitHubIntegrations = () => {
    const [githubAccounts, setGitHubAccounts] = useState([]);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        githubUsername: '',
        githubEmail: '',
        githubToken: '',
    });
    const [showForm, setShowForm] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Initialize with mock data
    useEffect(() => {
        setGitHubAccounts([
            {
                id: 'gh-12345',
                githubUsername: 'user_alpha',
                githubEmail: 'user.alpha@example.com',
                githubToken: 'ghp_abc123def456ghi789jkl0mnpqr',
                status: 'Active',
                created: new Date().toLocaleDateString(),
            },
            {
                id: 'gh-67890',
                githubUsername: 'developer_beta',
                githubEmail: 'dev.beta@example.com',
                githubToken: 'ghp_xyz987uvw654tsr321qpo0mlkj',
                status: 'Active',
                created: new Date().toLocaleDateString(),
            },
            {
                id: 'gh-11223',
                githubUsername: 'manager_gamma',
                githubEmail: 'mgr.gamma@example.com',
                githubToken: 'ghp_opq123rst456uvw789xyz0abcde',
                status: 'Active',
                created: new Date().toLocaleDateString(),
            },
        ]);
        setShowForm(false);
    }, []);

    const handleSave = () => {
        if (!formData.githubUsername || !formData.githubEmail || !formData.githubToken) {
            alert('Please fill in all fields: Username, Email, and Token');
            return;
        }

        if (editId) {
            // Update existing account
            setGitHubAccounts(prev => 
                prev.map(acc => 
                    acc.id === editId ? { ...acc, ...formData } : acc
                )
            );
        } else {
            // Add new account
            const newAccount = {
                id: `gh-${Date.now()}`,
                ...formData,
                status: 'Active',
                created: new Date().toLocaleDateString(),
            };
            setGitHubAccounts(prev => [...prev, newAccount]);
        }

        resetForm();
    };

    const handleEdit = (account) => {
        setEditId(account.id);
        setFormData({
            githubUsername: account.githubUsername,
            githubEmail: account.githubEmail,
            githubToken: account.githubToken,
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this GitHub integration?')) {
            setGitHubAccounts(prev => prev.filter(acc => acc.id !== id));
        }
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({
            githubUsername: '',
            githubEmail: '',
            githubToken: '',
        });
        setShowForm(false);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const filteredAccounts = [...githubAccounts].sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    }).filter(account =>
        account.githubUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.githubEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SortIndicator = ({ columnKey }) => (
        <span className="ml-1">
            {sortConfig.key === columnKey && (
                sortConfig.direction === 'ascending' ? '↑' : '↓'
            )}
        </span>
    );

    return (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-2xl font-bold text-gray-700 mb-3 mt-2 pl-3 border-l-4 border-blue-500 italic">
                    GitHub Integrations
                </h4>
            </div>


            {/* Add/Edit Form */}
            {(showForm || githubAccounts.length === 0) && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        {editId ? 'Edit GitHub Integration' : 'Add New GitHub Integration'}
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.githubUsername}
                                    onChange={(e) => handleFormChange('githubUsername', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter GitHub username"
                                />
                                <FaGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">GitHub Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.githubEmail}
                                    onChange={(e) => handleFormChange('githubEmail', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter GitHub email"
                                />
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Access Token</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={formData.githubToken}
                                    onChange={(e) => handleFormChange('githubToken', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter GitHub access token"
                                />
                                <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                <FaSave className="mr-2" />
                                {editId ? 'Update Integration' : 'Add Integration'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-md font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accounts Table */}
            {githubAccounts.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    
                        <div className="flex space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search integrations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                         
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('githubUsername')}
                                    >
                                        <div className="flex items-center">
                                            Username
                                            <SortIndicator columnKey="githubUsername" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('githubEmail')}
                                    >
                                        <div className="flex items-center">
                                            Email
                                            <SortIndicator columnKey="githubEmail" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Access Token
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md mr-3">
                                                    <FaGithub className="text-gray-700" />
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {account.githubUsername}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {account.githubEmail}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {account.githubToken 
                                                ? `${account.githubToken.slice(-4)}` 
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {account.created}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(account)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-blue-50"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(account.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-md hover:bg-red-50"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredAccounts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-500">No GitHub integrations found matching your search</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <div>Showing {filteredAccounts.length} of {githubAccounts.length} entries</div>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GitHubIntegrations;