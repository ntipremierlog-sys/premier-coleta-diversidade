import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador de RH." },
        { status: 403 }
      );
    }

    const retentionMonths = parseInt(
      process.env.DATA_RETENTION_MONTHS || "24",
      10
    );

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

    // Buscar respondentes com tempo superior ao limite
    const expiredRespondents = await prisma.diversityRespondent.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: { id: true },
    });

    const expiredIds = expiredRespondents.map((r) => r.id);

    if (expiredIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum registro expirado encontrado para anonimização.",
        anonymizedCount: 0,
      });
    }

    // Desvincular submissões para manter estatísticas agregadas intactas
    await prisma.diversitySubmission.updateMany({
      where: { respondentId: { in: expiredIds } },
      data: { respondentId: null },
    });

    // Excluir os registros de identificação
    const deleteResult = await prisma.diversityRespondent.deleteMany({
      where: { id: { in: expiredIds } },
    });

    await logAccessAction({
      userId: "rh_administrador",
      acao: "retention_cleanup",
      detalhe: `Execução da política de retenção de ${retentionMonths} meses. ${deleteResult.count} registros cadastrais anonimizados.`,
    });

    return NextResponse.json({
      success: true,
      message: `Política de retenção executada. ${deleteResult.count} registros de titulares expirados foram anonimizados com sucesso.`,
      anonymizedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Erro na rotina de retenção:", error);
    return NextResponse.json(
      { error: "Erro ao executar rotina de retenção." },
      { status: 500 }
    );
  }
}
