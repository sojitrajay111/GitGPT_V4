"use client";
import React from "react";
import StateCard from "@/components/StateCard";
import ProjectList from "@/components/ProjectList";
import UserProfile from "@/components/UserProfile";
import { useParams } from "next/navigation";

export default function Dashboard() {
       const { userId } = useParams();
      
      
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StateCard title="Total Projects" value="28" subtitle="Active and completed projects." />
        <StateCard title="Tasks Completed" value="145" subtitle="Tasks finished this month." />
        <StateCard title="Unread Notifications" value="6" subtitle="New alerts awaiting your attention." />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserProfile userId={userId} />
        <ProjectList userId={userId} />
      </div>
    </div>
  );
}
