// app/dashboard/page.js
"use client";
import DashboardContent from "@/components/DashboardContent";
import ProjectContent from "@/components/ProjectContent";
import ReportContent from "@/components/ReportContent";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DashboardPage({ activeTab }) {
  
  const [user, setUser] = useState(null);
  const router = useRouter();
  const userId = useParams.userId;
  
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
    <div className="flex-1 p-6 overflow-y-auto">
      {renderContent()}
    </div>
  );
}