"use client";

import React from "react";
import { RACAS_CORES } from "@/lib/constants";
import { OptionCard } from "../OptionCard";
import { AlertCircle } from "lucide-react";

interface Step2RaceProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Step2Race: React.FC<Step2RaceProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Raça ou Cor <span className="text-rose-500">*</span>
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            Preenchimento Obrigatório
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Selecione sua cor ou raça conforme autodeclaração (classificação oficial do IBGE).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {RACAS_CORES.map((r) => (
          <OptionCard
            key={r.value}
            idPrefix="racaCor"
            label={r.label}
            value={r.value}
            selectedValue={value}
            onChange={onChange}
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2 mt-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
