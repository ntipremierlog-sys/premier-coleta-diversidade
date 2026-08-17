import ExcelJS from "exceljs";
import { formatCompetencia } from "./constants";

export interface AggregatedDiversityData {
  total: number;
  genero: {
    feminino: number;
    masculino: number;
    outro: number;
    nao_informado: number;
  };
  racaCor: {
    branca: number;
    preta: number;
    parda: number;
    amarela: number;
    indigena: number;
    nao_informado: number;
  };
  pcd: {
    sim: number;
    nao: number;
    nao_informado: number;
  };
  neurodivergente: {
    sim: number;
    nao: number;
    nao_informado: number;
  };
  faixaEtaria: {
    ate_29: number;
    "30_44": number;
    "45_59": number;
    "60_mais": number;
    nao_informado: number;
  };
  lgbtqiapn: {
    sim: number;
    nao: number;
    nao_informado: number;
  };
  outroGrupoCount: number;
}

export interface SubmissionRecord {
  id: string;
  unidade: string;
  competencia: string;
  genero: string;
  racaCor: string;
  pcd: string;
  pcdTipo: string | null;
  neurodivergente: string;
  faixaEtaria: string;
  lgbtqiapn: string;
  outroGrupo: string | null;
  createdAt: Date;
  respondent?: {
    nomeCompleto: string;
    cpf?: string | null;
    cpfMascarado: string;
    matricula: string | null;
    unidade: string;
  } | null;
}

