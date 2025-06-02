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

// Mock data (moved from original DashboardPage for self-containment)
const mockProjects = [
  {
    title: "Project Management App Revamp",
    path: "acme/project-manager-v2",
    updated: "Edited 2 hours ago",
    tags: ["User Story", "Analysis Code", "Documentation"],
    status: "active",
    progress: 75,
    team: 5
  },
  {
    title: "Internal Knowledge Base",
    path: "acme/knowledge-base",
    updated: "Edited Yesterday",
    tags: ["Content", "SEO", "Migration"],
    status: "active",
    progress: 40,
    team: 3
  },
  {
    title: "New Marketing Website",
    path: "acme/marketing-site-2024",
    updated: "Edited 3 days ago",
    tags: ["Design", "Frontend", "CMS"],
    status: "draft",
    progress: 15,
    team: 4
  },
  {
    title: "Mobile App Phase 1",
    path: "acme/mobile-app-p1",
    updated: "Edited last week",
    tags: ["React Native", "API", "Testing"],
    status: "active",
    progress: 90,
    team: 6
  },
  {
    title: "Customer Portal Redesign",
    path: "acme/customer-portal-v3",
    updated: "Edited April 10, 2024",
    tags: ["UX Research", "Prototype", "Feedback"],
    status: "draft",
    progress: 25,
    team: 2
  },
];

export default function DashboardContent() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Projects" value={8} />
        <StatCard label="Projects in Draft" value={4} />
        <StatCard label="Total Projects" value={15} />
        <StatCard label="Team Members" value={12} />
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">My Projects</h2>
          <button className="text-blue-500 font-medium">View All →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProjects.map((proj, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{proj.title}</h3>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${proj.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {proj.status}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{proj.path}</p>
              <p className="text-xs text-gray-400 mb-3">{proj.updated}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {proj.tags.map((tag, j) => (
                  <span key={j} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-500">{proj.progress}% complete</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg p-4">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mr-3">📝</div>
              <div>
                <p className="text-sm text-gray-700"><strong>Alex Johnson</strong> updated the requirements document for <strong>Project Management App</strong></p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mr-3">✅</div>
              <div>
                <p className="text-sm text-gray-700"><strong>Sam Wilson</strong> completed the user authentication module</p>
                <p className="text-xs text-gray-400">Yesterday, 4:30 PM</p>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mr-3">👥</div>
              <div>
                <p className="text-sm text-gray-700"><strong>You</strong> added <strong>Taylor Chen</strong> to the <strong>Mobile App Phase 1</strong> project</p>
                <p className="text-xs text-gray-400">April 12, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}