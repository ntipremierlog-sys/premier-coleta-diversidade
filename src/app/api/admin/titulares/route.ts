import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";
import { cleanCpf, hashCpf } from "@/lib/cpf-utils";

export const dynamic = "force-dynamic";

// GET /api/admin/titulares?q=termo_busca
export async function GET(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao perfil de Administrador de RH (LGPD)." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const rawDigits = cleanCpf(query);
    const isCpfQuery = rawDigits.length >= 3;

    let respondents = [];

    if (isCpfQuery && rawDigits.length === 11) {
      // Busca exata por CPF com Hash
      const targetHash = hashCpf(rawDigits);
      respondents = await prisma.diversityRespondent.findMany({
        where: { cpfHash: targetHash },
        include: {
          consents: { orderBy: { dataResposta: "desc" } },
          submission: true,
        },
      });
    } else {
      // Busca por Nome
      respondents = await prisma.diversityRespondent.findMany({
        where: query
          ? {
              nomeCompleto: {
                contains: query,
              },
            }
          : undefined,
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          consents: { orderBy: { dataResposta: "desc" } },
          submission: true,
        },
      });
    }

    // Registrar auditoria de consulta individual
    await logAccessAction({
      userId: "rh_administrador",
      acao: "view_individual",
      detalhe: query ? `Busca por: ${query.length > 20 ? query.slice(0, 20) + "..." : query}` : "Listagem geral de titulares",
    });

    return NextResponse.json({
      success: true,
      respondents,
    });
  } catch (error) {
    console.error("Erro ao buscar titulares:", error);
    return NextResponse.json(
      { error: "Erro ao processar consulta de titulares." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/titulares - Retificação cadastral
export async function PUT(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador de RH." },
        { status: 403 }
      );
    }

    const { id, nomeCompleto, matricula, unidade } = await request.json();

    if (!id || !nomeCompleto) {
      return NextResponse.json(
        { error: "ID e Nome Completo são obrigatórios." },
        { status: 400 }
      );
    }

    const updated = await prisma.diversityRespondent.update({
      where: { id },
      data: {
        nomeCompleto: nomeCompleto.trim(),
        matricula: matricula?.trim() || null,
        unidade: unidade || undefined,
      },
    });

    // Se unidade mudou, atualizar submissão vinculada
    if (unidade) {
      await prisma.diversitySubmission.updateMany({
        where: { respondentId: id },
        data: { unidade },
      });
    }

    await logAccessAction({
      userId: "rh_administrador",
      acao: "update_request",
      respondentId: id,
      detalhe: `Retificação de dados cadastrais para titular ID: ${id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Dados do titular retificados com sucesso.",
      respondent: updated,
    });
  } catch (error) {
    console.error("Erro ao retificar titular:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados do titular." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/titulares - Exclusão de titular com preservação de anonimização agregada
export async function DELETE(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated || session.role !== "rh_administrador") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador de RH." },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID do titular é obrigatório." },
        { status: 400 }
      );
    }

    // Desvincular submissão antes de excluir o titular (garante anonimização)
    await prisma.diversitySubmission.updateMany({
      where: { respondentId: id },
      data: { respondentId: null },
    });

    // Excluir respondent e seus consentimentos (Cascade)
    await prisma.diversityRespondent.delete({
      where: { id },
    });

    await logAccessAction({
      userId: "rh_administrador",
      acao: "delete_request",
      respondentId: id,
      detalhe: `Exclusão definitiva de identificação do titular (Submissão preservada anonimamente).`,
    });

    return NextResponse.json({
      success: true,
      message:
        "Titular excluído com sucesso. Os dados estatísticos foram preservados anonimamente.",
    });
  } catch (error) {
    console.error("Erro ao excluir titular:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação de exclusão." },
      { status: 500 }
    );
  }
}
