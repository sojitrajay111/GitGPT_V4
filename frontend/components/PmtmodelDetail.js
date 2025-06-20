'use client';
import React, { useState } from 'react';
import { FaProjectDiagram, FaTrash, FaEdit, FaSave, FaSearch, FaLink, FaEnvelope, FaKey } from 'react-icons/fa';

const pmtModelOptions = ['Jira', 'Asana', 'Salesforce', 'Service Management'];

const PmtModelDetail = () => {
    const [selectedPmtModel, setSelectedPmtModel] = useState('');
    const [jiraUrl, setJiraUrl] = useState('');
    const [jiraEmail, setJiraEmail] = useState('');
    const [jiraToken, setJiraToken] = useState('');
    const [pmtData, setPmtData] = useState([]);
    const [showPmtForm, setShowPmtForm] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const handlePmtSave = () => {
        if (!selectedPmtModel || !jiraUrl || !jiraEmail || !jiraToken) {
            alert('Please fill in all fields for PMT Model: Model Name, Jira URL, Jira Email, and Jira Token.');
            return;
        }

        const newItem = {
            id: Date.now(),
            name: selectedPmtModel,
            url: jiraUrl,
            email: jiraEmail,
            token: jiraToken,
            status: 'Active',
            icon: getPmtModelIcon(selectedPmtModel),
            created: new Date().toLocaleDateString(),
        };

        setPmtData([...pmtData, newItem]);
        setSelectedPmtModel('');
        setJiraUrl('');
        setJiraEmail('');
        setJiraToken('');
        setShowPmtForm(false);
    };

    const handlePmtDelete = (id) => {
        const updatedData = pmtData.filter(item => item.id !== id);
        setPmtData(updatedData);
        if (updatedData.length === 0) {
            setShowPmtForm(true);
        }
    };

    const getPmtModelIcon = (model) => {
        switch (model) {
            case 'Jira': return <FaProjectDiagram className="text-sky-600" />;
            case 'Asana': return <FaProjectDiagram className="text-fuchsia-600" />;
            case 'Salesforce': return <FaProjectDiagram className="text-orange-600" />;
            case 'Service Management': return <FaProjectDiagram className="text-teal-600" />;
            default: return <FaProjectDiagram />;
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredPmtData = [...pmtData].sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    }).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.token.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SortIndicator = ({ columnKey }) => (
        <span className="ml-1">
            {sortConfig.key === columnKey && (
                sortConfig.direction === 'ascending' ? '↑' : '↓'
            )}
        </span>
    );

    return (
        <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-2xl font-bold text-gray-700 mb-3 pl-3 border-l-4 border-blue-500 italic">
                    PMT Model
                </h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">PMT Model Configuration</h3>
                        <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <FaProjectDiagram className="text-purple-700" />
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Add and manage Project Management Tool configurations</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Active PMT Models</h3>
                        <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-green-700">{pmtData.length}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Currently configured PMT models</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Recent PMT Activity</h3>
                        <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-amber-700 font-bold">+</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Last update: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {showPmtForm && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New PMT Model</h2>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">PMT Model Name</label>
                            <select
                                value={selectedPmtModel}
                                onChange={(e) => setSelectedPmtModel(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a PMT model</option>
                                {pmtModelOptions.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedPmtModel && (
                            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
                                <div className="flex items-center mb-4">
                                    {getPmtModelIcon(selectedPmtModel)}
                                    <h3 className="ml-2 font-medium text-gray-700">{selectedPmtModel} Configuration</h3>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Jira URL</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={jiraUrl}
                                            onChange={(e) => setJiraUrl(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter Jira URL (e.g., https://yourcompany.atlassian.net)"
                                        />
                                        <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Jira Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={jiraEmail}
                                            onChange={(e) => setJiraEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter Jira Email"
                                        />
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Jira Token</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={jiraToken}
                                            onChange={(e) => setJiraToken(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter Jira API Token"
                                        />
                                        <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePmtSave}
                                    className="flex items-center justify-center w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-md font-medium transition-colors duration-200"
                                >
                                    <FaSave className="mr-2" />
                                    Save Configuration
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {pmtData.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">Configured PMT Models</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search PMT models..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 hide-scrollbar">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Model
                                            <SortIndicator columnKey="name" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('url')}
                                    >
                                        <div className="flex items-center">
                                            URL
                                            <SortIndicator columnKey="url" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('email')}
                                    >
                                        <div className="flex items-center">
                                            Email
                                            <SortIndicator columnKey="email" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('token')}
                                    >
                                        <div className="flex items-center">
                                            Token
                                            <SortIndicator columnKey="token" />
                                        </div>
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
                                {filteredPmtData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md mr-3">
                                                    {row.icon}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{row.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {row.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                                {row.url}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {row.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {row.token ? `${row.token.substring(0, 4)}...${row.token.substring(row.token.length - 4)}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {row.created}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-blue-50">
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handlePmtDelete(row.id)}
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

                        {filteredPmtData.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-500">No PMT models found matching your search</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <div>Showing {filteredPmtData.length} of {pmtData.length} entries</div>
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
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default PmtModelDetail;
