"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useParams, usePathname, useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi";

export default function Layout({ children }) {
  const { userId } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeUrl, setActiveUrl] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCodeAnalysisPage = pathname.includes("/code-analysis");

  // Update activeTab and activeUrl
  useEffect(() => {
    const cleanSegments = pathname
      .split("/")
      .filter((segment) => segment && isNaN(segment));

    setActiveUrl(cleanSegments);
    if (cleanSegments.length > 1) {
      setActiveTab(cleanSegments[1]);
    } else {
      setActiveTab("dashboard");
    }

    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [pathname]);

  const handleBreadcrumbClick = (index) => {
    const path = "/" + activeUrl.slice(0, index + 1).join("/");
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar (hidden on Code Analysis page) */}
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
        {/* Page content */}
        <main className={`flex-1 ${isCodeAnalysisPage ? "" : "p-4"} overflow-y-auto`}>
          {children}
        </main>
      </div>
    
  );
}
