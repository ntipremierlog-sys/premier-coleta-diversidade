import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador de RH." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const logs = await prisma.diversityAccessLog.findMany({
      take: Math.min(limit, 500),
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trilha de auditoria." },
      { status: 500 }
    );
  }
}
