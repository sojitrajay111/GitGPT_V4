// Sidebar.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
// import Cookies from "js-cookie"; // Remove Cookies import
import {
  useGetThemeQuery,
  useUpdateThemeMutation,
} from "@/features/themeApiSlice"; // Import new theme hooks
import { useGetCompanyDetailsQuery } from "@/features/companyApi";

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
  const { data: userData } = useGetUserAndGithubDataQuery(userId);
  const managerId = userData?.user?.role === "manager" ? userId : userData?.user?.managerId;
  const { data: companyData } = useGetCompanyDetailsQuery(managerId, { skip: !managerId });
  // Use theme from RTK Query
  const {
    data: themeData,
    isLoading: isThemeLoading,
    isError: isThemeError,
  } = useGetThemeQuery(userId, {
    skip: !userId, // Skip query if userId is not available
  });
  const [updateTheme] = useUpdateThemeMutation(); // Mutation hook

  const theme = themeData?.theme || "light"; // Default to 'light' if data is not yet loaded or error
  // const [theme, setTheme] = useState("light"); // Remove local state for theme

  // Remove useEffect for initial theme from Cookies
  // useEffect(() => {
  //   const savedTheme = Cookies.get("theme") || "light";
  //   setTheme(savedTheme);
  // }, []);

  // Effect to apply the theme class to the document element (html tag)
  // This useEffect will now react to changes in themeData from the API
  useEffect(() => {
    if (!isThemeLoading && !isThemeError && theme) {
      // Only apply once theme data is fetched
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, isThemeLoading, isThemeError]);

const handleToggleTheme = async () => {
  const newTheme = theme === "dark" ? "light" : "dark";
  try {
    const response = await updateTheme({ userId, theme: newTheme }).unwrap();
    console.log("Theme updated:", response);
  } catch (error) {
    console.error("Failed to update theme preference:", error?.data || error?.message || error);
  }
};

  const username = userData?.user?.username || "Loading...";
  const email = userData?.githubData?.githubEmail || "Loading...";
  const avatar_url = userData?.githubData?.avatarUrl || "/default-avatar.png";
  const githubUsername = userData?.githubData?.githubUsername || "Loading...";

  const handleNavigate = (tab) => {
    router.push(`/${userId}/${tab}`);
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("theme"); // Remove theme from local storage
    // Cookies.remove("token"); // Assuming Cookies for token are managed elsewhere now or no longer needed for theme
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

  // Dynamic class for theme
  const sidebarBg = theme === "dark" ? "bg-black" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-800";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const activeBg =
    theme === "dark"
      ? "bg-indigo-800 text-white"
      : "bg-indigo-50 text-indigo-700";
  const logoTextColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const headingColor = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const buttonTextColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

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
        className={`fixed inset-y-0 left-0 z-30 ${sidebarBg} ${textColor} flex flex-col h-screen border-r ${borderColor}
        transform transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "w-20" : "w-64"} `}
      >
        {/* Mobile Close Button */}
        <button
          className={`absolute top-4 right-4 p-1 lg:hidden rounded-md ${hoverBg} ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
          onClick={onClose}
          aria-label="Close sidebar menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo & Collapse toggle with company info only */}
        <div
          className={`p-5 flex items-center justify-between border-b ${borderColor} ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex items-center">
            {companyData && (
              <>
                <img
                  src={companyData.companyLogoUrl || "/default-logo.png"}
                  alt="Company Logo"
                  className={`transition-all duration-300 ease-in-out rounded object-cover border ${collapsed ? "w-10 h-10" : "w-10 h-10 mr-3"}`}
                  style={{ background: "#fff" }}
                />
                {!collapsed && (
                  <span className={`text-xl font-bold ${logoTextColor} tracking-wide`}>
                    {companyData.companyName}
                  </span>
                )}
              </>
            )}
          </div>

          <button
            className={`hidden lg:block p-2 rounded-md ${hoverBg} ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            } transition-colors ${collapsed ? "ml-0" : "ml-auto"}`}
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
          <div
            className={`px-5 pt-4 pb-3 border-b ${borderColor} ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={avatar_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300 shadow-sm"
              />
              <div className="flex flex-col">
                <span
                  className={`text-sm font-semibold truncate max-w-[140px] ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {username}
                </span>
                <span
                  className={`text-xs truncate max-w-[160px] ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  @{githubUsername}
                </span>
                <span className="text-xs text-indigo-500 mt-1 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap block">{email}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center p-3 border-b ${borderColor} ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <img
              src={avatar_url}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-300 shadow-sm"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <nav className="p-4 space-y-4">
            {/* Main Navigation */}
            <div>
              <h3
                className={`text-xs font-semibold ${headingColor} uppercase tracking-wide mb-2 ${
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
                            ? activeBg
                            : `${hoverBg} ${buttonTextColor}`
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
            <div>
              <h3
                className={`text-xs font-semibold ${headingColor} uppercase tracking-wide mb-2 ${
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
                        ${hoverBg} ${buttonTextColor}
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

        {/* Theme Toggle Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleToggleTheme}
            className={`flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200
              ${hoverBg} ${buttonTextColor}
              ${collapsed ? "justify-center" : ""}`}
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className={`w-5 h-5 ${!collapsed ? "mr-3" : ""}`} />
            ) : (
              <Moon className={`w-5 h-5 ${!collapsed ? "mr-3" : ""}`} />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;