"use client";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import React from "react";
import { HiMenu, HiX } from "react-icons/hi";

const Header = ({ 
  activeTab, 
  userId, 
  sidebarOpen,
  setSidebarOpen
}) => {
  const tabTitles = {
    dashboard: "Project Dashboard",
    project: "Project Management",
    report: "Analytics & Reports",
    team: "Team Collaboration",
  };

  const { data } = useGetUserAndGithubDataQuery(userId);

  const username = data?.user?.username || "Loading...";
  const avatar_url = data?.githubData?.avatarUrl || "/default-avatar.png";
  const github_name = data?.githubData?.githubUsername || "GitHub User";

  return (
    <header className="sticky top-0 z-10 min-h-[50px] px-4 sm:px-6 md:px-8 py-1 bg-gradient-to-r from-gray-50 to-white shadow-sm border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        {/* Left section with menu button and title */}
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 mr-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
          </button>

          <h1 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight truncate">
            {tabTitles[activeTab] || "GitGPT Control Center"}
          </h1>

          {/* Mobile notification icon */}
          <button className="md:hidden relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg
              className="h-4 w-4 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Right section with user info */}
        <div className="flex items-center justify-end md:justify-normal space-x-3">
          {/* Desktop notification icon */}
          <button className="hidden md:block relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg
              className="h-4 w-4 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2 bg-white rounded-full pl-1 pr-2 py-0.5 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden">
              <img
                src={avatar_url}
                alt={`${username}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-[140px]">
                {username}
              </div>
              <div className="text-xs text-gray-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="truncate max-w-[100px]">{github_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
