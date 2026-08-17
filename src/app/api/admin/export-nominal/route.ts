import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, logAccessAction } from "@/lib/auth";
import ExcelJS from "exceljs";
import { formatCompetencia } from "@/lib/constants";

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

    // Gerar planilha com ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Premier Logistics - Gestão de RH";
    workbook.created = new Date();

    const ws = workbook.addWorksheet("Base Nominal Restrita", {
      views: [{ showGridLines: true }],
    });

    ws.columns = [
      { width: 32 }, // Nome Completo
      { width: 18 }, // CPF Mascarado
      { width: 22 }, // Unidade
      { width: 15 }, // Matrícula
      { width: 16 }, // Competência
      { width: 18 }, // Data Resposta
      { width: 16 }, // Gênero
      { width: 18 }, // Raça/Cor
      { width: 10 }, // PcD
      { width: 22 }, // Tipo PcD
      { width: 18 }, // Neurodivergente
      { width: 18 }, // Faixa Etária
      { width: 15 }, // LGBTQIAPN+
      { width: 28 }, // Outro Grupo
    ];

    // Linha 1: Aviso de Confidencialidade e Dados Sensíveis
    ws.mergeCells("A1:N1");
    const cellA1 = ws.getCell("A1");
    cellA1.value =
      "DOCUMENTO CONTÉM DADOS PESSOAIS E SENSÍVEIS (LGPD) – ACESSO ESTRITAMENTE RESTRITO AO RH, NÃO REDISTRIBUIR.";
    cellA1.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cellA1.alignment = { horizontal: "center", vertical: "middle" };
    cellA1.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF991B1B" }, // Vermelho de alerta de confidencialidade
    };
    ws.getRow(1).height = 28;

    // Linha 2: Metadados
    const todayFormatted = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    ws.mergeCells("A2:N2");
    const cellA2 = ws.getCell("A2");
    cellA2.value = `Exportação Nominal Gerada por rh_administrador em ${todayFormatted} | Filtro Unidade: ${unidadeParam} | Filtro Competência: ${competenciaParam}`;
    cellA2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF374151" } };
    cellA2.alignment = { horizontal: "center", vertical: "middle" };
    cellA2.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
    ws.getRow(2).height = 20;

    // Linha 4: Cabeçalhos da Tabela
    const headers = [
      "Nome Completo",
      "CPF",
      "Unidade",
      "Matrícula",
      "Competência",
      "Data de Envio",
      "Gênero",
      "Raça/Cor",
      "PcD",
      "Tipo PcD",
      "Neurodivergente",
      "Faixa Etária",
      "LGBTQIAPN+",
      "Outro Grupo Declarado",
    ];

    const headerRow = ws.getRow(4);
    headerRow.height = 26;
    headers.forEach((h, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = h;
      cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0B2545" },
      };
      cell.border = {
        top: { style: "medium", color: { argb: "FF071A33" } },
        bottom: { style: "medium", color: { argb: "FF071A33" } },
      };
    });

    const formatLabel = (val: string) => {
      const map: Record<string, string> = {
        feminino: "Feminino",
        masculino: "Masculino",
        outro: "Outro",
        branca: "Branca",
        preta: "Preta",
        parda: "Parda",
        amarela: "Amarela",
        indigena: "Indígena",
        sim: "Sim",
        nao: "Não",
        ate_29: "Até 29 anos",
        "30_44": "30 a 44 anos",
        "45_59": "45 a 59 anos",
        "60_mais": "60 anos ou mais",
        nao_informado: "Não informado / Recusado",
      };
      return map[val] || val || "-";
    };

    submissions.forEach((s, idx) => {
      const rowNum = 5 + idx;
      const row = ws.getRow(rowNum);
      row.height = 20;

      row.getCell(1).value = s.respondent?.nomeCompleto || "[Titular Anonimizado]";
      row.getCell(2).value = s.respondent?.cpf || s.respondent?.cpfMascarado || "-";
      row.getCell(3).value = s.unidade;
      row.getCell(4).value = s.respondent?.matricula || "-";
      row.getCell(5).value = formatCompetencia(s.competencia);
      row.getCell(6).value = new Date(s.createdAt).toLocaleDateString("pt-BR");
      row.getCell(7).value = formatLabel(s.genero);
      row.getCell(8).value = formatLabel(s.racaCor);
      row.getCell(9).value = formatLabel(s.pcd);
      row.getCell(10).value = s.pcdTipo || "-";
      row.getCell(11).value = formatLabel(s.neurodivergente);
      row.getCell(12).value = formatLabel(s.faixaEtaria);
      row.getCell(13).value = formatLabel(s.lgbtqiapn);
      row.getCell(14).value = s.outroGrupo || "-";

      const isEven = idx % 2 === 0;
      for (let c = 1; c <= 14; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Arial", size: 9 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        if (isEven) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
        if (c >= 2 && c <= 6) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (c >= 7 && c <= 13) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else {
          cell.alignment = { vertical: "middle" };
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // Log de auditoria
    await logAccessAction({
      userId: "rh_administrador",
      acao: "export_nominal",
      detalhe: `Exportação nominal .xlsx com ${submissions.length} registros (Unidade: ${unidadeParam}, Competência: ${competenciaParam}).`,
    });

    const filename = `Extrato_Nominal_Restrito_${unidadeParam}_${competenciaParam}.xlsx`;

    return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Erro na exportação nominal Excel:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo nominal." },
      { status: 500 }
    );
  }
}
