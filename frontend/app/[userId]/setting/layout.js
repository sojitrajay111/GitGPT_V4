// app/[userId]/layout.js
import React from "react";
import Header from "@/components/Header"; // adjust the path as needed

export default function UserLayout({ children, params }) {
  const { userId } = params;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Render Header with userId */}
      <Header userId={userId} />

      {/* Main content */}
      <main className=" flex-1 overflow-y-auto w-full bg-gray-50">{children}</main>
    </div>
  );
}
