import React from "react";

export default function DetailedProjectReports({ currentTheme }) {
  return (
    <div className="rounded-xl p-6 shadow-md border mb-8"
      style={{ backgroundColor: currentTheme.palette.background.paper, borderColor: currentTheme.palette.divider }}>
      <h3 className="font-semibold text-xl mb-4" style={{ color: currentTheme.palette.text.primary }}>
        Detailed Project Reports
      </h3>
      <p className="text-base mb-6" style={{ color: currentTheme.palette.text.secondary }}>
        This section can be expanded to include detailed tables or lists of completed and ongoing projects, perhaps with drill-down capabilities for individual project analysis.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Projects Card */}
        <div className="rounded-lg p-5 shadow-sm border"
          style={{ backgroundColor: currentTheme.palette.background.default, borderColor: currentTheme.palette.divider }}>
          <h4 className="font-semibold text-lg mb-3" style={{ color: currentTheme.palette.text.primary }}>
            Completed Projects (Last 30 Days)
          </h4>
          <ul className="list-disc list-inside text-sm space-y-2" style={{ color: currentTheme.palette.text.secondary }}>
            <li>Project Alpha: On-time, 95% test coverage.</li>
            <li>Project Beta: 2 days late, AI contributed 30% of code.</li>
            <li>Project Gamma: Exceeded expectations, 15% cost savings with AI.</li>
          </ul>
        </div>
        {/* Working Projects Card */}
        <div className="rounded-lg p-5 shadow-sm border"
          style={{ backgroundColor: currentTheme.palette.background.default, borderColor: currentTheme.palette.divider }}>
          <h4 className="font-semibold text-lg mb-3" style={{ color: currentTheme.palette.text.primary }}>
            Working Projects
          </h4>
          <ul className="list-disc list-inside text-sm space-y-2" style={{ color: currentTheme.palette.text.secondary }}>
            <li>Project Delta: 70% complete, on track.</li>
            <li>Project Epsilon: Requires urgent AI code review.</li>
            <li>Project Zeta: Planning phase, AI feature estimation in progress.</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 