import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal ambil user",
        error: message,
      },
      { status: 500 }
    );
  }
}
