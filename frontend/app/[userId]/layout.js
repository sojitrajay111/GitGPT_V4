"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header"; // Assuming Header is not needed or will be replaced by direct elements in Layout
import { useParams, usePathname, useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi"; // Hamburger icon for mobile menu

export default function Layout({ children }) {
  const { userId } = useParams();
  const pathname = usePathname();

  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeUrl, setActiveUrl] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar visibility

  const isCodeAnalysisPage = pathname.includes("/code-analysis");

  // Update activeTab and activeUrl based on path
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
          {/* Mobile overlay for sidebar when open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Sidebar Component */}
          <Sidebar
            userId={userId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen} // Pass isOpen state to Sidebar
            onClose={() => setSidebarOpen(false)} // Pass onClose handler
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </>
      )}

      {/* Page content */}
      <main
        className={`flex-1 flex flex-col ${
          isCodeAnalysisPage ? "" : "lg:p-4"
        } overflow-y-auto transition-all duration-300 ease-in-out`}
      >
        {/* Mobile menu button and breadcrumbs for non-code analysis pages */}
        {!isCodeAnalysisPage && (
          <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            {/* Menu Button for mobile */}
            <button
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)} // Open sidebar on click
              aria-label="Open sidebar menu"
            >
              <HiMenu className="w-6 h-6" />
            </button>
            {/* Simple Title / Current Page Indicator for mobile */}
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {activeTab}
            </h2>
            {/* Placeholder for potential mobile header actions */}
            <div></div>
          </div>
        )}

        {/* Render children (main content of the page) */}
        <div className={`flex-1 ${isCodeAnalysisPage ? "" : "p-4"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
