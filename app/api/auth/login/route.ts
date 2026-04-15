import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApprovalStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "JWT_SECRET belum diset" },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email tidak ditemukan" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Password salah" },
        { status: 400 }
      );
    }

    if (user.role === "DOSEN" && user.approvalStatus !== ApprovalStatus.APPROVED) {
      return NextResponse.json(
        {
          message:
            user.approvalStatus === ApprovalStatus.REJECTED
              ? "Akun dosen ditolak admin. Hubungi admin untuk informasi lebih lanjut."
              : "Akun dosen belum disetujui admin. Silakan tunggu approval terlebih dahulu.",
        },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login berhasil",
      token,
      role: user.role,
      id: user.id,
      user: {
        id: user.id,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Server error",
        error: message,
      },
      { status: 500 }
    );
  }
}
