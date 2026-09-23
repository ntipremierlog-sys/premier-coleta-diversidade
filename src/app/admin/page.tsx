"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { UNIDADES, formatCompetencia, getCurrentCompetencia } from "@/lib/constants";
import { PremierLogo } from "@/components/PremierLogo";
import { DiversityCharts } from "@/components/DiversityCharts";
import {
  Lock,
  Download,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Building2,
  Calendar,
  LogOut,
  Copy,
  Check,
  Sparkles,
  Accessibility,
  Brain,
  CalendarClock,
  HeartHandshake,
  RefreshCw,
  Search,
  UserCheck,
  Trash2,
  Edit3,
  ShieldCheck,
  FileText,
  Clock,
  AlertTriangle,
  X,
  History,
  Eye,
  EyeOff,
  ExternalLink,
  Filter,
  CheckCircle2,
  Layers,
  RotateCcw,
} from "lucide-react";

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

interface RespondentItem {
  id: string;
  nomeCompleto: string;
  cpf?: string | null;
  cpfMascarado: string;
  unidade: string;
  matricula: string | null;
  createdAt: string;
  consents: Array<{
    id: string;
    categoria: string;
    aceito: boolean;
    dataResposta: string;
  }>;
  submission: {
    id: string;
    genero: string;
    racaCor: string;
    pcd: string;
    pcdTipo: string | null;
    neurodivergente: string;
    faixaEtaria: string;
    lgbtqiapn: string;
    outroGrupo: string | null;
  } | null;
}

interface AuditLogItem {
  id: string;
  userId: string;
  acao: string;
  respondentId: string | null;
  detalhe: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"rh_agregado" | "rh_administrador" | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Aba ativa (mantido internamente caso necessário)
  const [activeTab, setActiveTab] = useState<"consolidado" | "titulares" | "auditoria">("consolidado");

  // Filtros Dashboard
  const [selectedUnidade, setSelectedUnidade] = useState("todas");
  const [selectedCompetencia, setSelectedCompetencia] = useState("todas");

  // Dados Dashboard
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [availableCompetencias, setAvailableCompetencias] = useState<string[]>([]);
  const [availableUnidades, setAvailableUnidades] = useState<string[]>([]);
  const [kAnonymityAlert, setKAnonymityAlert] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("institucional_pdf");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Módulo de Titulares
  const [searchQuery, setSearchQuery] = useState("");
  const [respondents, setRespondents] = useState<RespondentItem[]>([]);
  const [isLoadingRespondents, setIsLoadingRespondents] = useState(false);
  const [editingRespondent, setEditingRespondent] = useState<RespondentItem | null>(null);
  const [editForm, setEditForm] = useState({ nomeCompleto: "", matricula: "", unidade: "" });
  const [deletingRespondent, setDeletingRespondent] = useState<RespondentItem | null>(null);
  const [isSavingTitular, setIsSavingTitular] = useState(false);

  // Módulo de Auditoria
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Buscar dados consolidados
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch(
        `/api/admin/summary?unidade=${encodeURIComponent(
          selectedUnidade
        )}&competencia=${encodeURIComponent(selectedCompetencia)}`
      );

