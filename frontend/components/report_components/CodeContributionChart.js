import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function CodeContributionChart({ data, currentTheme, chartRef }) {
  return (
    <div ref={chartRef} className="rounded-xl p-6 shadow-md border"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        Code Contribution (LOC): Developer vs AI
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.palette.divider} />
          <XAxis dataKey="name" tick={{ fill: currentTheme.palette.text.secondary }} />
          <YAxis tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Lines of Code", angle: -90, position: "insideLeft", fill: currentTheme.palette.text.secondary }} />
          <Tooltip contentStyle={{ backgroundColor: currentTheme.palette.background.paper, border: `1px solid ${currentTheme.palette.divider}`, borderRadius: "8px" }}
            labelStyle={{ color: currentTheme.palette.text.primary }} itemStyle={{ color: currentTheme.palette.text.primary }} />
          <Legend wrapperStyle={{ paddingTop: "10px", color: currentTheme.palette.text.primary }} />
          <Bar dataKey="Developer LOC" stackId="a" fill="#4F46E5" barSize={30} radius={[5, 5, 0, 0]} />
          <Bar dataKey="AI Generated LOC" stackId="a" fill="#10B981" barSize={30} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 