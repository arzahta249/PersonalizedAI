import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mengambil Data Profil
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true } // Jangan ambil password!
    });

    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Mengubah Data Profil (Nama & Email)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email } = body;

    if (!userId || !name || !email) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui", user: updatedUser });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return NextResponse.json({ message: "Email mungkin sudah digunakan atau terjadi error" }, { status: 500 });
  }
}