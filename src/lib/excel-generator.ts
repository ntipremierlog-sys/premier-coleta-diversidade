import ExcelJS from "exceljs";
import { formatCompetencia } from "./constants";

export interface AggregatedDiversityData {
  total: number;
  genero: {
    feminino: number;
    masculino: number;
    mulher_trans: number;
    homem_trans: number;
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
  const generoOutroNaoInfo =
    data.genero.outro +
    data.genero.nao_informado +
    (data.genero.mulher_trans || 0) +
    (data.genero.homem_trans || 0);
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
      mulher_trans: "Mulher Trans",
      homem_trans: "Homem Trans",
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

// =========================================================================
// NOVO RELATÓRIO PREMIER: CONTEMPLA AS CATEGORIAS EXPANDIDAS (MULHER/HOMEM TRANS)
// =========================================================================
export async function generatePremierDiversityExcel(
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
  const borderGray = "D1D5DB";

  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const competenciaTexto = formatCompetencia(competencia) || "Todas / Consolidado";
  const unidadeTexto = unidade && unidade !== "todas" ? unidade : "Consolidado Geral";

  // ==========================================
  // ABA 1: RELATÓRIO PREMIER - INDICADORES
  // ==========================================
  const ws1 = workbook.addWorksheet("Relatório Premier", {
    views: [{ showGridLines: true }],
  });

  ws1.columns = [
    { width: 28 }, // A: Grupo / Dimensão
    { width: 34 }, // B: Categoria / Identidade
    { width: 28 }, // C: Quantidade de profissionais
    { width: 20 }, // D: % sobre o total
    { width: 35 }, // E: Tipo de Autodeclaração
    { width: 45 }, // F: Critério & Observações
  ];

  // Linha 1: Título Principal Mesclado
  ws1.mergeCells("A1:F1");
  const cellA1 = ws1.getCell("A1");
  cellA1.value = "RELATÓRIO DE DIVERSIDADE & INCLUSÃO – PREMIER LOGISTICS";
  cellA1.font = { name: "Arial", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  cellA1.alignment = { horizontal: "center", vertical: "middle" };
  cellA1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws1.getRow(1).height = 32;

  // Linha 2: Subtítulo
  ws1.mergeCells("A2:F2");
  const cellA2 = ws1.getCell("A2");
  cellA2.value =
    "Relatório interno corporativo com dados quantitativos segmentados em conformidade com a LGPD.";
  cellA2.font = { name: "Arial", size: 9.5, italic: true, color: { argb: "FF4B5563" } };
  cellA2.alignment = { horizontal: "center", vertical: "middle" };
  cellA2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  ws1.getRow(2).height = 22;

  // Linha 3: Metadados
  ws1.getCell("A3").value = "Empresa:";
  ws1.getCell("A3").font = { bold: true, size: 9.5 };
  ws1.getCell("B3").value = `Premier Logistics Gestão Empresarial (${unidadeTexto})`;
  ws1.getCell("B3").font = { size: 9.5 };

  ws1.getCell("C3").value = "Competência:";
  ws1.getCell("C3").font = { bold: true, size: 9.5 };
  ws1.getCell("D3").value = competenciaTexto;
  ws1.getCell("D3").font = { size: 9.5 };

  ws1.getCell("E3").value = "Data de emissão:";
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

  // Linha 4: Cabeçalhos
  const headers = [
    "Grupo / Dimensão",
    "Categoria / Identidade",
    "Quantidade de profissionais",
    "% sobre o total",
    "Tipo de Autodeclaração",
    "Critério & Observações",
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

  const totalSubmissions = data.total;

  const premierDataRows = [
    // Gênero - Com Mulher Trans e Homem Trans destacados
    {
      grupo: "Gênero",
      recorte: "Feminino",
      qtd: data.genero.feminino,
      obs: "Autodeclaração individual",
      criterio: "Identidade de gênero feminina",
    },
    {
      grupo: "Gênero",
      recorte: "Masculino",
      qtd: data.genero.masculino,
      obs: "Autodeclaração individual",
      criterio: "Identidade de gênero masculina",
    },
    {
      grupo: "Gênero",
      recorte: "Mulher Trans",
      qtd: data.genero.mulher_trans || 0,
      obs: "Autodeclaração individual",
      criterio: "Pessoa que se identifica com o gênero feminino",
    },
    {
      grupo: "Gênero",
      recorte: "Homem Trans",
      qtd: data.genero.homem_trans || 0,
      obs: "Autodeclaração individual",
      criterio: "Pessoa que se identifica com o gênero masculino",
    },
    {
      grupo: "Gênero",
      recorte: "Outro",
      qtd: data.genero.outro,
      obs: "Autodeclaração individual",
      criterio: "Outras identidades não-binárias / fluidas",
    },
    {
      grupo: "Gênero",
      recorte: "Prefiro não informar",
      qtd: data.genero.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado / consentimento não emitido",
    },
    // Raça / Cor (IBGE)
    {
      grupo: "Raça / Cor",
      recorte: "Branca",
      qtd: data.racaCor.branca,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça / Cor",
      recorte: "Preta",
      qtd: data.racaCor.preta,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça / Cor",
      recorte: "Parda",
      qtd: data.racaCor.parda,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça / Cor",
      recorte: "Amarela",
      qtd: data.racaCor.amarela,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça / Cor",
      recorte: "Indígena",
      qtd: data.racaCor.indigena,
      obs: "Classificação IBGE",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Raça / Cor",
      recorte: "Não informado",
      qtd: data.racaCor.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado individual",
    },
    // PcD
    {
      grupo: "Pessoa com deficiência",
      recorte: "PcD (Sim)",
      qtd: data.pcd.sim,
      obs: "Lei Brasileira de Inclusão (13.146/2015)",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Pessoa com deficiência",
      recorte: "Não PcD",
      qtd: data.pcd.nao,
      obs: "Autodeclaração individual",
      criterio: "Não se autodeclara pessoa com deficiência",
    },
    {
      grupo: "Pessoa com deficiência",
      recorte: "Não informado",
      qtd: data.pcd.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado individual",
    },
    // Neurodiversidade
    {
      grupo: "Neurodiversidade",
      recorte: "Pessoa neurodivergente (Sim)",
      qtd: data.neurodivergente.sim,
      obs: "TEA, TDAH, Dislexia, etc.",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Neurodiversidade",
      recorte: "Não neurodivergente",
      qtd: data.neurodivergente.nao,
      obs: "Autodeclaração individual",
      criterio: "Não se autodeclara neurodivergente",
    },
    {
      grupo: "Neurodiversidade",
      recorte: "Não informado",
      qtd: data.neurodivergente.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado individual",
    },
    // Faixa Etária
    {
      grupo: "Faixa Etária",
      recorte: "Até 29 anos",
      qtd: data.faixaEtaria.ate_29,
      obs: "Jovens profissionais",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Faixa Etária",
      recorte: "30 a 44 anos",
      qtd: data.faixaEtaria["30_44"],
      obs: "Adultos",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Faixa Etária",
      recorte: "45 a 59 anos",
      qtd: data.faixaEtaria["45_59"],
      obs: "Maturidade profissional",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Faixa Etária",
      recorte: "60 anos ou mais",
      qtd: data.faixaEtaria["60_mais"],
      obs: "Estatuto da Pessoa Idosa",
      criterio: "Autodeclaração individual",
    },
    {
      grupo: "Faixa Etária",
      recorte: "Não informado",
      qtd: data.faixaEtaria.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado individual",
    },
    // LGBTQIAPN+
    {
      grupo: "LGBTQIAPN+",
      recorte: "Comunidade LGBTQIAPN+ (Sim)",
      qtd: data.lgbtqiapn.sim,
      obs: "Autodeclaração individual",
      criterio: "Autodeclaração de pertencimento",
    },
    {
      grupo: "LGBTQIAPN+",
      recorte: "Não LGBTQIAPN+",
      qtd: data.lgbtqiapn.nao,
      obs: "Autodeclaração individual",
      criterio: "Não pertencente à comunidade",
    },
    {
      grupo: "LGBTQIAPN+",
      recorte: "Não informado",
      qtd: data.lgbtqiapn.nao_informado,
      obs: "Opção resguardada pela LGPD",
      criterio: "Não informado individual",
    },
    // Outros grupos
    {
      grupo: "Outros grupos",
      recorte: "Outro grupo sub-representado declarado",
      qtd: data.outroGrupoCount,
      obs: "Grupos adicionais autodeclarados",
      criterio: "Texto livre informado pelo colaborador",
    },
  ];

  const totalRowNumber = 5 + premierDataRows.length;

  premierDataRows.forEach((item, idx) => {
    const rowNumber = 5 + idx;
    const row = ws1.getRow(rowNumber);
    row.height = 20;

    row.getCell(1).value = item.grupo;
    row.getCell(2).value = item.recorte;
    row.getCell(3).value = item.qtd;

    row.getCell(4).value = {
      formula: `IF(C${totalRowNumber}>0, C${rowNumber}/C${totalRowNumber}, 0)`,
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

  // Linha Total de Profissionais
  const totalRow = ws1.getRow(totalRowNumber);
  totalRow.height = 24;
  totalRow.getCell(1).value = "TOTAL DE PROFISSIONAIS";
  totalRow.getCell(2).value = "CONSIDERADOS NA BASE";
  totalRow.getCell(3).value = totalSubmissions;
  totalRow.getCell(4).value = 1.0;
  totalRow.getCell(4).numFmt = "0.00%";
  totalRow.getCell(5).value = "Base total de respondentes";
  totalRow.getCell(6).value = "Total de autodeclarações válidas computadas no período";

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

  // Linhas de Orientações Premier
  const orientacoesStartRow = totalRowNumber + 2;
  ws1.getCell(`A${orientacoesStartRow}`).value = "DIRETRIZES & ORIENTAÇÕES PREMIER LOGISTICS:";
  ws1.getCell(`A${orientacoesStartRow}`).font = { name: "Arial", size: 10, bold: true, color: { argb: premierNavy } };

  const orientacoesPremier = [
    "1. Relatório Premier gerado pelo Sistema de Autodeclaração de Diversidade da Premier Logistics com recorte expandido de gênero.",
    "2. As categorias 'Mulher Trans' e 'Homem Trans' respeitam integralmente a autodeclaração e identidade do colaborador.",
    "3. A Aba 2 apresenta a listagem com registros individuais para fins exclusivos de gestão de RH e D&I.",
    "4. Tratamento realizado em estrita conformidade com a LGPD (Lei nº 13.709/2018), resguardando sigilo e não-discriminação.",
  ];

  orientacoesPremier.forEach((texto, i) => {
    const r = orientacoesStartRow + 1 + i;
    ws1.mergeCells(`A${r}:F${r}`);
    const cell = ws1.getCell(`A${r}`);
    cell.value = texto;
    cell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF4B5563" } };
    cell.alignment = { vertical: "middle" };
  });

  // ==========================================
  // ABA 2: RESPOSTAS NOMINAIS
  // ==========================================
  const wsNominal = workbook.addWorksheet("Respostas Nominais", {
    views: [{ showGridLines: true }],
  });

  wsNominal.columns = [
    { width: 34 }, // A: Nome Completo
    { width: 20 }, // B: CPF Mascarado
    { width: 22 }, // C: Unidade / Filial
    { width: 16 }, // D: Matrícula
    { width: 18 }, // E: Competência
    { width: 18 }, // F: Data de Envio
    { width: 20 }, // G: Gênero
    { width: 18 }, // H: Raça / Cor (IBGE)
    { width: 12 }, // I: PcD
    { width: 24 }, // J: Tipo de Deficiência
    { width: 20 }, // K: Neurodivergência
    { width: 18 }, // L: Faixa Etária
    { width: 16 }, // M: LGBTQIAPN+
    { width: 30 }, // N: Outro Grupo Declarado
  ];

  wsNominal.mergeCells("A1:N1");
  const cellPN1 = wsNominal.getCell("A1");
  cellPN1.value = "BASE NOMINAL DE DIVERSIDADE & INCLUSÃO – PREMIER LOGISTICS";
  cellPN1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  cellPN1.alignment = { horizontal: "center", vertical: "middle" };
  cellPN1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  wsNominal.getRow(1).height = 28;

  wsNominal.mergeCells("A2:N2");
  const cellPN2 = wsNominal.getCell("A2");
  cellPN2.value = `Competência: ${competenciaTexto} | Unidade: ${unidadeTexto} | Registros emitidos em: ${todayFormatted} | Relatório Premier`;
  cellPN2.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF374151" } };
  cellPN2.alignment = { horizontal: "center", vertical: "middle" };
  cellPN2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  wsNominal.getRow(2).height = 20;

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

  const pHeaderRow = wsNominal.getRow(4);
  pHeaderRow.height = 26;
  nominalHeaders.forEach((h, index) => {
    const cell = pHeaderRow.getCell(index + 1);
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

  const formatLabelPremier = (val: string) => {
    const map: Record<string, string> = {
      feminino: "Feminino",
      masculino: "Masculino",
      mulher_trans: "Mulher Trans",
      homem_trans: "Homem Trans",
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
    row.getCell(7).value = formatLabelPremier(s.genero);
    row.getCell(8).value = formatLabelPremier(s.racaCor);
    row.getCell(9).value = formatLabelPremier(s.pcd);
    row.getCell(10).value = s.pcdTipo || "-";
    row.getCell(11).value = formatLabelPremier(s.neurodivergente);
    row.getCell(12).value = formatLabelPremier(s.faixaEtaria);
    row.getCell(13).value = formatLabelPremier(s.lgbtqiapn);
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
      if ([2, 4, 5, 6, 9, 13].includes(c)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { vertical: "middle" };
      }
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// =========================================================================
// RELATÓRIO INSTITUCIONAL DE CONFORMIDADE & PRÁTICAS DE INCLUSÃO
// Modelo probatório corporativo (Excel) com ateste de voluntariedade e termos legais
// =========================================================================
export async function generateComplianceExcel(
  data: AggregatedDiversityData,
  submissions: SubmissionRecord[],
  unidade: string,
  competencia: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Premier Logistics - Gestão Empresarial / Conformidade";
  workbook.created = new Date();

  const premierNavy = "180B38";
  const premierNavyDark = "100626";
  const borderGray = "D1D5DB";

  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const competenciaTexto = formatCompetencia(competencia) || "Todas / Consolidado";
  const unidadeTexto = unidade && unidade !== "todas" ? unidade : "Consolidado Geral";

  // ==========================================
  // ABA 1: DECLARAÇÃO INSTITUCIONAL & CONFORMIDADE
  // ==========================================
  const ws1 = workbook.addWorksheet("Declaração Institucional", {
    views: [{ showGridLines: true }],
  });

  ws1.columns = [{ width: 26 }, { width: 85 }];

  // Cabeçalho Principal
  ws1.mergeCells("A1:B1");
  const h1 = ws1.getCell("A1");
  h1.value = "RELATÓRIO INSTITUCIONAL DE PRÁTICAS DE INCLUSÃO, DIVERSIDADE & GOVERNANÇA";
  h1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  h1.alignment = { horizontal: "center", vertical: "middle" };
  h1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws1.getRow(1).height = 32;

  // Subtítulo
  ws1.mergeCells("A2:B2");
  const h2 = ws1.getCell("A2");
  h2.value =
    "Demonstrativo oficial de conformidade legal, voluntariedade de participação e políticas afirmativas da Premier Logistics.";
  h2.font = { name: "Arial", size: 9.5, italic: true, color: { argb: "FF4B5563" } };
  h2.alignment = { horizontal: "center", vertical: "middle" };
  h2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  ws1.getRow(2).height = 22;

  // Bloco de Identificação
  const metaRows = [
    ["Organização:", `Premier Logistics Gestão Empresarial Ltda. (${unidadeTexto})`],
    ["Competência de Apuração:", competenciaTexto],
    ["Data e Hora de Emissão:", todayFormatted],
    ["Total de Colaboradores Participantes:", `${data.total} profissionais válidos`],
    ["Finalidade do Relatório:", "Comprovação institucional de boas práticas, conformidade LGPD e ações afirmativas de diversidade."],
  ];

  metaRows.forEach((r, idx) => {
    const rowNum = 4 + idx;
    const row = ws1.getRow(rowNum);
    row.height = 22;
    row.getCell(1).value = r[0];
    row.getCell(1).font = { name: "Arial", size: 9.5, bold: true, color: { argb: premierNavy } };
    row.getCell(2).value = r[1];
    row.getCell(2).font = { name: "Arial", size: 9.5 };
    [1, 2].forEach((c) => {
      row.getCell(c).border = { bottom: { style: "thin", color: { argb: borderGray } } };
      row.getCell(c).alignment = { vertical: "middle" };
    });
  });

  // Título da Declaração Formal
  ws1.mergeCells("A10:B10");
  const decHeader = ws1.getCell("A10");
  decHeader.value = "DECLARAÇÃO FORMAL DE VOLUNTARIEDADE E NÃO-DISCRIMINAÇÃO";
  decHeader.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  decHeader.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  decHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavy },
  };
  ws1.getRow(10).height = 26;

  const declaracoes = [
    "1. NÃO-DISCRIMINAÇÃO E IGUALDADE DE OPORTUNIDADES: A Premier Logistics reafirma seu compromisso incondicional com a promoção de um ambiente de trabalho inclusivo, equânime e livre de qualquer forma de discriminação direta ou indireta, em consonância com a Constituição da República Federativa do Brasil (Art. 3º, IV e Art. 5º) e a Convenção nº 111 da Organização Internacional do Trabalho (OIT).",
    "2. VOLUNTARIEDADE E FACULTATIVIDADE DA PARTICIPAÇÃO: A autodeclaração de dados cadastrais e de diversidade é ato estritamente voluntário e facultativo do profissional. O sistema assegurou de forma inequívoca o direito à opção 'Prefiro não informar' e a possibilidade de recusa individual para cada categoria sensível, sem que disso decorresse qualquer distinção, restrição, prejuízo ou efeito funcional/contratual negativo sobre a relação de trabalho.",
    "3. PROTEÇÃO DE DADOS (LGPD): Todos os tratamentos de dados pessoais observam estritamente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - Arts. 7º, I e 11, I). As informações são tratadas sob sigilo profissional, com salvaguardas técnicas, criptografia de dados cadastrais (hash HMAC determinístico) e acesso restrito exclusivamente aos profissionais autorizados da área de Recursos Humanos e Governança.",
    "4. SNAPSHOT DOS TERMOS EXIBIDOS AO COLABORADOR: Conforme registrado no sistema no momento da interação, o texto de esclarecimento apresentado de forma prévia a todos os colaboradores foi: 'Estas informações serão utilizadas para atualização da base cadastral da Premier Logistics e construção de indicadores internos de diversidade e inclusão, nos termos da LGPD (Lei nº 13.709/2018). A recusa não gera nenhum efeito negativo sobre a relação de trabalho.'",
    "5. INTEGRIDADE E RASTREABILIDADE: O sistema corporativo registra trilha de auditoria para todas as operações de consulta, emissão e exportação, preservando o anonimato estatístico dos profissionais nos indicadores consolidados.",
  ];

  declaracoes.forEach((dec, idx) => {
    const rowNum = 11 + idx;
    ws1.mergeCells(`A${rowNum}:B${rowNum}`);
    const cell = ws1.getCell(`A${rowNum}`);
    cell.value = dec;
    cell.font = { name: "Arial", size: 9, color: { argb: "FF374151" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
    ws1.getRow(rowNum).height = 42;
  });

  // Assinatura Institucional
  const signRow = 17;
  ws1.mergeCells(`A${signRow}:B${signRow}`);
  const signCell = ws1.getCell(`A${signRow}`);
  signCell.value = "Premier Logistics Gestão Empresarial Ltda. • Diretoria de Recursos Humanos, D&I e Conformidade Legal";
  signCell.font = { name: "Arial", size: 9.5, italic: true, bold: true, color: { argb: premierNavy } };
  signCell.alignment = { horizontal: "center", vertical: "middle" };
  ws1.getRow(signRow).height = 30;

  // ==========================================
  // ABA 2: QUADRO CONSOLIDADO DE INDICADORES
  // ==========================================
  const ws2 = workbook.addWorksheet("Quadro de Indicadores", {
    views: [{ showGridLines: true }],
  });

  ws2.columns = [
    { width: 28 }, // Dimensão
    { width: 34 }, // Categoria
    { width: 26 }, // Quantidade
    { width: 20 }, // % sobre Total
    { width: 38 }, // Base Normativa / Critério
  ];

  ws2.mergeCells("A1:E1");
  const qh1 = ws2.getCell("A1");
  qh1.value = "QUADRO OFICIAL DE INDICADORES DE DIVERSIDADE & INCLUSÃO";
  qh1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  qh1.alignment = { horizontal: "center", vertical: "middle" };
  qh1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws2.getRow(1).height = 30;

  ws2.mergeCells("A2:E2");
  const qh2 = ws2.getCell("A2");
  qh2.value = `Unidade: ${unidadeTexto} | Competência: ${competenciaTexto} | Base total: ${data.total} colaboradores respondentes`;
  qh2.font = { name: "Arial", size: 9.5, italic: true, color: { argb: "FF4B5563" } };
  qh2.alignment = { horizontal: "center", vertical: "middle" };
  qh2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  ws2.getRow(2).height = 20;

  const tHeaders = [
    "Dimensão / Grupo",
    "Categoria Declarada",
    "Quantidade de Profissionais",
    "% sobre o Total",
    "Critério & Base Normativa",
  ];

  const tHeaderRow = ws2.getRow(4);
  tHeaderRow.height = 26;
  tHeaders.forEach((h, index) => {
    const cell = tHeaderRow.getCell(index + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
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
    };
  });

  const totalSubmissions = data.total;

  const complianceRows = [
    // Gênero
    { grupo: "Gênero", categoria: "Feminino", qtd: data.genero.feminino, ref: "Autodeclaração individual de gênero" },
    { grupo: "Gênero", categoria: "Masculino", qtd: data.genero.masculino, ref: "Autodeclaração individual de gênero" },
    { grupo: "Gênero", categoria: "Mulher Trans", qtd: data.genero.mulher_trans || 0, ref: "Identidade de gênero autodeclarada" },
    { grupo: "Gênero", categoria: "Homem Trans", qtd: data.genero.homem_trans || 0, ref: "Identidade de gênero autodeclarada" },
    { grupo: "Gênero", categoria: "Outro", qtd: data.genero.outro, ref: "Identidades não-binárias / fluidas" },
    { grupo: "Gênero", categoria: "Prefiro não informar", qtd: data.genero.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // Raça / Cor (IBGE)
    { grupo: "Raça / Cor", categoria: "Branca", qtd: data.racaCor.branca, ref: "Classificação oficial IBGE" },
    { grupo: "Raça / Cor", categoria: "Preta", qtd: data.racaCor.preta, ref: "Classificação oficial IBGE / Estatuto Igualdade Racial" },
    { grupo: "Raça / Cor", categoria: "Parda", qtd: data.racaCor.parda, ref: "Classificação oficial IBGE / Estatuto Igualdade Racial" },
    { grupo: "Raça / Cor", categoria: "Amarela", qtd: data.racaCor.amarela, ref: "Classificação oficial IBGE" },
    { grupo: "Raça / Cor", categoria: "Indígena", qtd: data.racaCor.indigena, ref: "Classificação oficial IBGE" },
    { grupo: "Raça / Cor", categoria: "Não informado", qtd: data.racaCor.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // PcD
    { grupo: "Pessoa com Deficiência", categoria: "PcD (Sim)", qtd: data.pcd.sim, ref: "Lei Brasileira de Inclusão (Lei 13.146/2015)" },
    { grupo: "Pessoa com Deficiência", categoria: "Não PcD", qtd: data.pcd.nao, ref: "Não se autodeclara pessoa com deficiência" },
    { grupo: "Pessoa com Deficiência", categoria: "Não informado", qtd: data.pcd.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // Neurodiversidade
    { grupo: "Neurodiversidade", categoria: "Pessoa neurodivergente (Sim)", qtd: data.neurodivergente.sim, ref: "TDAH, TEA, Dislexia e afins (Autodeclaração)" },
    { grupo: "Neurodiversidade", categoria: "Não neurodivergente", qtd: data.neurodivergente.nao, ref: "Não se autodeclara neurodivergente" },
    { grupo: "Neurodiversidade", categoria: "Não informado", qtd: data.neurodivergente.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // Faixa Etária
    { grupo: "Faixa Etária", categoria: "Até 29 anos", qtd: data.faixaEtaria.ate_29, ref: "Jovens profissionais em início de carreira" },
    { grupo: "Faixa Etária", categoria: "30 a 44 anos", qtd: data.faixaEtaria["30_44"], ref: "Profissionais plenos / adultos" },
    { grupo: "Faixa Etária", categoria: "45 a 59 anos", qtd: data.faixaEtaria["45_59"], ref: "Maturidade profissional" },
    { grupo: "Faixa Etária", categoria: "60 anos ou mais", qtd: data.faixaEtaria["60_mais"], ref: "Estatuto da Pessoa Idosa (Lei nº 10.741/2003)" },
    { grupo: "Faixa Etária", categoria: "Não informado", qtd: data.faixaEtaria.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // LGBTQIAPN+
    { grupo: "LGBTQIAPN+", categoria: "Comunidade LGBTQIAPN+ (Sim)", qtd: data.lgbtqiapn.sim, ref: "Autodeclaração de pertencimento" },
    { grupo: "LGBTQIAPN+", categoria: "Não LGBTQIAPN+", qtd: data.lgbtqiapn.nao, ref: "Não pertencente à comunidade" },
    { grupo: "LGBTQIAPN+", categoria: "Não informado", qtd: data.lgbtqiapn.nao_informado, ref: "Faculdade de sigilo assegurada pela LGPD" },
    // Outros grupos
    { grupo: "Outros Grupos", categoria: "Outro grupo sub-representado", qtd: data.outroGrupoCount, ref: "Texto livre autodeclarado pelo profissional" },
  ];

  const totalRowIndex = 5 + complianceRows.length;

  complianceRows.forEach((item, idx) => {
    const rowNum = 5 + idx;
    const row = ws2.getRow(rowNum);
    row.height = 20;

    row.getCell(1).value = item.grupo;
    row.getCell(2).value = item.categoria;
    row.getCell(3).value = item.qtd;

    row.getCell(4).value = {
      formula: `IF(C${totalRowIndex}>0, C${rowNum}/C${totalRowIndex}, 0)`,
      result: totalSubmissions > 0 ? item.qtd / totalSubmissions : 0,
    };
    row.getCell(4).numFmt = "0.00%";
    row.getCell(5).value = item.ref;

    const isEven = idx % 2 === 0;
    for (let c = 1; c <= 5; c++) {
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

  // Linha Total de Respondentes
  const totalRow = ws2.getRow(totalRowIndex);
  totalRow.height = 24;
  totalRow.getCell(1).value = "TOTAL DE COLABORADORES";
  totalRow.getCell(2).value = "RESPONDENTES CONSIDERADOS";
  totalRow.getCell(3).value = totalSubmissions;
  totalRow.getCell(4).value = 1.0;
  totalRow.getCell(4).numFmt = "0.00%";
  totalRow.getCell(5).value = "Base total de autodeclarações válidas apuradas no período";

  for (let c = 1; c <= 5; c++) {
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
    };
    if (c === 3 || c === 4) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    } else {
      cell.alignment = { vertical: "middle" };
    }
  }

  // ==========================================
  // ABA 3: FUNDAMENTAÇÃO LEGAL & METODOLOGIA
  // ==========================================
  const ws3 = workbook.addWorksheet("Metodologia & Fundamentos", {
    views: [{ showGridLines: true }],
  });

  ws3.columns = [{ width: 30 }, { width: 85 }];

  ws3.mergeCells("A1:B1");
  const mh1 = ws3.getCell("A1");
  mh1.value = "QUADRO NORMATIVO & CRITÉRIOS METODOLÓGICOS APLICÁVEIS";
  mh1.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  mh1.alignment = { horizontal: "center", vertical: "middle" };
  mh1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: premierNavyDark },
  };
  ws3.getRow(1).height = 28;

  const legalItems = [
    {
      diploma: "Constituição Federal de 1988",
      detalhe: "Art. 3º, IV (promoção do bem de todos, sem preconceitos de origem, raça, sexo, cor, idade) e Art. 5º (isonomia e dignidade da pessoa humana).",
    },
    {
      diploma: "Convenção nº 111 da OIT",
      detalhe: "Convenção sobre a Discriminação em Matéria de Emprego e Ocupação (promulgada pelo Decreto nº 62.150/1968), orientando a adoção de políticas ativas de não-discriminação.",
    },
    {
      diploma: "Lei nº 13.709/2018 (LGPD)",
      detalhe: "Art. 7º, I e Art. 11, I e II: Coleta e tratamento legítimo de dados sensíveis com consentimento expresso, específico e facultativo para fins de atualização cadastral e políticas de diversidade.",
    },
    {
      diploma: "Lei nº 13.146/2015 (LBI)",
      detalhe: "Lei Brasileira de Inclusão da Pessoa com Deficiência: Respeito à autodeclaração e garantia de acessibilidade e adaptações razoáveis no ambiente corporativo.",
    },
    {
      diploma: "Lei nº 12.288/2010",
      detalhe: "Estatuto da Igualdade Racial: Utilização dos critérios e categorias oficiais do IBGE (branca, preta, parda, amarela, indígena) para mapeamento da força de trabalho.",
    },
    {
      diploma: "Lei nº 14.611/2023",
      detalhe: "Lei de Igualdade Salarial e de Critérios Remuneratórios entre Mulheres e Homens: Incentivo a práticas de transparência, diversidade e inclusão de grupos sub-representados.",
    },
    {
      diploma: "Lei nº 10.741/2003",
      detalhe: "Estatuto da Pessoa Idosa: Proteção e valorização do profissional com 60 anos ou mais na estrutura funcional.",
    },
  ];

  legalItems.forEach((item, idx) => {
    const rowNum = 3 + idx;
    const row = ws3.getRow(rowNum);
    row.height = 36;
    row.getCell(1).value = item.diploma;
    row.getCell(1).font = { name: "Arial", size: 9.5, bold: true, color: { argb: premierNavy } };
    row.getCell(2).value = item.detalhe;
    row.getCell(2).font = { name: "Arial", size: 9 };
    [1, 2].forEach((c) => {
      row.getCell(c).alignment = { vertical: "middle", wrapText: true };
      row.getCell(c).border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

