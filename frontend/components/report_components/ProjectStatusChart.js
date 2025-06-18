import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ProjectStatusChart({ data, currentTheme, COLORS, chartRef }) {
  return (
    <div ref={chartRef} className="rounded-xl p-6 shadow-md border mb-8"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        Project Completion Status
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: currentTheme.palette.background.paper,
              border: `1px solid ${currentTheme.palette.divider}`,
              borderRadius: "8px",
            }}
            labelStyle={{ color: currentTheme.palette.text.primary }}
            itemStyle={{ color: currentTheme.palette.text.primary }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend for Pie Chart (rendered below the chart for better visibility in PDF) */}
      <div className="flex justify-center flex-wrap mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center mx-3 my-1">
            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="text-sm" style={{ color: currentTheme.palette.text.primary }}>{`${entry.name} (${entry.value}%)`}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 