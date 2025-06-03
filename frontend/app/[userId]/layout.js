// app/[userId]/layout.js
"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useParams, usePathname } from "next/navigation";
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";

export default function Layout({ children }) {
  const { userId } = useParams(); // ✅ Correct way to get dynamic param in client layout
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = {
    name: "Alex Johnson",
    githubId: "alexj-dev",
    role: "Project Manager",
  };

  const [activeUrl, setActiveUrl] = useState([]);

  useEffect(() => {
    // Split the pathname, filter out empty strings and numeric values
    const cleanSegments = pathname
      .split("/")
      .filter((segment) => segment && isNaN(segment));

    setActiveUrl(cleanSegments);
  }, [pathname]);

  const handleBreadcrumbClick = (index) => {
    const path = "/" + activeUrl.slice(0, index + 1).join("/");
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        userId={userId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          userId={userId}
          activeUrl={activeUrl}
          handleBreadcrumbClick={handleBreadcrumbClick}
        />
        <div className="flex-1 p-4  overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
