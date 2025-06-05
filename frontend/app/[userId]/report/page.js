"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Recharts is a great library for visualizing data in React.
// It's chosen for its flexibility and comprehensive set of chart types.

// UI Component for displaying key statistics
function StatCard({ label, value, unit = "" }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{label}</h3>
      <p className="text-3xl font-bold text-indigo-700">
        {value}
        {unit}
      </p>
    </div>
  );
}

// Static Data for the Charts
const developerActivityData = [
  { name: "Mon", "Hours Worked": 8, "Tasks Completed": 3 },
  { name: "Tue", "Hours Worked": 7.5, "Tasks Completed": 4 },
  { name: "Wed", "Hours Worked": 8.5, "Tasks Completed": 3 },
  { name: "Thu", "Hours Worked": 9, "Tasks Completed": 5 },
  { name: "Fri", "Hours Worked": 7, "Tasks Completed": 2 },
  { name: "Sat", "Hours Worked": 4, "Tasks Completed": 1 },
  { name: "Sun", "Hours Worked": 2, "Tasks Completed": 0 },
];

const codeContributionData = [
  { name: "Jan", "Developer LOC": 4000, "AI Generated LOC": 2400 },
  { name: "Feb", "Developer LOC": 3000, "AI Generated LOC": 1398 },
  { name: "Mar", "Developer LOC": 2000, "AI Generated LOC": 9800 },
  { name: "Apr", "Developer LOC": 2780, "AI Generated LOC": 3908 },
  { name: "May", "Developer LOC": 1890, "AI Generated LOC": 4800 },
  { name: "Jun", "Developer LOC": 2390, "AI Generated LOC": 3800 },
];

const aiImpactData = [
  { name: "Feature A", "Time Reduced (Hours)": 15, "Cost Saved ($)": 750 },
  { name: "Feature B", "Time Reduced (Hours)": 10, "Cost Saved ($)": 500 },
  { name: "Feature C", "Time Reduced (Hours)": 20, "Cost Saved ($)": 1000 },
  { name: "Feature D", "Time Reduced (Hours)": 8, "Cost Saved ($)": 400 },
];

const developerVelocityData = [
  { name: "Before AI", value: 5.2 },
  { name: "With AI", value: 2.8 },
];

const projectStatusData = [
  { name: "Completed Projects", value: 60 },
  { name: "In Progress", value: 35 },
  { name: "On Hold", value: 5 },
];

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"]; // Shades of indigo and blue for light theme

export default function ReportContent() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          Project Analytics Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <select className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-base font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last quarter</option>
            <option>Last year</option>
          </select>
          <button className="flex items-center px-6 py-2 border border-indigo-500 text-indigo-600 rounded-lg bg-white hover:bg-indigo-50 transition-colors duration-200 ease-in-out font-medium shadow-sm hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Tasks Completed" value={127} />
        <StatCard label="Avg. Completion Time" value="2.3" unit="d" />
        <StatCard label="Team Productivity" value="84" unit="%" />
        <StatCard label="Pending Reviews" value={9} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Developer Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">
            Developer Activity: Hours & Tasks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={developerActivityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#4F46E5"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Hours",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Tasks",
                  angle: 90,
                  position: "insideRight",
                  fill: "#6B7280",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#333" }}
                itemStyle={{ color: "#333" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", color: "#333" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Hours Worked"
                stroke="#4F46E5"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Tasks Completed"
                stroke="#10B981"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Code Contribution: Developer vs AI */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">
            Code Contribution (LOC): Developer vs AI
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={codeContributionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
              <YAxis
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Lines of Code",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#333" }}
                itemStyle={{ color: "#333" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", color: "#333" }} />
              <Bar
                dataKey="Developer LOC"
                stackId="a"
                fill="#4F46E5"
                barSize={30}
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="AI Generated LOC"
                stackId="a"
                fill="#10B981"
                barSize={30}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Impact: Time & Cost Reduction */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">
            AI Impact: Time & Cost Reduction
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={aiImpactData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#4F46E5"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Hours Reduced",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#F59E0B"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Cost Saved ($)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#6B7280",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#333" }}
                itemStyle={{ color: "#333" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", color: "#333" }} />
              <Bar
                yAxisId="left"
                dataKey="Time Reduced (Hours)"
                fill="#4F46E5"
                barSize={20}
                radius={[5, 5, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="Cost Saved ($)"
                fill="#F59E0B"
                barSize={20}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Developer Velocity */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">
            Developer Velocity: Avg. Task Completion Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={developerVelocityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical" // Changed to vertical layout for better comparison
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                tick={{ fill: "#6B7280" }}
                label={{
                  value: "Days",
                  position: "insideBottom",
                  offset: 0,
                  fill: "#6B7280",
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#333" }}
                itemStyle={{ color: "#333" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", color: "#333" }} />
              <Bar
                dataKey="value"
                fill="#3B82F6"
                barSize={40}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Completion Report (Pie Chart) */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-8">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">
          Project Completion Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={projectStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {projectStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#333" }}
              itemStyle={{ color: "#333" }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", color: "#333" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Section: Completed and Working Project Report (Placeholder for more detailed info or another chart) */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">
          Detailed Project Reports
        </h3>
        <p className="text-gray-600 mb-4">
          This section can be expanded to include detailed tables or lists of
          completed and ongoing projects, perhaps with drill-down capabilities
          for individual project analysis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">
              Completed Projects (Last 30 Days)
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Project Alpha: On-time, 95% test coverage.</li>
              <li>Project Beta: 2 days late, AI contributed 30% of code.</li>
              <li>
                Project Gamma: Exceeded expectations, 15% cost savings with AI.
              </li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Working Projects</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Project Delta: 70% complete, on track.</li>
              <li>Project Epsilon: Requires urgent AI code review.</li>
              <li>
                Project Zeta: Planning phase, AI feature estimation in progress.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
