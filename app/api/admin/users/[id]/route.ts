import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ApprovalStatus, Role } from "@prisma/client";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        npm: true,
        approvalStatus: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET USER DETAIL ERROR:", error);

    return NextResponse.json(
      {
        message: "Error ambil user",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const nextStatus = typeof body.approvalStatus === "string" ? body.approvalStatus.toUpperCase() : "";

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    if (!Object.values(ApprovalStatus).includes(nextStatus as ApprovalStatus)) {
      return NextResponse.json(
        { message: "Status approval tidak valid" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existingUser.role !== Role.DOSEN) {
      return NextResponse.json(
        { message: "Approval hanya berlaku untuk akun dosen" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: nextStatus as ApprovalStatus,
        approvedAt: nextStatus === ApprovalStatus.APPROVED ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        role: true,
        approvalStatus: true,
        approvedAt: true,
      },
    });

    return NextResponse.json({
      message:
        nextStatus === ApprovalStatus.APPROVED
          ? "Akun dosen berhasil disetujui"
          : "Status akun dosen berhasil diperbarui",
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PATCH USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal memperbarui status user",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    await prisma.progress.deleteMany({
      where: { userId: id },
    });

    await prisma.aIRecommendation.deleteMany({
      where: { userId: id },
    });

    await prisma.quizResult.deleteMany({
      where: { userId: id },
    });

    await prisma.assignmentSubmission.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal hapus user",
        error: message,
      },
      { status: 500 }
    );
  }
}
