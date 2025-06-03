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
  X,
} from "lucide-react";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";

const Sidebar = ({ userId, isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useGetUserAndGithubDataQuery(userId);

  const username = data?.user?.username || "Loading...";
  const email = data?.user?.email || "Loading...";
  const avatar_url = data?.githubData?.avatarUrl || "/default-avatar.png";

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
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 flex flex-col h-screen border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile Close */}
        <button
          className="absolute top-4 right-4 p-1 lg:hidden text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Brand */}
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

        {/* Profile */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={avatar_url}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {username}
              </span>
              <span className="text-xs text-gray-600 truncate max-w-[160px]">
                {email}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation + Footer Wrapper */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-4">
            {/* Main Nav */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Main
              </h3>
              <ul className="space-y-1">
                {mainNavItems.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => handleNavigate(id)}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === id
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Small space instead of large margin */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Account
              </h3>
              <ul className="space-y-1">
                {accountNavItems.map(({ id, label, icon: Icon, action }) => (
                  <li key={id}>
                    <button
                      onClick={() => (action ? action() : handleNavigate(id))}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700"
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-500 bg-gray-50">
            v2.1.0 • GitGPT © 2023
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
