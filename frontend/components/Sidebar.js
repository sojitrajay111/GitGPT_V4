"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import Cookies from "js-cookie";

const Sidebar = ({
  userId,
  isOpen,
  onClose,
  collapsed,
  setCollapsed,
  activeTab,
  setActiveTab,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useGetUserAndGithubDataQuery(userId);

  const username = data?.user?.username || "Loading...";
  const email = data?.githubData?.githubEmail || "Loading...";
  const avatar_url = data?.githubData?.avatarUrl || "/default-avatar.png";
  const githubUsername = data?.githubData?.githubUsername || "Loading...";

  // Function to navigate and set active tab
  const handleNavigate = (tab) => {
    router.push(`/${userId}/${tab}`);
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.push("/");
    router.refresh();
  };

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-project", label: "Projects", icon: FolderOpen },
    { id: "report", label: "Reports", icon: BarChart },
  ];

  const accountNavItems = [
    { id: "setting", label: "Settings", icon: Settings },
    { id: "logout", label: "Logout", icon: LogOut, action: handleLogout },
  ];

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white text-gray-800 flex flex-col h-screen border-r border-gray-200 
        transform transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "w-20" : "w-64"} `}
      >
        {/* Mobile Close Button */}
        <button
          className="absolute top-4 right-4 p-1 lg:hidden text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close sidebar menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo & Collapse toggle */}
        <div
          className={`p-5 flex items-center justify-between border-b border-gray-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="GitGPT Logo"
              className={`transition-all duration-300 ease-in-out ${
                collapsed ? "w-10 h-10" : "w-10 h-10 mr-3"
              }`}
            />
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">
                GitGPT
              </h1>
            )}
          </div>

          <button
            className={`hidden lg:block p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ${
              collapsed ? "ml-0" : "ml-auto"
            }`}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Profile Section */}
        {!collapsed ? (
          <div className="px-5 pt-4 pb-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <img
                src={avatar_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                  {username}
                </span>
                <span className="text-xs text-gray-600 truncate max-w-[160px]">
                  @{githubUsername}
                </span>
                <span className="text-xs text-indigo-600 mt-1">{email}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 border-b border-gray-200 bg-gray-50">
            <img
              src={avatar_url}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <nav className="p-4 space-y-4">
            {/* Main Navigation */}
            <div>
              <h3
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ${
                  collapsed ? "sr-only" : "px-3"
                }`}
              >
                Main
              </h3>
              <ul className="space-y-1">
                {mainNavItems.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => handleNavigate(id)}
                      className={`flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200
                        ${
                          activeTab === id
                            ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                        ${collapsed ? "justify-center" : ""}`}
                      title={label}
                    >
                      <Icon className={`w-5 h-5 ${!collapsed ? "mr-3" : ""}`} />
                      {!collapsed && label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Navigation */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h3
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ${
                  collapsed ? "sr-only" : "px-3"
                }`}
              >
                Account
              </h3>
              <ul className="space-y-1">
                {accountNavItems.map(({ id, label, icon: Icon, action }) => (
                  <li key={id}>
                    <button
                      onClick={() => (action ? action() : handleNavigate(id))}
                      className={`flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200
                        hover:bg-gray-100 text-gray-700
                        ${collapsed ? "justify-center" : ""}`}
                      title={label}
                    >
                      <Icon className={`w-5 h-5 ${!collapsed ? "mr-3" : ""}`} />
                      {!collapsed && label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;