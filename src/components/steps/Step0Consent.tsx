"use client";

import React, { useState } from "react";
import { UNIDADES, formatCompetencia } from "@/lib/constants";
import { TermoEsclarecimentosModal } from "../TermoEsclarecimentosModal";
import { FileText, CheckCircle2, AlertCircle, Download, ExternalLink, ShieldCheck } from "lucide-react";

interface Step0ConsentProps {
  unidade: string;
  competencia: string;
  termoConsentimento: boolean;
  onUpdate: (fields: {
    unidade?: string;
    competencia?: string;
    termoConsentimento?: boolean;
  }) => void;
  error?: string;
}

export const Step0Consent: React.FC<Step0ConsentProps> = ({
  unidade,
  competencia,
  termoConsentimento,
  onUpdate,
  error,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Título e Texto Direto */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Autodeclaração de Diversidade
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Pesquisa interna para atualização cadastral e fortalecimento dos programas de inclusão da Premier Logistics.
        </p>
      </div>

      {/* Card Obrigatoriedade do Termo de Esclarecimentos */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          termoConsentimento
            ? "border-emerald-300 bg-emerald-50/40"
            : "border-amber-300 bg-amber-50/50 shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl text-white shrink-0 ${
                termoConsentimento ? "bg-emerald-600" : "bg-[#180B38]"
              }`}
            >
              {termoConsentimento ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Termo de Esclarecimentos
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    termoConsentimento
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {termoConsentimento ? "Lido e Aceito" : "Leitura Obrigatória"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Antes de iniciar, você deve abrir, ler e aceitar o Termo de Esclarecimentos oficial da Autodeclaração.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Ação do Termo */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-start">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              termoConsentimento
                ? "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                : "bg-[#180B38] hover:bg-[#281458] text-white shadow-md"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{termoConsentimento ? "Revisar Termo Lido" : "Abrir e Ler Termo de Esclarecimentos"}</span>
          </button>
        </div>
      </div>

      {/* Seleção de Unidade / Filial */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Unidade / Filial <span className="text-rose-500">*</span>
        </label>
        <select
          id="unidade-select"
          value={unidade}
          onChange={(e) => onUpdate({ unidade: e.target.value })}
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
        >
          <option value="">Selecione sua unidade ou filial...</option>
          {UNIDADES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Competência de Referência */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Competência
        </label>
        <input
          type="text"
          id="competencia-input"
          value={formatCompetencia(competencia)}
          disabled
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 font-medium cursor-not-allowed"
        />
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal do Termo */}
      <TermoEsclarecimentosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={() => onUpdate({ termoConsentimento: true })}
        isAccepted={termoConsentimento}
      />
    </div>
  );
};
