"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";

const Sidebar = ({ userId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useGetUserAndGithubDataQuery(userId);

  const username = data?.githubData?.username || "Loading...";
  const avatar_url = data?.githubData?.avatar_url || "/default-avatar.png";
  const github_name = data?.githubData?.name || "GitHub User";

  // Extract active tab from URL path
  const getActiveTab = () => {
    const segments = pathname.split("/");
    return segments.length > 2 ? segments[2] : "dashboard";
  };

  const activeTab = getActiveTab();

  const handleNavigate = (tab) => {
    router.push(`/${userId}/${tab}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("userid");
    router.push("/login");
  };

  // Navigation items configuration
  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-project", label: "Projects", icon: FolderOpen },
    { id: "report", label: "Reports", icon: BarChart },
  ];

  const accountNavItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logout", label: "Logout", icon: LogOut, action: handleLogout },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 p-0 flex flex-col h-screen border-r border-gray-200 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            GitGPT
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Developer Copilot</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Main Navigation */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-2 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Main Navigation
          </h3>

          <div className="mt-2 space-y-1">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  />
                  <span
                    className={`font-medium ${isActive ? "text-blue-700" : ""}`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Section */}
        <div className="mt-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-2 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Account
          </h3>

          <div className="mt-2 space-y-1">
            {accountNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.action || (() => handleNavigate(item.id))}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  />
                  <span
                    className={`font-medium ${isActive ? "text-blue-700" : ""}`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-500 bg-gray-50">
        v2.1.0 • GitGPT © 2023
      </div>
    </div>
  );
};

export default Sidebar;
