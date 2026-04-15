import SidebarMahasiswa from "@/components/SidebarMahasiswa";
import DashboardAiChatbot from "@/components/DashboardAiChatbot";

export default function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarMahasiswa />

      <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 pt-24 sm:p-5 sm:pb-28 md:p-6 md:pt-6">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>

      <DashboardAiChatbot role="MAHASISWA" />
    </div>
  );
}
