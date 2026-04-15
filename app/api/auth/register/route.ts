import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { ApprovalStatus, Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rawRole = typeof body.role === "string" ? body.role.toUpperCase() : "";
    const npm = typeof body.npm === "string" ? body.npm.trim() : "";
    const adminCode = typeof body.adminCode === "string" ? body.adminCode.trim() : "";

    if (!name || !email || !password || !rawRole) {
      return NextResponse.json(
        { message: "Nama, email, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    if (!Object.values(Role).includes(rawRole as Role)) {
      return NextResponse.json(
        { message: "Role tidak valid" },
        { status: 400 }
      );
    }

    const role = rawRole as Role;
    const emailLower = email.toLowerCase();

    if (!emailLower.endsWith("@gmail.com")) {
      return NextResponse.json(
        { message: "Semua akun wajib menggunakan email @gmail.com" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    if (role !== Role.ADMIN && !npm) {
      return NextResponse.json(
        { message: "NPM atau NIDN wajib diisi" },
        { status: 400 }
      );
    }

    if (role === Role.MAHASISWA && !npm.startsWith("66")) {
      return NextResponse.json(
        { message: "NPM mahasiswa harus diawali 66" },
        { status: 400 }
      );
    }

    if (role === Role.DOSEN && !npm.startsWith("44")) {
      return NextResponse.json(
        { message: "NIDN dosen harus diawali 44" },
        { status: 400 }
      );
    }

    if (role === Role.ADMIN) {
      const expectedAdminCode = process.env.ADMIN_REGISTER_CODE;

      if (!expectedAdminCode) {
        return NextResponse.json(
          { message: "ADMIN_REGISTER_CODE belum diset di environment" },
          { status: 500 }
        );
      }

      if (!adminCode || adminCode !== expectedAdminCode) {
        return NextResponse.json(
          { message: "Kode admin tidak valid" },
          { status: 403 }
        );
      }
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    if (npm) {
      const existingNpm = await prisma.user.findUnique({
        where: { npm },
      });

      if (existingNpm) {
        return NextResponse.json(
          { message: "NPM/NIDN sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const approvalStatus =
      role === Role.DOSEN ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED;

    await prisma.user.create({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        role,
        npm: npm || null,
        approvalStatus,
        approvedAt: approvalStatus === ApprovalStatus.APPROVED ? new Date() : null,
      },
    });

    return NextResponse.json({
      message:
        role === Role.DOSEN
          ? "Pendaftaran dosen berhasil. Tunggu persetujuan admin sebelum login."
          : "Register berhasil, silakan login",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
