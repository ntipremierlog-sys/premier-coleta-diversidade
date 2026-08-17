"use client";

import React from "react";
import { UNIDADES, formatCompetencia } from "@/lib/constants";

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
  onUpdate,
  error,
}) => {
  return (
    <div className="space-y-6">
      {/* Título e Texto Direto - Sem caixas coloridas */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Autodeclaração de Diversidade
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Pesquisa interna para atualização cadastral e fortalecimento dos programas de inclusão da Premier Logistics.
        </p>
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
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}
    </div>
  );
};
