import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function AIImpactChart({ data, currentTheme, chartRef }) {
  return (
    <div ref={chartRef} className="rounded-xl p-6 shadow-md border"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        AI Impact: Time & Cost Reduction
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.palette.divider} />
          <XAxis dataKey="name" tick={{ fill: currentTheme.palette.text.secondary }} />
          <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Hours Reduced", angle: -90, position: "insideLeft", fill: currentTheme.palette.text.secondary }} />
          <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" tick={{ fill: currentTheme.palette.text.secondary }}
            label={{ value: "Cost Saved ($)", angle: 90, position: "insideRight", fill: currentTheme.palette.text.secondary }} />
          <Tooltip contentStyle={{ backgroundColor: currentTheme.palette.background.paper, border: `1px solid ${currentTheme.palette.divider}`, borderRadius: "8px" }}
            labelStyle={{ color: currentTheme.palette.text.primary }} itemStyle={{ color: currentTheme.palette.text.primary }} />
          <Legend wrapperStyle={{ paddingTop: "10px", color: currentTheme.palette.text.primary }} />
          <Bar yAxisId="left" dataKey="Time Reduced (Hours)" fill="#4F46E5" barSize={20} radius={[5, 5, 0, 0]} />
          <Bar yAxisId="right" dataKey="Cost Saved ($)" fill="#F59E0B" barSize={20} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 