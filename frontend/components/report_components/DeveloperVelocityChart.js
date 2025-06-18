import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function DeveloperVelocityChart({ data, currentTheme, chartRef }) {
  return (
    <div ref={chartRef} className="rounded-xl p-6 shadow-md border"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        Developer Velocity: Avg. Task Completion Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.palette.divider} />
          <XAxis type="number" tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Days", position: "insideBottom", offset: 0, fill: currentTheme.palette.text.secondary }} />
          <YAxis type="category" dataKey="name" tick={{ fill: currentTheme.palette.text.secondary }} />
          <Tooltip contentStyle={{ backgroundColor: currentTheme.palette.background.paper, border: `1px solid ${currentTheme.palette.divider}`, borderRadius: "8px" }}
            labelStyle={{ color: currentTheme.palette.text.primary }} itemStyle={{ color: currentTheme.palette.text.primary }} />
          <Legend wrapperStyle={{ paddingTop: "10px", color: currentTheme.palette.text.primary }} />
          <Bar dataKey="value" fill="#3B82F6" barSize={40} radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 