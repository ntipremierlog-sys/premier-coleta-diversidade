"use client";

import React from "react";
import { OPCOES_SIM_NAO } from "@/lib/constants";
import { OptionCard } from "../OptionCard";

interface Step3PcdProps {
  pcd: string;
  pcdTipo: string;
  onUpdate: (fields: { pcd?: string; pcdTipo?: string }) => void;
  error?: string;
}

export const Step3Pcd: React.FC<Step3PcdProps> = ({
  pcd,
  pcdTipo,
  onUpdate,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Pessoa com Deficiência (PcD)
        </h2>
        <p className="text-sm text-slate-500">
          Você se considera uma Pessoa com Deficiência (PcD)?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {OPCOES_SIM_NAO.map((op) => (
          <OptionCard
            key={op.value}
            idPrefix="pcd"
            label={op.label}
            value={op.value}
            selectedValue={pcd}
            onChange={(val) => onUpdate({ pcd: val })}
          />
        ))}
      </div>

      {pcd === "sim" && (
        <div className="pt-2 space-y-1.5 animate-fadeIn">
          <label className="block text-xs font-semibold text-slate-700">
            Qual o tipo de deficiência? (Opcional)
          </label>
          <input
            type="text"
            value={pcdTipo}
            onChange={(e) => onUpdate({ pcdTipo: e.target.value })}
            placeholder="Ex: Física, Auditiva, Visual, Múltipla..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-semibold mt-2">{error}</p>
      )}
    </div>
  );
};