export async function generateDiversityExcel(
  data: AggregatedDiversityData,
  submissions: SubmissionRecord[],
  unidade: string,
  competencia: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Premier Logistics - Gestão Empresarial";
  workbook.created = new Date();

  const premierNavy = "180B38";
  const premierNavyDark = "100626";
  const premierAccent = "E5D2B8";
  const bgLight = "F8F9FC";
  const borderGray = "D1D5DB";

  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const competenciaTexto = formatCompetencia(competencia) || "Todas / Consolidado";
  const unidadeTexto = unidade && unidade !== "todas" ? unidade : "Consolidado Geral";

  // ==========================================
  // ABA 1: EXTRATO DE DIVERSIDADE (QUANTITATIVO)
  // ==========================================
  const ws1 = workbook.addWorksheet("Extrato de Diversidade", {
    views: [{ showGridLines: true }],
  });

  ws1.columns = [
    { width: 28 }, // A: Grupo sub-representado
    { width: 34 }, // B: Categoria / Recorte
    { width: 28 }, // C: Quantidade de profissionais
    { width: 20 }, // D: % sobre o total
    { width: 35 }, // E: Observações
    { width: 45 }, // F: Critério de apuração
  ];

  // Linha 1: Título Principal Mesclado
  ws1.mergeCells("A1:F1");
  const cellA1 = ws1.getCell("A1");
  cellA1.value = "EXTRATO DE DIVERSIDADE – QUANTITATIVO DE PROFISSIONAIS";
  cellA1.font = { name: "Arial", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  cellA1.alignment = { horizontal: "center", vertical: "middle" };
  cellA1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws1.getRow(1).height = 30;

  // Linha 2: Subtítulo / Aviso LGPD
  ws1.mergeCells("A2:F2");
  const cellA2 = ws1.getCell("A2");
  cellA2.value =
    "Preencher somente com quantitativos, sem nomes ou outros dados que permitam a identificação individual dos profissionais.";
  cellA2.font = { name: "Arial", size: 9.5, italic: true, color: { argb: "FF4B5563" } };
  cellA2.alignment = { horizontal: "center", vertical: "middle" };
  cellA2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  ws1.getRow(2).height = 22;

  // Linha 3: Metadados da Empresa, Competência e Data
  ws1.getCell("A3").value = "Empresa:";
  ws1.getCell("A3").font = { bold: true, size: 9.5 };
  ws1.getCell("B3").value = `Premier Logistics Gestão Empresarial (${unidadeTexto})`;
  ws1.getCell("B3").font = { size: 9.5 };

  ws1.getCell("C3").value = "Competência:";
  ws1.getCell("C3").font = { bold: true, size: 9.5 };
  ws1.getCell("D3").value = competenciaTexto;
  ws1.getCell("D3").font = { size: 9.5 };

  ws1.getCell("E3").value = "Data de preenchimento:";
  ws1.getCell("E3").font = { bold: true, size: 9.5 };
  ws1.getCell("F3").value = todayFormatted;
  ws1.getCell("F3").font = { size: 9.5 };

  ws1.getRow(3).height = 24;
  ["A3", "B3", "C3", "D3", "E3", "F3"].forEach((cellId) => {
    const c = ws1.getCell(cellId);
    c.alignment = { vertical: "middle" };
    c.border = {
      bottom: { style: "thin", color: { argb: borderGray } },
    };
  });

  // Linha 4: Cabeçalhos da Tabela
  const headers = [
    "Grupo sub-representado",
    "Categoria / Recorte",
    "Quantidade de profissionais",
    "% sobre o total",
    "Observações",
    "Critério de apuração",
  ];

  const headerRow = ws1.getRow(4);
  headerRow.height = 26;
  headers.forEach((h, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = {
      horizontal: index === 2 || index === 3 ? "center" : "left",
      vertical: "middle",
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: premierNavy },
    };
    cell.border = {
      top: { style: "medium", color: { argb: premierNavyDark } },
      bottom: { style: "medium", color: { argb: premierNavyDark } },
      left: { style: "thin", color: { argb: "FF374151" } },
      right: { style: "thin", color: { argb: "FF374151" } },
    };
  });

  // Linhas de Dados (Linhas 5 a 17)
  const totalSubmissions = data.total;
  const generoOutroNaoInfo = data.genero.outro + data.genero.nao_informado;
  const racaPretaParda = data.racaCor.preta + data.racaCor.parda;

  const dataRows = [
    {
      grupo: "Gênero",
      recorte: "Feminino",
      qtd: data.genero.feminino,
      obs: "Autodeclaração",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Gênero",
      recorte: "Masculino",
      qtd: data.genero.masculino,
      obs: "Autodeclaração",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Gênero",
      recorte: "Outro / Não informado",
      qtd: generoOutroNaoInfo,
      obs: "Autodeclaração",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça/Cor",
      recorte: "Preta ou parda",
      qtd: racaPretaParda,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual (soma de pretos e pardos)",
    },
    {
      grupo: "Raça/Cor",
      recorte: "Branca",
      qtd: data.racaCor.branca,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça/Cor",
      recorte: "Amarela",
      qtd: data.racaCor.amarela,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça/Cor",
      recorte: "Indígena",
      qtd: data.racaCor.indigena,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça/Cor",
      recorte: "Não informado",
      qtd: data.racaCor.nao_informado,
      obs: "Não informado",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Pessoa com deficiência",
      recorte: "Pessoa com deficiência – geral",
      qtd: data.pcd.sim,
      obs: "PcD com autodeclaração",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Neurodiversidade",
      recorte: "Pessoa neurodivergente",
      qtd: data.neurodivergente.sim,
      obs: "TDAH, TEA, dislexia e afins",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Faixa etária",
      recorte: "Idosos – 60 anos ou mais",
      qtd: data.faixaEtaria["60_mais"],
      obs: "Faixa 60+ anos",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "LGBTQIAPN+",
      recorte: "Comunidade LGBTQIAPN+",
      qtd: data.lgbtqiapn.sim,
      obs: "Autodeclaração",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Outros grupos",
      recorte: "Outro grupo sub-representado",
      qtd: data.outroGrupoCount,
      obs: "Grupos adicionais autodeclarados",
      criterio: "Autodeclaração individual",
    },
  ];

  dataRows.forEach((item, idx) => {
    const rowNumber = 5 + idx;
    const row = ws1.getRow(rowNumber);
    row.height = 20;

    row.getCell(1).value = item.grupo;
    row.getCell(2).value = item.recorte;
    row.getCell(3).value = item.qtd;

    row.getCell(4).value = {
      formula: `IF(C18>0, C${rowNumber}/C18, 0)`,
      result: totalSubmissions > 0 ? item.qtd / totalSubmissions : 0,
    };
    row.getCell(4).numFmt = "0.00%";

    row.getCell(5).value = item.obs;
    row.getCell(6).value = item.criterio;

    const isEven = idx % 2 === 0;
    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Arial", size: 9.5 };
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
      if (c === 3 || c === 4) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { vertical: "middle" };
      }
    }
  });

  // Linha 18: Total de Profissionais Considerados
  const totalRow = ws1.getRow(18);
  totalRow.height = 24;
  totalRow.getCell(1).value = "TOTAL DE PROFISSIONAIS";
  totalRow.getCell(2).value = "CONSIDERADOS";
  totalRow.getCell(3).value = totalSubmissions;
  totalRow.getCell(4).value = 1.0;
  totalRow.getCell(4).numFmt = "0.00%";
  totalRow.getCell(5).value = "Base total de respondentes";
  totalRow.getCell(6).value = "Total de profissionais válidos considerados no período";

  for (let c = 1; c <= 6; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: premierNavyDark } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E7FF" },
    };
    cell.border = {
      top: { style: "medium", color: { argb: premierNavy } },
      bottom: { style: "double", color: { argb: premierNavy } },
      left: { style: "thin", color: { argb: borderGray } },
      right: { style: "thin", color: { argb: borderGray } },
    };
    if (c === 3 || c === 4) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    } else {
      cell.alignment = { vertical: "middle" };
    }
  }

  // Linha 20+: Orientações
  ws1.getCell("A20").value = "ORIENTAÇÕES DE PREENCHIMENTO:";
  ws1.getCell("A20").font = { name: "Arial", size: 10, bold: true, color: { argb: premierNavy } };

  const orientacoes = [
    "1. Este extrato foi gerado automaticamente pelo Sistema de Autodeclaração de Diversidade da Premier Logistics.",
    "2. A Aba 2 contém os registros nominais individuais coletados (Nome, CPF Mascarado, Matrícula e Respostas).",
    "3. A categoria 'Preta ou parda' consolida os respondentes autodeclarados pretos e pardos (classificação IBGE / Estatuto da Igualdade Racial).",
    "4. Os percentuais são apurados com base no total de colaboradores que responderam ao formulário na respectiva competência.",
  ];

  orientacoes.forEach((texto, i) => {
    const r = 21 + i;
    ws1.mergeCells(`A${r}:F${r}`);
    const cell = ws1.getCell(`A${r}`);
    cell.value = texto;
    cell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF4B5563" } };
    cell.alignment = { vertical: "middle" };
  });

  // ==========================================
  // ABA 2: RESPOSTAS NOMINAIS (NOME + CPF + RESPOSTAS)
  // ==========================================
  const wsNominal = workbook.addWorksheet("Respostas Nominais (Nome+CPF)", {
    views: [{ showGridLines: true }],
  });

  wsNominal.columns = [
    { width: 34 }, // A: Nome Completo
    { width: 20 }, // B: CPF Mascarado
    { width: 22 }, // C: Unidade / Filial
    { width: 16 }, // D: Matrícula
    { width: 18 }, // E: Competência
    { width: 18 }, // F: Data de Envio
    { width: 18 }, // G: Gênero
    { width: 18 }, // H: Raça / Cor (IBGE)
    { width: 12 }, // I: PcD
    { width: 24 }, // J: Tipo de Deficiência
    { width: 20 }, // K: Neurodivergência
    { width: 18 }, // L: Faixa Etária
    { width: 16 }, // M: LGBTQIAPN+
    { width: 30 }, // N: Outro Grupo Declarado
  ];

  // Linha 1: Título da Aba Nominal
  wsNominal.mergeCells("A1:N1");
  const cellN1 = wsNominal.getCell("A1");
  cellN1.value = "BASE NOMINAL DE AUTODECLARAÇÕES – PREMIER LOGISTICS";
  cellN1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  cellN1.alignment = { horizontal: "center", vertical: "middle" };
  cellN1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  wsNominal.getRow(1).height = 28;

  // Linha 2: Metadados
  wsNominal.mergeCells("A2:N2");
  const cellN2 = wsNominal.getCell("A2");
  cellN2.value = `Competência: ${competenciaTexto} | Unidade: ${unidadeTexto} | Registros emitidos em: ${todayFormatted}`;
  cellN2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF374151" } };
  cellN2.alignment = { horizontal: "center", vertical: "middle" };
  cellN2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  wsNominal.getRow(2).height = 20;

  // Linha 4: Cabeçalhos
  const nominalHeaders = [
    "Nome Completo",
    "CPF",
    "Unidade",
    "Matrícula",
    "Competência",
    "Data de Envio",
    "Gênero",
    "Raça / Cor",
    "PcD",
    "Tipo de Deficiência",
    "Neurodivergência",
    "Faixa Etária",
    "LGBTQIAPN+",
    "Outro Grupo Declarado",
  ];

  const nHeaderRow = wsNominal.getRow(4);
  nHeaderRow.height = 26;
  nominalHeaders.forEach((h, index) => {
    const cell = nHeaderRow.getCell(index + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: premierNavy },
    };
    cell.border = {
      top: { style: "medium", color: { argb: premierNavyDark } },
      bottom: { style: "medium", color: { argb: premierNavyDark } },
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
    const row = wsNominal.getRow(rowNum);
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

  // ==========================================
  // ABA 3: APOIO E METODOLOGIA
  // ==========================================
  const ws3 = workbook.addWorksheet("Apoio e Metodologia", {
    views: [{ showGridLines: true }],
  });

  ws3.columns = [
    { width: 30 }, // Campo / Recorte
    { width: 85 }, // Orientação Conceitual / Base Normativa
  ];

  // Título da Aba 3
  ws3.mergeCells("A1:B1");
  const cellM1 = ws3.getCell("A1");
  cellM1.value = "GUIA DE APOIO E METODOLOGIA – EXTRATO DE DIVERSIDADE";
  cellM1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  cellM1.alignment = { horizontal: "center", vertical: "middle" };
  cellM1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws3.getRow(1).height = 28;

  // Cabeçalho da Aba 3
  const mHeader = ws3.getRow(3);
  mHeader.height = 24;
  mHeader.getCell(1).value = "Campo / Recorte";
  mHeader.getCell(2).value = "Orientação Conceitual & Base Normativa";
  [1, 2].forEach((c) => {
    const cell = mHeader.getCell(c);
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: premierNavy },
    };
    cell.alignment = { vertical: "middle" };
  });

  const metodologiaData = [
    {
      campo: "Gênero",
      orientacao:
        "Identidade de gênero informada voluntariamente pelo profissional (Feminino, Masculino, Outro ou Não Informado).",
    },
    {
      campo: "Raça/Cor (IBGE)",
      orientacao:
        "Classificação oficial do IBGE: Branca, Preta, Parda, Amarela, Indígena. Baseada exclusivamente na autodeclaração do indivíduo.",
    },
    {
      campo: "Pretos e Pardos (População Negra)",
      orientacao:
        "No padrão estatístico brasileiro e no Estatuto da Igualdade Racial (Lei nº 12.288/2010), o grupo 'População Negra' é formado pelo somatório das pessoas autodeclaradas pretas e pardas.",
    },
    {
      campo: "Pessoa com Deficiência (PcD)",
      orientacao:
        "Definição da Lei Brasileira de Inclusão (Lei nº 13.146/2015): impedimentos de longo prazo de natureza física, mental, intelectual ou sensorial que possam obstruir a participação plena na sociedade.",
    },
    {
      campo: "Neurodiversidade",
      orientacao:
        "Variações naturais no funcionamento neurológico e cognitivo humano, incluindo Transtorno do Espectro Autista (TEA), TDAH, Dislexia, Discalculia, entre outros.",
    },
    {
      campo: "Faixa Etária (Idosos - 60+)",
      orientacao:
        "Critério em conformidade com o Estatuto da Pessoa Idosa (Lei nº 10.741/2003), considerando profissionais com 60 anos ou mais.",
    },
    {
      campo: "Comunidade LGBTQIAPN+",
      orientacao:
        "Pessoas que se identificam como Lésbicas, Gays, Bissexuais, Transgêneros, Queer, Intersexo, Assexuais, Pansexuais, Não-binários e outras identidades de gênero e orientações afetivo-sexuais.",
    },
    {
      campo: "Privacidade e LGPD",
      orientacao:
        "Em estrita consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), os dados são tratados para fins de atualização cadastral e políticas internas de inclusão.",
    },
  ];

  metodologiaData.forEach((item, idx) => {
    const row = ws3.getRow(4 + idx);
    row.height = 36;
    row.getCell(1).value = item.campo;
    row.getCell(2).value = item.orientacao;

    const isEven = idx % 2 === 0;
    [1, 2].forEach((c) => {
      const cell = row.getCell(c);
      cell.font = { name: "Arial", size: 9.5 };
      cell.alignment = { vertical: "middle", wrapText: true };
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
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
