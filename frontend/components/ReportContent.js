import React from 'react';

// UI Components (moved from original DashboardPage for self-containment)
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function ReportContent() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Project Analytics</h2>
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last quarter</option>
          </select>
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tasks Completed" value={127} />
        <StatCard label="Avg. Completion Time" value="2.3d" />
        <StatCard label="Team Productivity" value="84%" />
        <StatCard label="Pending Reviews" value={9} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Project Progress</h3>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 h-64 rounded-lg flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Task Distribution</h3>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 h-64 rounded-lg flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Activity Timeline</h3>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 h-52 rounded-lg flex items-center justify-center text-gray-400">
          Chart Placeholder
        </div>
      </div>
    </div>
  );
}