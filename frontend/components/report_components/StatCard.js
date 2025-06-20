import React from "react";

export default function StatCard({ label, value, unit = "", currentTheme }) {
  return (
    <div
      className="rounded-xl p-6 shadow-md border hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
      style={{
        backgroundColor: currentTheme.palette.background.paper,
        borderColor: currentTheme.palette.divider,
        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
      }}
    >
      <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.palette.text.secondary }}>{label}</h3>
      <p className="text-3xl font-bold" style={{ color: currentTheme.palette.primary.main }}>
        {value}
        {unit}
      </p>
    </div>
  );
} 