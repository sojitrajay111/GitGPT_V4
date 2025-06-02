"use client";
import React from "react";

const Header = ({ activeTab, user }) => {
  // Map tab names to more descriptive titles
  const tabTitles = {
    dashboard: "Project Dashboard",
    project: "Project Management",
    report: "Analytics & Reports",
    team: "Team Collaboration"
  };

  return (
    <div className="sticky top-0 z-10 flex justify-between items-center min-h-[50px] px-8 bg-gradient-to-r from-gray-50 to-white shadow-sm border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {tabTitles[activeTab] || "GitGPT Control Center"}
        </h1>
        
        {/* Breadcrumb navigation */}
        <div className="ml-6 flex items-center text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="capitalize text-gray-800 font-medium">
            {activeTab || 'dashboard'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification icon */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User profile */}
        <div className="flex items-center space-x-3 bg-white rounded-full pl-1 pr-4 py-1 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {user?.githubId || "github-user"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;