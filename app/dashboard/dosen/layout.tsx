"use client";

import SidebarDosen from "@/components/SidebarDosen";
import DashboardAiChatbot from "@/components/DashboardAiChatbot";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function DosenLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <SidebarDosen />

      {/* CONTENT */}
      <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 pt-24 sm:p-5 sm:pb-28 md:p-6 md:pt-6">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>

      <DashboardAiChatbot role="DOSEN" />

    </div>
  );
}
