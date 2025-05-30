import React from "react";

const ProjectContent = () => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">All Projects</h2>
        <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">+ New Project</button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockProjects.map((proj, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-blue-500 mr-3">📂</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{proj.title}</div>
                      <div className="text-xs text-gray-500">{proj.path}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${proj.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {proj.status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proj.updated}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{proj.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center -mr-2">AJ</div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center -mr-2">SW</div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center -mr-2">TC</div>
                    {proj.team > 3 && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">+{proj.team - 3}</div>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectContent;
