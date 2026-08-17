import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/titulares/consent - Revogação de consentimento de categoria específica
export async function PATCH(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador de RH." },
        { status: 403 }
      );
    }

    const { respondentId, categoria } = await request.json();

    if (!respondentId || !categoria) {
      return NextResponse.json(
        { error: "respondentId e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Gravar nova entrada de consentimento como revogado (aceito: false)
    await prisma.diversityConsent.create({
      data: {
        respondentId,
        categoria,
        aceito: false,
        textoExibido: "Consentimento revogado pelo titular com base no Art. 18, IX da LGPD.",
      },
    });

    // 2. Limpar o dado sensível correspondente na submissão
    const updateData: any = {};
    if (categoria === "raca_cor") updateData.racaCor = "nao_informado";
    if (categoria === "pcd") {
      updateData.pcd = "nao_informado";
      updateData.pcdTipo = null;
    }
    if (categoria === "neurodivergencia") updateData.neurodivergente = "nao_informado";
    if (categoria === "lgbtqiapn") updateData.lgbtqiapn = "nao_informado";
    if (categoria === "genero") updateData.genero = "nao_informado";
    if (categoria === "faixa_etaria") updateData.faixaEtaria = "nao_informado";

    if (Object.keys(updateData).length > 0) {
      await prisma.diversitySubmission.updateMany({
        where: { respondentId },
        data: updateData,
      });
    }

    await logAccessAction({
      userId: "rh_administrador",
      acao: "revoke_consent",
      respondentId,
      detalhe: `Revogação de consentimento para a categoria sensível: ${categoria}`,
    });

    return NextResponse.json({
      success: true,
      message: `Consentimento para a categoria '${categoria}' revogado com sucesso. O dado sensível foi removido.`,
    });
  } catch (error) {
    console.error("Erro ao revogar consentimento:", error);
    return NextResponse.json(
      { error: "Erro ao processar revogação de consentimento." },
      { status: 500 }
    );
  }
}
