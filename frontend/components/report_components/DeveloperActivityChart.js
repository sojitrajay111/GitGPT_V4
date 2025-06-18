import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

export default function DeveloperActivityChart({ data, currentTheme, chartRef }) {
  return (
    <div ref={chartRef} className="rounded-xl p-6 shadow-md border"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        Developer Activity: Hours & Tasks
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.palette.divider} />
          <XAxis dataKey="name" tick={{ fill: currentTheme.palette.text.secondary }} />
          <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Hours", angle: -90, position: "insideLeft", fill: currentTheme.palette.text.secondary }} />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Tasks", angle: 90, position: "insideRight", fill: currentTheme.palette.text.secondary }} />
          <Tooltip contentStyle={{ backgroundColor: currentTheme.palette.background.paper, border: `1px solid ${currentTheme.palette.divider}`, borderRadius: "8px" }}
            labelStyle={{ color: currentTheme.palette.text.primary }} itemStyle={{ color: currentTheme.palette.text.primary }} />
          <Legend wrapperStyle={{ paddingTop: "10px", color: currentTheme.palette.text.primary }} />
          <Line yAxisId="left" type="monotone" dataKey="Hours Worked" stroke="#4F46E5" activeDot={{ r: 8 }} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="Tasks Completed" stroke="#10B981" activeDot={{ r: 8 }} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 