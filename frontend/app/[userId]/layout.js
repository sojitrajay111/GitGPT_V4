// app/[userId]/layout.js
"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useParams } from "next/navigation";

export default function Layout({ children }) {
  const { userId } = useParams(); // ✅ Correct way to get dynamic param in client layout
 const [activeTab, setActiveTab] = useState("dashboard");
  const user = {
    name: "Alex Johnson",
    githubId: "alexj-dev",
    role: "Project Manager",
  };

  return (
      <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar  userId={userId} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} user={user} />
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
