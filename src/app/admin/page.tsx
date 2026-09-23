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
  const hasActiveFilters = selectedUnidade !== "todas" || selectedCompetencia !== "todas";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
      <Header showAdminLink={false} maxWidth="max-w-7xl" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* TOPO MINIMALISTA & CONTROLES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Título e Contador */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
                Painel de Gestão
              </h1>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {totalResp} {totalResp === 1 ? "resposta" : "respostas"}
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400 font-medium">
                • {userRole === "rh_administrador" ? "RH Administrador Master" : "RH Agregado"}
              </span>
            </div>

            {/* Ações: Exportação, Atualização e Saída */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  id="report-type-select"
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100/80 text-slate-700 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-premier-primary/20 transition-all cursor-pointer"
                >
                  <option value="institucional_pdf">Relatório Institucional (.pdf)</option>
                  <option value="institucional_xlsx">Relatório Institucional (.xlsx)</option>
                  <option value="premier_xlsx">Relatório Premier (.xlsx)</option>
                  <option value="extrato_xlsx">Extrato de Diversidade (.xlsx)</option>
                  {userRole === "rh_administrador" && (
                    <option value="nominal_xlsx">Base Nominal Restrita (.xlsx)</option>
                  )}
                </select>

                <button
                  type="button"
                  id="generate-report-button"
                  onClick={handleGenerateSelectedReport}
                  disabled={isGeneratingReport}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-premier-primary hover:bg-premier-primary-dark text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={fetchSummary}
                disabled={isLoadingSummary}
                title="Atualizar dados"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSummary ? "animate-spin text-premier-primary" : ""}`} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Sair"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtros Compactos em Linha */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Unidade */}
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedUnidade}
                  onChange={(e) => setSelectedUnidade(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-premier-primary/30 transition-all cursor-pointer"
                >
                  <option value="todas">Todas as Unidades</option>
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Competência */}
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedCompetencia}
                  onChange={(e) => setSelectedCompetencia(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-premier-primary/30 transition-all cursor-pointer"
                >
                  <option value="todas">Todas as Competências (Geral)</option>
                  {availableCompetencias.map((comp) => (
                    <option key={comp} value={comp}>
                      {formatCompetencia(comp)} ({comp})
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-premier-primary font-medium underline self-center sm:self-auto cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 text-right self-end sm:self-auto">
              Atualização automática a cada resposta
            </span>
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

        {/* LINK DE DIVULGAÇÃO CORPORATIVO (MINIMALISTA) */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 truncate">
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">Link do Formulário:</span>
            <span className="font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] truncate select-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              title="Abrir formulário em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
