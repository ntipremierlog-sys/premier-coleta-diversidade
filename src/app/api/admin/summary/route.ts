import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para acessar o resumo." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unidadeParam = searchParams.get("unidade");
    const competenciaParam = searchParams.get("competencia");

    const whereClause: any = {};

    if (unidadeParam && unidadeParam !== "todas") {
      whereClause.unidade = unidadeParam;
    }

    if (competenciaParam && competenciaParam !== "todas") {
      whereClause.competencia = competenciaParam;
    }

    const submissions = await prisma.diversitySubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        unidade: true,
        competencia: true,
        genero: true,
        racaCor: true,
        pcd: true,
        pcdTipo: true,
        neurodivergente: true,
        faixaEtaria: true,
        lgbtqiapn: true,
        outroGrupo: true,
        createdAt: true,
      },
    });

    const total = submissions.length;

    // Agregação dos dados
    const summary = {
      total,
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
      // Gênero
      if (s.genero in summary.genero) {
        summary.genero[s.genero as keyof typeof summary.genero]++;
      }

      // Raça / Cor
      if (s.racaCor in summary.racaCor) {
        summary.racaCor[s.racaCor as keyof typeof summary.racaCor]++;
      }

      // PcD
      if (s.pcd in summary.pcd) {
        summary.pcd[s.pcd as keyof typeof summary.pcd]++;
      }

      // Neurodivergente
      if (s.neurodivergente in summary.neurodivergente) {
        summary.neurodivergente[
          s.neurodivergente as keyof typeof summary.neurodivergente
        ]++;
      }

      // Faixa Etária
      if (s.faixaEtaria in summary.faixaEtaria) {
        summary.faixaEtaria[
          s.faixaEtaria as keyof typeof summary.faixaEtaria
        ]++;
      }

      // LGBTQIAPN+
      if (s.lgbtqiapn in summary.lgbtqiapn) {
        summary.lgbtqiapn[s.lgbtqiapn as keyof typeof summary.lgbtqiapn]++;
      }

      // Outro grupo
      if (s.outroGrupo && s.outroGrupo.trim().length > 0) {
        summary.outroGrupoCount++;
      }
    });

    // Buscar competências e unidades distintas presentes no banco
    const distinctCompetencias = await prisma.diversitySubmission.findMany({
      select: { competencia: true },
      distinct: ["competencia"],
      orderBy: { competencia: "desc" },
    });

    const distinctUnidades = await prisma.diversitySubmission.findMany({
      select: { unidade: true },
      distinct: ["unidade"],
      orderBy: { unidade: "asc" },
    });

    // Regra de K-Anonimato (Alerta quando amostra filtrada for sensível < 5)
    const kAnonymityAlert =
      unidadeParam && unidadeParam !== "todas" && total > 0 && total < 5;

    return NextResponse.json({
      success: true,
      role: session.role,
      data: summary,
      filters: {
        unidade: unidadeParam || "todas",
        competencia: competenciaParam || "todas",
      },
      availableCompetencias: distinctCompetencias.map((c) => c.competencia),
      availableUnidades: distinctUnidades.map((u) => u.unidade),
      kAnonymityAlert,
    });
  } catch (error) {
    console.error("Erro ao gerar resumo admin:", error);
    return NextResponse.json(
      { error: "Erro ao gerar estatísticas agregadas." },
      { status: 500 }
    );
  }
}
