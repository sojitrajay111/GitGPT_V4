"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

import { useParams, usePathname, useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi"; // Hamburger icon

export default function Layout({ children }) {
  const { userId } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeUrl, setActiveUrl] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile

  const isCodeAnalysisPage = pathname.includes("/code-analysis");

  useEffect(() => {
    // Filter segments to exclude empty and numeric segments (userId numeric check)
    const cleanSegments = pathname
      .split("/")
      .filter((segment) => segment && isNaN(segment));

    setActiveUrl(cleanSegments);

    if (cleanSegments.length > 1) {
      setActiveTab(cleanSegments[1]);
    } else {
      setActiveTab("dashboard");
    }

    setSidebarOpen(false); // close mobile sidebar on route change
  }, [pathname]);

  const handleBreadcrumbClick = (index) => {
    const path = "/" + activeUrl.slice(0, index + 1).join("/");
    router.push(path);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans">
      {/* Sidebar hidden on code-analysis page */}
      {!isCodeAnalysisPage && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar
            userId={userId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </>
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full transition-all duration-300 ease-in-out">
        {/* Mobile header with hamburger */}
        {!isCodeAnalysisPage && (
          <div className="lg:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4">
            <button
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <HiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {activeTab}
            </h2>
            <div></div>
          </div>
        )}

    
        {/* Children container full width and height, no padding */}
        <div className="flex-1 w-full overflow-auto">{children}</div>
      </main>
    </div>
  );
}