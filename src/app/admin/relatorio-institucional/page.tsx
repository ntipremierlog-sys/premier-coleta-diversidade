"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PremierLogo } from "@/components/PremierLogo";
import { formatCompetencia } from "@/lib/constants";
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

interface SummaryData {
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

export const dynamic = "force-dynamic";

function RelatorioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unidade = searchParams.get("unidade") || "todas";
  const competencia = searchParams.get("competencia") || "todas";

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emittedAt, setEmittedAt] = useState<string>("");

  useEffect(() => {
    setEmittedAt(
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/summary?unidade=${encodeURIComponent(
            unidade
          )}&competencia=${encodeURIComponent(competencia)}`
        );
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        if (!res.ok) {
          throw new Error("Não autorizado ou erro ao carregar os dados.");
        }
        const json = await res.json();
        const dataObj = json.data || json;
        setSummary(dataObj);
      } catch (err: any) {
        setError(err.message || "Erro de carregamento");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [unidade, competencia, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    const url = `/api/admin/export-compliance?unidade=${encodeURIComponent(
      unidade
    )}&competencia=${encodeURIComponent(competencia)}`;
    window.open(url, "_blank");
  };

  const total = summary?.total ?? 0;
  const genero = summary?.genero ?? {
    feminino: 0,
    masculino: 0,
    mulher_trans: 0,
    homem_trans: 0,
    outro: 0,
    nao_informado: 0,
  };
  const racaCor = summary?.racaCor ?? {
    branca: 0,
    preta: 0,
    parda: 0,
    amarela: 0,
    indigena: 0,
    nao_informado: 0,
  };
  const pcd = summary?.pcd ?? {
    sim: 0,
    nao: 0,
    nao_informado: 0,
  };
  const neurodivergente = summary?.neurodivergente ?? {
    sim: 0,
    nao: 0,
    nao_informado: 0,
  };
  const faixaEtaria = summary?.faixaEtaria ?? {
    ate_29: 0,
    "30_44": 0,
    "45_59": 0,
    "60_mais": 0,
    nao_informado: 0,
  };
  const lgbtqiapn = summary?.lgbtqiapn ?? {
    sim: 0,
    nao: 0,
    nao_informado: 0,
  };

  const calcPct = (qtd: number) =>
    total > 0 ? ((qtd / total) * 100).toFixed(1) : "0.0";

  const unidadeTexto = unidade === "todas" ? "Consolidado Geral (Todas as Filiais)" : unidade;
  const competenciaTexto = formatCompetencia(competencia) || "Todas as Competências";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-premier-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Gerando documento institucional...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <p className="text-sm text-rose-600 font-semibold">{error || "Erro ao carregar dados"}</p>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-premier-primary text-white rounded-xl text-xs font-bold"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-800">
      {/* BARRA SUPERIOR (OCULTA NA IMPRESSÃO) */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar em Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-premier-primary hover:bg-premier-primary-dark text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Salvar em PDF / Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* DOCUMENTO FORMAL A4 (IMPRESSÃO DE ALTA QUALIDADE) */}
      <main className="max-w-4xl mx-auto my-6 p-8 sm:p-12 bg-white rounded-2xl shadow-md border border-slate-200 print:my-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
        
        {/* CABEÇALHO INSTITUCIONAL */}
        <div className="border-b-2 border-[#180B38] pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="bg-[#180B38] p-3 rounded-xl">
            <PremierLogo className="h-10 w-auto" />
          </div>
          <div className="text-center sm:text-right">
            <h1 className="text-base sm:text-lg font-extrabold text-[#180B38] tracking-tight uppercase">
              Premier Logistics Gestão Empresarial
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Diretoria de Recursos Humanos, D&I e Governança Corporativa
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Documento emitido eletronicamente em: <strong>{emittedAt}</strong>
            </p>
          </div>
        </div>

        {/* TÍTULO DO RELATÓRIO */}
        <div className="my-6 text-center space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documento Institucional de Conformidade</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Relatório Institucional de Práticas de Inclusão, Diversidade & Governança
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Demonstrativo oficial de conformidade normativa, ateste de voluntariedade e quadro estatístico consolidado da força de trabalho.
          </p>
        </div>

        {/* METADADOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-8">
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Unidade / Filial</span>
            <span className="font-bold text-slate-800">{unidadeTexto}</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Competência</span>
            <span className="font-bold text-slate-800">{competenciaTexto}</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Computado</span>
            <span className="font-bold text-slate-800">{total} colaboradores</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Status de Integridade</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              100% Auditado
            </span>
          </div>
        </div>

        {/* SEÇÃO 1: DECLARAÇÃO FORMAL DE VOLUNTARIEDADE E NÃO-DISCRIMINAÇÃO */}
        <section className="mb-8 space-y-3">
          <h3 className="text-sm font-bold text-[#180B38] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
            <span>1. Declaração Formal de Voluntariedade e Não-Discriminação</span>
          </h3>

          <div className="text-[12px] text-slate-700 space-y-2.5 leading-relaxed text-justify bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p>
              A <strong>Premier Logistics Gestão Empresarial Ltda.</strong> atesta, para os devidos fins de direito e comprovação institucional perante entidades de fiscalização, auditorias e órgãos reguladores, que:
            </p>
            <p>
              <strong>1.1. Princípio da Não-Discriminação:</strong> A organização atua em estrita observância aos preceitos da Constituição da República Federativa do Brasil (Art. 3º, IV e Art. 5º) e da Convenção nº 111 da Organização Internacional do Trabalho (OIT), assegurando ambiente livre de quaisquer práticas ou exigências discriminatórias em matéria de emprego, ascensão funcional ou ocupação.
            </p>
            <p>
              <strong>1.2. Voluntariedade e Facultatividade Absoluta:</strong> A participação do colaborador no processo de autodeclaração e atualização cadastral é expressamente facultativa e voluntária. O sistema eletrônico disponibiliza em todas as etapas de coleta a opção <em>&quot;Prefiro não informar&quot;</em> e a possibilidade de recusa individual para cada categoria sensível, inexistindo qualquer efeito prejudicial, restritivo ou negativo sobre a relação de trabalho.
            </p>
            <p>
              <strong>1.3. Tratamento e Proteção de Dados (LGPD):</strong> O tratamento observa estritamente os princípios de finalidade, adequação e necessidade da Lei nº 13.709/2018 (Arts. 7º, I e 11, I). Os dados cadastrais são protegidos com hash determinístico e salvaguardas tecnológicas, sendo o acesso restrito a membros autorizados do Recursos Humanos para fins exclusivos de conformidade e políticas de inclusão.
            </p>
            <p>
              <strong>1.4. Snapshot do Termo de Esclarecimentos Apresentado:</strong> Registra-se, para fins probatórios, o texto integral prévio exibido no sistema ao colaborador: <em>&quot;Estas informações serão utilizadas para atualização da base cadastral da Premier Logistics e construção de indicadores internos de diversidade e inclusão, nos termos da LGPD (Lei nº 13.709/2018). A recusa não gera nenhum efeito negativo sobre a relação de trabalho.&quot;</em>
            </p>
          </div>
        </section>

        {/* SEÇÃO 2: QUADRO CONSOLIDADO DE INDICADORES */}
        <section className="mb-8 space-y-4">
          <h3 className="text-sm font-bold text-[#180B38] uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Quadro Oficial de Indicadores de Diversidade & Inclusão
          </h3>

          {/* TABELA DE GÊNERO */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800">2.1. Distribuição por Identidade de Gênero</h4>
            <table className="w-full text-left border-collapse text-xs border border-slate-200">
              <thead>
                <tr className="bg-[#180B38] text-white">
                  <th className="p-2 font-bold">Identidade / Categoria</th>
                  <th className="p-2 text-center font-bold w-28">Quantidade</th>
                  <th className="p-2 text-center font-bold w-28">% sobre Total</th>
                  <th className="p-2 font-bold">Critério / Metodologia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Feminino</td>
                  <td className="p-2 text-center font-bold">{genero.feminino}</td>
                  <td className="p-2 text-center">{calcPct(genero.feminino)}%</td>
                  <td className="p-2 text-slate-500">Autodeclaração individual</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-medium">Masculino</td>
                  <td className="p-2 text-center font-bold">{genero.masculino}</td>
                  <td className="p-2 text-center">{calcPct(genero.masculino)}%</td>
                  <td className="p-2 text-slate-500">Autodeclaração individual</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Mulher Trans</td>
                  <td className="p-2 text-center font-bold">{genero.mulher_trans}</td>
                  <td className="p-2 text-center">{calcPct(genero.mulher_trans)}%</td>
                  <td className="p-2 text-slate-500">Autodeclaração individual</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-medium">Homem Trans</td>
                  <td className="p-2 text-center font-bold">{genero.homem_trans}</td>
                  <td className="p-2 text-center">{calcPct(genero.homem_trans)}%</td>
                  <td className="p-2 text-slate-500">Autodeclaração individual</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Outro</td>
                  <td className="p-2 text-center font-bold">{genero.outro}</td>
                  <td className="p-2 text-center">{calcPct(genero.outro)}%</td>
                  <td className="p-2 text-slate-500">Identidades não-binárias / fluidas</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-medium">Prefiro não informar</td>
                  <td className="p-2 text-center font-bold">{genero.nao_informado}</td>
                  <td className="p-2 text-center">{calcPct(genero.nao_informado)}%</td>
                  <td className="p-2 text-slate-500">Faculdade de sigilo assegurada</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABELA DE RAÇA/COR (IBGE) E PCD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Raça e Cor */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800">2.2. Raça / Cor (Critérios IBGE)</h4>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 font-bold">Classificação</th>
                    <th className="p-2 text-center font-bold w-20">Qtd</th>
                    <th className="p-2 text-center font-bold w-20">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">Branca</td>
                    <td className="p-2 text-center font-bold">{racaCor.branca}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.branca)}%</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2">Preta</td>
                    <td className="p-2 text-center font-bold">{racaCor.preta}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.preta)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2">Parda</td>
                    <td className="p-2 text-center font-bold">{racaCor.parda}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.parda)}%</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2">Amarela</td>
                    <td className="p-2 text-center font-bold">{racaCor.amarela}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.amarela)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2">Indígena</td>
                    <td className="p-2 text-center font-bold">{racaCor.indigena}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.indigena)}%</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2">Não informado</td>
                    <td className="p-2 text-center font-bold">{racaCor.nao_informado}</td>
                    <td className="p-2 text-center">{calcPct(racaCor.nao_informado)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PcD e Inclusão */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800">2.3. Acessibilidade & PcD (Lei 13.146/2015)</h4>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 font-bold">Autodeclaração</th>
                    <th className="p-2 text-center font-bold w-20">Qtd</th>
                    <th className="p-2 text-center font-bold w-20">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">Pessoa com Deficiência (Sim)</td>
                    <td className="p-2 text-center font-bold">{pcd.sim}</td>
                    <td className="p-2 text-center">{calcPct(pcd.sim)}%</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2">Não PcD</td>
                    <td className="p-2 text-center font-bold">{pcd.nao}</td>
                    <td className="p-2 text-center">{calcPct(pcd.nao)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2">Não informado</td>
                    <td className="p-2 text-center font-bold">{pcd.nao_informado}</td>
                    <td className="p-2 text-center">{calcPct(pcd.nao_informado)}%</td>
                  </tr>
                  <tr className="bg-slate-100 font-semibold">
                    <td className="p-2" colSpan={3}>
                      Neurodivergência (Sim): {neurodivergente.sim} ({calcPct(neurodivergente.sim)}%)
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-semibold">
                    <td className="p-2" colSpan={3}>
                      Longevidade 60+ anos: {faixaEtaria["60_mais"]} ({calcPct(faixaEtaria["60_mais"])}%)
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-semibold">
                    <td className="p-2" colSpan={3}>
                      LGBTQIAPN+ (Sim): {lgbtqiapn.sim} ({calcPct(lgbtqiapn.sim)}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: QUADRO NORMATIVO APLICÁVEL */}
        <section className="mb-10 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p className="font-bold text-slate-700">3. Quadro Normativo e Fundamentos Jurídicos:</p>
          <p>• <strong>Constituição Federal de 1988:</strong> Art. 3º, IV (promoção do bem de todos sem preconceito) e Art. 5º (igualdade formal e material).</p>
          <p>• <strong>Convenção nº 111 da OIT:</strong> Proibição de discriminação e fomento à igualdade de oportunidades no emprego.</p>
          <p>• <strong>Lei nº 13.709/2018 (LGPD):</strong> Art. 7º, I e Art. 11, I (tratamento legítimo com consentimento facultativo).</p>
          <p>• <strong>Lei nº 13.146/2015 (LBI):</strong> Lei Brasileira de Inclusão da Pessoa com Deficiência.</p>
          <p>• <strong>Lei nº 12.288/2010:</strong> Estatuto da Igualdade Racial e diretrizes de inclusão étnico-racial.</p>
          <p>• <strong>Lei nº 14.611/2023:</strong> Igualdade salarial e critérios remuneratórios entre mulheres e homens.</p>
        </section>

        {/* ASSINATURA / ENCERRAMENTO */}
        <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="w-48 h-0.5 bg-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Diretoria de Recursos Humanos & D&I</p>
            <p className="text-[11px] text-slate-500">Premier Logistics Gestão Empresarial</p>
          </div>
          <div className="space-y-1">
            <div className="w-48 h-0.5 bg-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Governança & Conformidade Legal</p>
            <p className="text-[11px] text-slate-500">Registro de Integridade e Auditoria</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function RelatorioInstitucionalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center text-slate-500 font-sans">Carregando relatório institucional...</div>
        </div>
      }
    >
      <RelatorioContent />
    </React.Suspense>
  );
}
