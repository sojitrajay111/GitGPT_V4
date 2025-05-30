"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart,
  Users,
  Settings,
  LogOut
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("userid");
    router.push("/login");
  };

  return (
    <div className="w-64 bg-gray-50 border border-gray-200 text-gray-800 p-4 flex flex-col">
      {/* MAIN NAVIGATION SECTION */}
      <div className="py-4 border-b border-gray-300">
        <div className="flex items-center px-4 pb-2">
          <span className="w-1 h-4 bg-blue-500 mr-2 rounded-sm" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Main Navigation
          </h3>
        </div>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center w-full px-4 py-2 mt-1 text-left rounded ${
            activeTab === "dashboard"
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-blue-100"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab("project")}
          className={`flex items-center w-full px-4 py-2 mt-1 text-left rounded ${
            activeTab === "project"
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-blue-100"
          }`}
        >
          <FolderOpen className="w-5 h-5 mr-3" />
          Projects
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center w-full px-4 py-2 mt-1 text-left rounded ${
            activeTab === "report"
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-blue-100"
          }`}
        >
          <BarChart className="w-5 h-5 mr-3" />
          Reports
        </button>
      </div>

      {/* ACCOUNT SECTION */}
      <div className="py-4">
        <div className="flex items-center px-4 pb-2">
          <span className="w-1 h-4 bg-blue-500 mr-2 rounded-sm" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Account
          </h3>
        </div>

        <button className="flex items-center w-full px-4 py-2 mt-1 text-left rounded hover:bg-blue-100">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 mt-1 text-left rounded hover:bg-blue-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
