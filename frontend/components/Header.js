"use client";
import React from "react";

const Header = ({ activeTab, user }) => {
  return (
    <div className="flex justify-between items-center min-h-[60px] px-6 bg-gray-50 border-b border-gray-300">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          {activeTab === "dashboard" && "Dashboard"}
          {activeTab === "project" && "Projects"}
          {activeTab === "report" && "Reports"}
          {activeTab === "team" && "Team Management"}
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {user?.name || "User"}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <span className="mr-1"></span> {user?.githubId || "github-user"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
