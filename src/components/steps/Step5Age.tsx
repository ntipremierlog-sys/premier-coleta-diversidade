"use client";

import React from "react";
import { FAIXAS_ETARIAS } from "@/lib/constants";
import { OptionCard } from "../OptionCard";

interface Step5AgeProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Step5Age: React.FC<Step5AgeProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Faixa Etária
        </h2>
        <p className="text-sm text-slate-500">
          Em qual faixa etária você se encontra?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {FAIXAS_ETARIAS.map((f) => (
          <OptionCard
            key={f.value}
            idPrefix="faixaEtaria"
            label={f.label}
            value={f.value}
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