      if (res.status === 401) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      const json = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setUserRole(json.role || "rh_agregado");
        setSummary(json.data);
        setAvailableCompetencias(json.availableCompetencias || []);
        setAvailableUnidades(json.availableUnidades || []);
        setKAnonymityAlert(json.kAnonymityAlert || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedUnidade, selectedCompetencia]);

  // Buscar titulares
  const fetchRespondents = useCallback(async (query: string = "") => {
    if (userRole !== "rh_administrador") return;
    setIsLoadingRespondents(true);
    try {
      const res = await fetch(`/api/admin/titulares?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (res.ok) {
        setRespondents(json.respondents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRespondents(false);
    }
  }, [userRole]);

  // Buscar logs de auditoria
  const fetchAuditLogs = useCallback(async () => {
    if (userRole !== "rh_administrador") return;
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/auditoria?limit=100`);
      const json = await res.json();
      if (res.ok) {
        setAuditLogs(json.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === "titulares" && userRole === "rh_administrador") {
      fetchRespondents(searchQuery);
    } else if (activeTab === "auditoria" && userRole === "rh_administrador") {
      fetchAuditLogs();
    }
  }, [activeTab, userRole, fetchRespondents, fetchAuditLogs, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setUserRole(data.role || "rh_agregado");
        setPasswordInput("");
        fetchSummary();
      } else {
        setAuthError(data.error || "Senha incorreta.");
      }
    } catch (err: any) {
      setAuthError("Erro na conexão com o servidor.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const handleGenerateSelectedReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (selectedReportType === "institucional_pdf") {
        const url = `/admin/relatorio-institucional?unidade=${encodeURIComponent(
          selectedUnidade
        )}&competencia=${encodeURIComponent(selectedCompetencia)}`;
        const win = window.open(url, "_blank");
        if (!win || win.closed || typeof win.closed === "undefined") {
          window.location.href = url;
        }
        return;
      }

      let endpoint = "/api/admin/export-compliance";
      let defaultFilename = "Relatorio_Institucional_Conformidade";

      if (selectedReportType === "institucional_xlsx") {
        endpoint = "/api/admin/export-compliance";
        defaultFilename = "Relatorio_Institucional_Conformidade";
      } else if (selectedReportType === "premier_xlsx") {
        endpoint = "/api/admin/export-premier";
        defaultFilename = "Relatorio_Premier_Diversidade";
      } else if (selectedReportType === "extrato_xlsx") {
        endpoint = "/api/admin/export";
        defaultFilename = "Extrato_Diversidade";
      } else if (selectedReportType === "nominal_xlsx") {
        endpoint = "/api/admin/export-nominal";
        defaultFilename = "Extrato_Nominal_Restrito";
      }

      const url = `${endpoint}?unidade=${encodeURIComponent(
        selectedUnidade
      )}&competencia=${encodeURIComponent(selectedCompetencia)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao gerar o arquivo de relatório.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const unidadeSlug =
        selectedUnidade === "todas" ? "Consolidado" : selectedUnidade;
      const compSlug =
        selectedCompetencia === "todas" ? "Geral" : selectedCompetencia;
      a.download = `${defaultFilename}_${unidadeSlug}_${compSlug}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || "Erro ao gerar relatório.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedUnidade("todas");
    setSelectedCompetencia("todas");
  };

  // Se verificando sessão
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
        <Header showAdminLink={false} maxWidth="max-w-7xl" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-premier-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Carregando painel corporativo...
          </p>
        </div>
      </div>
    );
  }

  // TELA DE LOGIN ELEGANTE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#0D0521] via-[#180B38] to-[#251052] relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <Header showAdminLink={false} maxWidth="max-w-4xl" />

        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-t-4 border-[#C4A87F] border-x border-b border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="bg-[#180B38] p-4 rounded-2xl flex items-center justify-center shadow-md mx-auto inline-flex">
                <PremierLogo className="h-12 w-auto" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Painel de Gestão & D&I
                </h2>
                <p className="text-xs text-slate-500">
                  Acesso restrito para monitoramento corporativo e relatórios de conformidade.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-premier-primary" />
                  <span>Senha de Acesso</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password-input"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite sua senha de acesso..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#180B38]/30 focus:border-[#180B38] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Informação sobre os níveis de acesso */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/90 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>
                    <strong>RH Agregado:</strong> Indicadores consolidados e exportações de conformidade.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>
                    <strong>RH Administrador:</strong> Acesso analítico total e base nominal confidencial.
                  </span>
                </div>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                id="admin-login-button"
                disabled={isLoggingIn}
                className="w-full bg-[#180B38] hover:bg-[#281358] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:translate-y-0"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando sessão...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Acessar Painel Executivo</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const totalResp = summary?.total || 0;
  
  // Total de declarações afirmativas
  const totalAfirmativo =
    (summary?.pcd.sim || 0) +
    (summary?.neurodivergente.sim || 0) +
    (summary?.lgbtqiapn.sim || 0) +
    (summary?.faixaEtaria["60_mais"] || 0);

  const hasActiveFilters = selectedUnidade !== "todas" || selectedCompetencia !== "todas";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
      <Header showAdminLink={false} maxWidth="max-w-7xl" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* BANNER HERO EXECUTIVO */}
        <div className="bg-gradient-to-r from-[#14082E] via-[#1F0E48] to-[#2B145E] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-purple-900/40 relative overflow-hidden">
          {/* Luz de fundo decorativa */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-20 w-56 h-56 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm">
                  Painel de Gestão Corporativa
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sessão Ativa</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-400/15 text-purple-200 border border-purple-400/25">
                  Perfil: {userRole === "rh_administrador" ? "Administrador Master" : "RH Agregado"}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                  Indicadores de Diversidade & Inclusão
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                  Consolidação estatística, índices demográficos em tempo real e emissão de relatórios oficiais da Premier Logistics.
                </p>
              </div>
            </div>

            {/* BARRA DE AÇÕES DO HEADER */}
            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end pt-2 lg:pt-0">
              <button
                type="button"
                onClick={fetchSummary}
                disabled={isLoadingSummary}
                title="Atualizar dados em tempo real"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSummary ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              {/* SELETOR E GERADOR DE RELATÓRIOS UNIFICADO */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  id="report-type-select"
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C4A87F] shadow-sm cursor-pointer"
                >
                  <option value="institucional_pdf">📄 Relatório Institucional (.pdf)</option>
                  <option value="institucional_xlsx">📊 Relatório Institucional (.xlsx)</option>
                  <option value="premier_xlsx">✨ Relatório Premier (.xlsx)</option>
                  <option value="extrato_xlsx">📑 Extrato de Diversidade (.xlsx)</option>
                  {userRole === "rh_administrador" && (
                    <option value="nominal_xlsx">🔒 Base Nominal Restrita (.xlsx)</option>
                  )}
                </select>

                <button
                  type="button"
                  id="generate-report-button"
                  onClick={handleGenerateSelectedReport}
                  disabled={isGeneratingReport}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5D2B8] to-[#C4A87F] hover:from-[#EDDFC9] hover:to-[#BFA276] text-[#180B38] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 shrink-0 cursor-pointer"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#180B38] border-t-transparent rounded-full animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Gerar Relatório</span>
                    </>
                  )}
                </button>
              </div>

              {/* BOTÃO SAIR */}
              <button
                type="button"
                onClick={handleLogout}
                title="Encerrar sessão com segurança"
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 CARDS DE MÉTRICAS EXECUTIVAS (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Respondentes */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/90 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total de Respondentes
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                  {totalResp}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedUnidade === "todas" ? "geral" : "no filtro"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Colaboradores participantes
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 2: Unidade Ativa */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/90 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all">
            <div className="space-y-1 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Recorte de Unidade
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {selectedUnidade === "todas" ? "Todas as Filiais" : selectedUnidade}
              </div>
              <p className="text-[11px] text-slate-400">
                {availableUnidades.length > 0 ? `${availableUnidades.length} filiais registradas` : "Consolidado geral"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 3: Declarações Afirmativas */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/90 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Grupos Afirmativos
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                  {totalAfirmativo}
                </span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  inclusão
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PcD, Neuro, LGBTQIA+, 60+
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 4: Período / Competência */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/90 flex items-center justify-between gap-3 hover:shadow-card-hover transition-all">
            <div className="space-y-1 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Competência Vigente
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {selectedCompetencia === "todas" ? "Histórico Geral" : formatCompetencia(selectedCompetencia)}
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedCompetencia === "todas" ? "Todos os períodos" : selectedCompetencia}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS REFINADA */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Filter className="w-4 h-4 text-premier-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Filtros de Segmentação e Análise
                </h3>
                <p className="text-xs text-slate-400">
                  Selecione a unidade e a competência para recalcular os gráficos e tabelas
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-premier-primary hover:text-[#281358] bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-lg transition-all self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Consolidado Geral</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {/* Filtro de Unidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-premier-secondary" />
                <span>Unidade Operacional / Filial</span>
              </label>
              <select
                value={selectedUnidade}
                onChange={(e) => setSelectedUnidade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#180B38]/20 focus:border-[#180B38] transition-all cursor-pointer"
              >
                <option value="todas">Todas as Unidades (Consolidado Nacional)</option>
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Competência */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-premier-secondary" />
                <span>Competência Mensal</span>
              </label>
              <select
                value={selectedCompetencia}
                onChange={(e) => setSelectedCompetencia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#180B38]/20 focus:border-[#180B38] transition-all cursor-pointer"
              >
                <option value="todas">Todas as Competências (Histórico Geral)</option>
                {availableCompetencias.map((comp) => (
                  <option key={comp} value={comp}>
                    {formatCompetencia(comp)} ({comp})
                  </option>
                ))}
              </select>
            </div>

            {/* Status do Filtro */}
            <div className="flex sm:col-span-2 lg:col-span-1 items-center justify-start lg:justify-end pt-1">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                <span className="text-xs text-slate-500 font-medium">Respondentes filtrados:</span>
                <span className="text-lg font-black text-premier-primary">
                  {totalResp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTA DE K-ANONIMATO LGPD */}
        {kAnonymityAlert && (
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-sm animate-fadeIn">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1 leading-relaxed">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-amber-950 font-heading">
                  Aviso de Proteção & k-Anonimato (LGPD)
                </strong>
                <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Privacidade
                </span>
              </div>
              <p>
                A unidade selecionada possui menos de 5 respondentes no período apurado ({totalResp} registros).
                Para preservar o sigilo das respostas e evitar reidentificação indireta de colaboradores, utilize o
                relatório <strong>Consolidado Geral</strong> em divulgações públicas ou relatórios externos.
              </p>
            </div>
          </div>
        )}

        {/* GRÁFICOS DE DIVERSIDADE */}
        <DiversityCharts summary={summary} />

        {/* CARD CORPORATIVO: LINK DE ENVIO & DIVULGAÇÃO INTERNA */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-7 shadow-card border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-sm shrink-0">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Link Único de Coleta Corporativa
                </h3>
                <p className="text-xs text-slate-500">
                  Compartilhe este link com todos os colaboradores. Cada participante escolhe sua respectiva filial na 1ª etapa do formulário.
                </p>
              </div>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-premier-primary hover:text-[#281358] bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all self-start sm:self-auto shadow-xs"
            >
              <span>Abrir Formulário</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? window.location.origin : ""}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-800 select-all shadow-inner focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }
              }}
              className="w-full sm:w-auto px-5 py-3 bg-[#180B38] hover:bg-[#281458] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link de Divulgação</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-premier-secondary shrink-0" />
            <span>
              <strong>Dica RH:</strong> O formulário é totalmente responsivo (desktop e mobile). Envie via E-mail Corporativo, Microsoft Teams ou WhatsApp institucional.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
