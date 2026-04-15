"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "DOSEN") {
        router.replace("/dashboard/dosen");
      } else if (role === "MAHASISWA") {
        router.replace("/dashboard/mahasiswa");
      } else {
        router.replace("/login");
      }

    } catch {
      router.replace("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}