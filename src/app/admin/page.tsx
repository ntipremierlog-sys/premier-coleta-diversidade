"use client";

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
} from "lucide-react";

interface SummaryData {
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
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Aba ativa: "consolidado" | "titulares" | "auditoria"
  const [activeTab, setActiveTab] = useState<"consolidado" | "titulares" | "auditoria">("consolidado");

  // Filtros Dashboard
  const [selectedUnidade, setSelectedUnidade] = useState("todas");
  const [selectedCompetencia, setSelectedCompetencia] = useState("todas");

  // Dados Dashboard
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [availableCompetencias, setAvailableCompetencias] = useState<string[]>([]);
  const [availableUnidades, setAvailableUnidades] = useState<string[]>([]);
  const [kAnonymityAlert, setKAnonymityAlert] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingNominal, setIsExportingNominal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const url = `/api/admin/export?unidade=${encodeURIComponent(
        selectedUnidade
      )}&competencia=${encodeURIComponent(selectedCompetencia)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao gerar planilha Excel.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Extrato_Diversidade_${
        selectedUnidade === "todas" ? "Consolidado" : selectedUnidade
      }_${selectedCompetencia === "todas" ? "Geral" : selectedCompetencia}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || "Erro ao baixar arquivo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportNominalExcel = async () => {
    setIsExportingNominal(true);
    try {
      const url = `/api/admin/export-nominal?unidade=${encodeURIComponent(
        selectedUnidade
      )}&competencia=${encodeURIComponent(selectedCompetencia)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao gerar exportação nominal.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Extrato_Nominal_Restrito_${selectedUnidade}_${selectedCompetencia}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || "Erro ao baixar arquivo nominal.");
    } finally {
      setIsExportingNominal(false);
    }
  };

  // Retificação de Titular
  const handleSaveEditTitular = async () => {
    if (!editingRespondent) return;
    setIsSavingTitular(true);
    try {
      const res = await fetch("/api/admin/titulares", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRespondent.id,
          nomeCompleto: editForm.nomeCompleto,
          matricula: editForm.matricula,
          unidade: editForm.unidade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar titular.");

      alert("Dados do titular retificados com sucesso.");
      setEditingRespondent(null);
      fetchRespondents(searchQuery);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingTitular(false);
    }
  };

  // Exclusão de Titular
  const handleConfirmDeleteTitular = async () => {
    if (!deletingRespondent) return;
    setIsSavingTitular(true);
    try {
      const res = await fetch("/api/admin/titulares", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingRespondent.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir titular.");

      alert(data.message);
      setDeletingRespondent(null);
      fetchRespondents(searchQuery);
      fetchSummary();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingTitular(false);
    }
  };

  // Revogação de categoria específica
  const handleRevokeConsent = async (respondentId: string, categoria: string) => {
    if (!confirm(`Deseja realmente revogar o consentimento para a categoria '${categoria}'? O dado sensível será apagado.`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/titulares/consent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondentId, categoria }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchRespondents(searchQuery);
      fetchSummary();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Se verificando sessão
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
        <Header showAdminLink={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-premier-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
        <Header showAdminLink={false} />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="bg-[#180B38] p-4 rounded-2xl flex items-center justify-center shadow-inner">
                <PremierLogo className="h-14 w-auto" />
              </div>
              <h2 className="text-xl font-bold text-premier-primary font-heading">
                Painel Administrativo & D&I
              </h2>
              <p className="text-xs text-slate-500">
                Acesse com sua senha de perfil (RH Agregado ou Administrador Master LGPD).
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  id="admin-password-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-premier-secondary/30 focus:border-premier-secondary"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>• <strong>RH Agregado:</strong> Acesso a indicadores e Extrato de Diversidade consolidado.</p>
                <p>• <strong>RH Administrador:</strong> Acesso nominal, gestão de titulares e trilha de auditoria.</p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                id="admin-login-button"
                disabled={isLoggingIn}
                className="w-full bg-premier-primary hover:bg-premier-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Painel</span>
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
  const calcPct = (qtd: number) =>
    totalResp > 0 ? ((qtd / totalResp) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
      <Header showAdminLink={false} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Barra Superior */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Painel de Gestão
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consolidação quantitativa, indicadores gráficos e relatórios oficiais (.xlsx).
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={fetchSummary}
              disabled={isLoadingSummary}
              title="Atualizar dados"
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingSummary ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              type="button"
              id="export-excel-button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Extrato (.xlsx)</span>
                </>
              )}
            </button>

            {userRole === "rh_administrador" && (
              <button
                type="button"
                id="export-nominal-button"
                onClick={handleExportNominalExcel}
                disabled={isExportingNominal}
                title="Exportar base nominal restrita com dados de titulares"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isExportingNominal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Base Nominal (.xlsx)</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Sair"
              className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas de Navegação (se rh_administrador) */}
        {userRole === "rh_administrador" && (
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("consolidado")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "consolidado"
                  ? "bg-premier-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Extrato Consolidado</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("titulares")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "titulares"
                  ? "bg-premier-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Direitos dos Titulares (LGPD Art. 18)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("auditoria")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "auditoria"
                  ? "bg-premier-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Trilha de Auditoria</span>
            </button>
          </div>
        )}

        {/* ABA 1: CONSOLIDADO */}
        {activeTab === "consolidado" && (
          <div className="space-y-6">
            {/* Barra de Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-premier-secondary" />
                  <span>Filtrar por Unidade</span>
                </label>
                <select
                  value={selectedUnidade}
                  onChange={(e) => setSelectedUnidade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-premier-secondary/30"
                >
                  <option value="todas">Todas as Unidades (Consolidado)</option>
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-premier-secondary" />
                  <span>Filtrar por Competência</span>
                </label>
                <select
                  value={selectedCompetencia}
                  onChange={(e) => setSelectedCompetencia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-premier-secondary/30"
                >
                  <option value="todas">Todas as Competências (Histórico Geral)</option>
                  {availableCompetencias.map((comp) => (
                    <option key={comp} value={comp}>
                      {formatCompetencia(comp)} ({comp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex items-center justify-end gap-3 pt-2 sm:pt-0">
                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Respondentes no filtro:</span>
                  <span className="text-lg font-extrabold text-premier-primary">
                    {totalResp}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerta de K-Anonimato */}
            {kAnonymityAlert && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="font-bold">Aviso de Anonimização (k-anonimato):</strong>
                  <p>
                    A unidade selecionada possui menos de 5 respondentes no período ({totalResp} registros).
                    Para preservar a privacidade e evitar identificação indireta de colaboradores, utilize o
                    relatório <strong>Consolidado Geral</strong> para divulgações externas.
                  </p>
                </div>
              </div>
            )}

            {/* Gráficos de Distribuição com DiversityCharts */}
            <DiversityCharts summary={summary} />

            {/* Link Único de Envio para os Colaboradores */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200 space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Link Único de Envio (Todos os Colaboradores)
                </h3>
                <p className="text-xs text-slate-500">
                  Envie este link corporativo único para todos os colaboradores da Premier Logistics. Cada colaborador seleciona sua respectiva filial na 1ª etapa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? window.location.origin
                      : ""
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.origin);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="px-4 py-2.5 bg-[#180B38] hover:bg-[#281458] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: DIREITOS DOS TITULARES (LGPD Art. 18) */}
        {activeTab === "titulares" && userRole === "rh_administrador" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-premier-primary flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-premier-secondary" />
                    <span>Gestão de Solicitações e Direitos dos Titulares (LGPD Art. 18)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Consulte registros nominais por Nome ou CPF, processe retificações, revogações parciais ou exclusões definitivas.
                  </p>
                </div>
              </div>

              {/* Barra de Busca */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por Nome Completo ou CPF (digite os números)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-premier-secondary/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchRespondents(searchQuery)}
                  className="px-4 py-2.5 bg-premier-secondary hover:bg-premier-primary text-white text-xs font-bold rounded-xl transition-all"
                >
                  Buscar
                </button>
              </div>

              {/* Tabela de Titulares */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nome do Titular</th>
                      <th className="p-3">CPF</th>
                      <th className="p-3">Unidade</th>
                      <th className="p-3">Matrícula</th>
                      <th className="p-3">Data Envio</th>
                      <th className="p-3">Consentimentos Ativos</th>
                      <th className="p-3 text-right">Ações LGPD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isLoadingRespondents ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Carregando dados dos titulares...
                        </td>
                      </tr>
                    ) : respondents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Nenhum titular localizado com o termo pesquisado.
                        </td>
                      </tr>
                    ) : (
                      respondents.map((r) => {
                        const activeConsents = r.consents.filter((c) => c.aceito);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{r.nomeCompleto}</td>
                            <td className="p-3 font-mono text-slate-700">{r.cpf || r.cpfMascarado}</td>
                            <td className="p-3">{r.unidade}</td>
                            <td className="p-3 text-slate-500">{r.matricula || "-"}</td>
                            <td className="p-3 text-slate-500">
                              {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {r.consents.map((c) => (
                                  <span
                                    key={c.id}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                      c.aceito
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-rose-50 text-rose-600 border border-rose-200 line-through"
                                    }`}
                                  >
                                    {c.categoria}
                                    {c.aceito && (
                                      <button
                                        type="button"
                                        title={`Revogar consentimento para ${c.categoria}`}
                                        onClick={() => handleRevokeConsent(r.id, c.categoria)}
                                        className="text-rose-500 hover:text-rose-700 ml-0.5"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  title="Retificar dados cadastrais"
                                  onClick={() => {
                                    setEditingRespondent(r);
                                    setEditForm({
                                      nomeCompleto: r.nomeCompleto,
                                      matricula: r.matricula || "",
                                      unidade: r.unidade,
                                    });
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-all"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Excluir titular (Art. 18 LGPD)"
                                  onClick={() => setDeletingRespondent(r)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: TRILHA DE AUDITORIA */}
        {activeTab === "auditoria" && userRole === "rh_administrador" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-premier-primary flex items-center gap-2">
                    <History className="w-5 h-5 text-premier-secondary" />
                    <span>Trilha de Auditoria de Acessos & Operações Sensíveis</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registro cronológico de todas as consultas individuais, exportações e alterações realizadas no sistema.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar Logs
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Data e Hora</th>
                      <th className="p-3">Usuário / Perfil</th>
                      <th className="p-3">Ação</th>
                      <th className="p-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isLoadingLogs ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          Carregando trilha de auditoria...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          Nenhum registro de auditoria encontrado.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{log.userId}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px] border border-slate-300">
                              {log.acao}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{log.detalhe || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RETIFICAÇÃO */}
        {editingRespondent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-bold text-premier-primary flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Retificar Dados do Titular</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingRespondent(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={editForm.nomeCompleto}
                    onChange={(e) => setEditForm({ ...editForm, nomeCompleto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={editForm.unidade}
                    onChange={(e) => setEditForm({ ...editForm, unidade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula (TOTVS RM)</label>
                  <input
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => setEditForm({ ...editForm, matricula: e.target.value })}
                    placeholder="Opcional..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRespondent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditTitular}
                  disabled={isSavingTitular}
                  className="px-4 py-2 rounded-lg bg-premier-primary text-white text-xs font-bold hover:bg-premier-primary-dark"
                >
                  {isSavingTitular ? "Salvando..." : "Salvar Retificação"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE EXCLUSÃO DEFINITIVA */}
        {deletingRespondent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn border-2 border-rose-200">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="text-base font-bold">Excluir Registro de Titular (LGPD)</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Você está prestes a processar a exclusão definitiva da identificação de{" "}
                <strong className="text-slate-900">{deletingRespondent.nomeCompleto}</strong> (CPF: {deletingRespondent.cpfMascarado}).
              </p>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <strong>Importante sobre Governança:</strong>
                <p>
                  Os dados de identificação serão apagados permanentemente. O registro quantitativo
                  será desvinculado e mantido 100% anonimizado para não distorcer o histórico de indicadores já apurados.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDeletingRespondent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTitular}
                  disabled={isSavingTitular}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  {isSavingTitular ? "Excluindo..." : "Confirmar Exclusão Definitiva"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
