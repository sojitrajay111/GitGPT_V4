import React from "react";
import StatCard from "./StatCard";

export default function StatCardGrid({ data, currentTheme }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard label="Total Developers" value={data.totalDevelopers || 0} currentTheme={currentTheme} />
      <StatCard label="Total Tasks" value={data.totalTasks || 0} currentTheme={currentTheme} />
      <StatCard label="Tasks Completed" value={data.statCards?.tasksCompleted || 0} currentTheme={currentTheme} />
      <StatCard label="Pending Tasks" value={data.pendingTasks || 0} currentTheme={currentTheme} />
    </div>
  );
} 