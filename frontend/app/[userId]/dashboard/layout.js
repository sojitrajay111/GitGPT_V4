// app/dashboard/layout.js
"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";
import ProjectContent from "@/components/ProjectContent";
import ReportContent from "@/components/ReportContent";


export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user] = useState({
    name: "Alex Johnson",
    githubId: "alexj-dev",
    role: "Project Manager"
  });

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case "dashboard": 
        return <DashboardContent />;
      case "project":
        return <ProjectContent />;
      case "report":
        return <ReportContent />;
    
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} user={user} />
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}