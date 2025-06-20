'use client';
import React, { useState } from 'react';
import { FaRobot, FaTrash, FaEdit, FaSave, FaSearch, FaKey } from 'react-icons/fa';

const gptModelOptions = ['ChatGPT', 'Gemini', 'Claude', 'Copilot'];

const GptmodelDetail = () => {
    const [selectedGptModel, setSelectedGptModel] = useState('');
    const [gptVersion, setGptVersion] = useState('');
    const [gptApiKey, setGptApiKey] = useState('');
    const [gptData, setGptData] = useState([]);
    const [showGptForm, setShowGptForm] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const handleGptSave = () => {
        if (!selectedGptModel || !gptVersion || !gptApiKey) {
            alert('Please fill in all fields for GPT Model: Model Name, Version, and API Key.');
            return;
        }

        const newItem = {
            id: Date.now(),
            name: selectedGptModel,
            version: gptVersion,
            apiKey: gptApiKey,
            status: 'Active',
            icon: getGptModelIcon(selectedGptModel),
            created: new Date().toLocaleDateString(),
        };

        setGptData([...gptData, newItem]);
        setSelectedGptModel('');
        setGptVersion('');
        setGptApiKey('');
        setShowGptForm(false);
    };

    const handleGptDelete = (id) => {
        const updatedData = gptData.filter(item => item.id !== id);
        setGptData(updatedData);
        if (updatedData.length === 0) {
            setShowGptForm(true);
        }
    };

    const getGptModelIcon = (model) => {
        switch (model) {
            case 'ChatGPT': return <FaRobot className="text-blue-600" />;
            case 'Gemini': return <div className="bg-amber-500 text-white p-1 rounded text-xs font-medium">G</div>;
            case 'Claude': return <div className="bg-rose-500 text-white p-1 rounded text-xs font-medium">C</div>;
            case 'Copilot': return <div className="bg-blue-500 text-white p-1 rounded text-xs font-medium">C</div>;
            default: return <FaRobot />;
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredGptData = [...gptData].sort((a, b) => {
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
        item.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.apiKey.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h4 className="text-2xl font-bold text-gray-700 mb-3 pl-3 border-l-4 border-blue-500 italic">
                    GPT Model
                </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">GPT Model Configuration</h3>
                        <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <FaRobot className="text-blue-700" />
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Add and manage GPT model configurations</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Active GPT Models</h3>
                        <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-green-700">{gptData.length}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Currently deployed GPT models</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Recent GPT Activity</h3>
                        <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-amber-700 font-bold">+</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">Last update: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {showGptForm && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New GPT Model</h2>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Model Name</label>
                            <select
                                value={selectedGptModel}
                                onChange={(e) => setSelectedGptModel(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select a GPT model</option>
                                {gptModelOptions.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedGptModel && (
                            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
                                <div className="flex items-center mb-4">
                                    {getGptModelIcon(selectedGptModel)}
                                    <h3 className="ml-2 font-medium text-gray-700">{selectedGptModel} Configuration</h3>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Model Version</label>
                                    <input
                                        type="text"
                                        value={gptVersion}
                                        onChange={(e) => setGptVersion(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter version (e.g., 4.0)"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">API Key</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={gptApiKey}
                                            onChange={(e) => setGptApiKey(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter API Key"
                                        />
                                        <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleGptSave}
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

            {gptData.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">Configured GPT Models</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search GPT models..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                                        onClick={() => handleSort('version')}
                                    >
                                        <div className="flex items-center">
                                            Version
                                            <SortIndicator columnKey="version" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('apiKey')}
                                    >
                                        <div className="flex items-center">
                                            API Key
                                            <SortIndicator columnKey="apiKey" />
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
                                {filteredGptData.map((row) => (
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
                                                {row.version}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {row.apiKey ? `${row.apiKey.substring(0, 4)}...${row.apiKey.substring(row.apiKey.length - 4)}` : 'N/A'}
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
                                                    onClick={() => handleGptDelete(row.id)}
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

                        {filteredGptData.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-500">No GPT models found matching your search</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <div>Showing {filteredGptData.length} of {gptData.length} entries</div>
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

export default GptmodelDetail;
