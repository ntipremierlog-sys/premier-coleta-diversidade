import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";
import { generateDiversityExcel, AggregatedDiversityData } from "@/lib/excel-generator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para exportar a planilha." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unidadeParam = searchParams.get("unidade") || "todas";
    const competenciaParam = searchParams.get("competencia") || "todas";

    const whereClause: any = {};
    if (unidadeParam && unidadeParam !== "todas") {
      whereClause.unidade = unidadeParam;
    }
    if (competenciaParam && competenciaParam !== "todas") {
      whereClause.competencia = competenciaParam;
    }

    const submissions = await prisma.diversitySubmission.findMany({
      where: whereClause,
      include: {
        respondent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const aggregated: AggregatedDiversityData = {
      total: submissions.length,
      genero: {
        feminino: 0,
        masculino: 0,
        outro: 0,
        nao_informado: 0,
      },
      racaCor: {
        branca: 0,
        preta: 0,
        parda: 0,
        amarela: 0,
        indigena: 0,
        nao_informado: 0,
      },
      pcd: {
        sim: 0,
        nao: 0,
        nao_informado: 0,
      },
      neurodivergente: {
        sim: 0,
        nao: 0,
        nao_informado: 0,
      },
      faixaEtaria: {
        ate_29: 0,
        "30_44": 0,
        "45_59": 0,
        "60_mais": 0,
        nao_informado: 0,
      },
      lgbtqiapn: {
        sim: 0,
        nao: 0,
        nao_informado: 0,
      },
      outroGrupoCount: 0,
    };

    submissions.forEach((s) => {
      if (s.genero in aggregated.genero) {
        aggregated.genero[s.genero as keyof typeof aggregated.genero]++;
      }
      if (s.racaCor in aggregated.racaCor) {
        aggregated.racaCor[s.racaCor as keyof typeof aggregated.racaCor]++;
      }
      if (s.pcd in aggregated.pcd) {
        aggregated.pcd[s.pcd as keyof typeof aggregated.pcd]++;
      }
      if (s.neurodivergente in aggregated.neurodivergente) {
        aggregated.neurodivergente[
          s.neurodivergente as keyof typeof aggregated.neurodivergente
        ]++;
      }
      if (s.faixaEtaria in aggregated.faixaEtaria) {
        aggregated.faixaEtaria[
          s.faixaEtaria as keyof typeof aggregated.faixaEtaria
        ]++;
      }
      if (s.lgbtqiapn in aggregated.lgbtqiapn) {
        aggregated.lgbtqiapn[
          s.lgbtqiapn as keyof typeof aggregated.lgbtqiapn
        ]++;
      }
      if (s.outroGrupo && s.outroGrupo.trim().length > 0) {
        aggregated.outroGrupoCount++;
      }
    });

    const excelBuffer = await generateDiversityExcel(
      aggregated,
      submissions as any,
      unidadeParam,
      competenciaParam
    );

    // Log de auditoria
    await logAccessAction({
      userId: session.role || "admin",
      acao: "export_xlsx",
      detalhe: `Exportação Extrato consolidado .xlsx (Unidade: ${unidadeParam}, Competência: ${competenciaParam}).`,
    });

    // Sanitizar nome do arquivo
    const unidadeSlug =
      unidadeParam === "todas"
        ? "Consolidado"
        : unidadeParam.replace(/[^a-zA-Z0-9_-]/g, "_");
    const competenciaSlug =
      competenciaParam === "todas"
        ? "Geral"
        : competenciaParam.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Extrato_Diversidade_${unidadeSlug}_${competenciaSlug}.xlsx`;

    return new NextResponse(excelBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Erro na exportação Excel:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo Excel." },
      { status: 500 }
    );
  }
}
