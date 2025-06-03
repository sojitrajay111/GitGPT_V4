"use client";
import React, { useEffect, useState } from "react";
// import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useParams, usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useGetUserAndGithubDataQuery } from "@/features/githubApiSlice";
import { HiMenu, HiX } from "react-icons/hi"; // Added mobile menu icons

export default function Layout({ children }) {
  const { userId } = useParams();
  const router = useRouter(); // Added for navigation
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeUrl, setActiveUrl] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

  useEffect(() => {
    const cleanSegments = pathname
      .split("/")
      .filter((segment) => segment && isNaN(segment));
    setActiveUrl(cleanSegments);
  }, [pathname]);

  const handleBreadcrumbClick = (index) => {
    const path = "/" + activeUrl.slice(0, index + 1).join("/");
    router.push(path);
  };

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar backdrop */}
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
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* <Header
          activeTab={activeTab}
          userId={userId}
          activeUrl={activeUrl}
          handleBreadcrumbClick={handleBreadcrumbClick}
          // Mobile menu button
          mobileMenuButton={
            <button
              className="lg:hidden p-2 mr-2 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          }
        /> */}
        <div className="flex-1 p-2 md:p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}