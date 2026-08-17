"use client";

import React from "react";
import { RACAS_CORES } from "@/lib/constants";
import { OptionCard } from "../OptionCard";

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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Raça ou Cor
        </h2>
        <p className="text-sm text-slate-500">
          Qual sua cor ou raça, conforme autodeclaração (classificação do IBGE)?
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
        <p className="text-xs text-rose-500 font-semibold mt-2">{error}</p>
      )}
    </div>
  );
};
